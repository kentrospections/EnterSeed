/** Account-scoped finance assessment and estimate-only practice-set summaries. */
const financeForm = document.querySelector("#finance-form");
const financeStatus = document.querySelector("#finance-status");
const financeDelete = document.querySelector("#finance-delete");
const financeReport = document.querySelector("#finance-report");
const financeReportValues = document.querySelector("#finance-report-values");
const financeRecommendations = document.querySelector("#finance-recommendations");
const financeOutputSummary = document.querySelector("#finance-output-summary");

const financeFieldNames = [
  "monthlyIncome", "monthlyExpenses", "cashOnHand", "debtOutstanding",
  "monthlyDebtPayment", "otherAssets", "otherLiabilities"
];
let savedAssessment = false;
let financeStatusKey = "";

function financeMessage(key, values = {}) {
  return window.EnterseedI18n.t(`finance.${key}`, values);
}

function setFinanceStatus(message, isError = false, key = "") {
  financeStatus.textContent = message;
  financeStatus.classList.toggle("is-error", isError);
  financeStatus.classList.toggle("is-success", !isError && Boolean(message));
  financeStatusKey = key;
}

function readFormValues() {
  const formData = new FormData(financeForm);
  const result = {};
  for (const name of financeFieldNames) {
    const raw = String(formData.get(name) ?? "");
    if (!raw.trim()) throw new Error(financeMessage("amountRequired"));
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value < 0 || value > 1_000_000_000) {
      throw new Error(financeMessage("amountInvalid"));
    }
    result[name] = value;
  }
  result.taxStanding = String(formData.get("taxStanding") || "");
  result.consent = formData.get("consent") === "on";
  if (!result.consent) throw new Error(financeMessage("consentRequired"));
  return result;
}

async function requestFinance(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}) },
    ...options
  });
  if (response.status === 204) return null;
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || financeMessage("error"));
  return result;
}

function formatPesos(amount) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(amount);
}

function addMetric(label, value) {
  const item = document.createElement("article");
  item.className = "finance-report-metric";
  const title = document.createElement("span");
  title.textContent = label;
  const amount = document.createElement("strong");
  amount.textContent = value;
  item.append(title, amount);
  financeReportValues.append(item);
}

function addRecommendation(titleKey, message) {
  const card = document.createElement("article");
  card.className = "recommendation-card";
  const title = document.createElement("h3");
  title.textContent = financeMessage(titleKey);
  const copy = document.createElement("p");
  copy.textContent = message;
  card.append(title, copy);
  financeRecommendations.append(card);
}

function addReportSummary(titleKey, lines) {
  const card = document.createElement("article");
  card.className = "finance-output-card";
  const title = document.createElement("h3");
  title.textContent = financeMessage(titleKey);
  const list = document.createElement("dl");
  lines.forEach(([label, amount]) => {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = amount;
    row.append(term, description);
    list.append(row);
  });
  card.append(title, list);
  financeOutputSummary.append(card);
}

function renderAssessment(assessment) {
  const operatingProfit = assessment.monthlyIncome - assessment.monthlyExpenses;
  const monthlyOutflow = assessment.monthlyExpenses + assessment.monthlyDebtPayment;
  const cashMonths = monthlyOutflow > 0 ? assessment.cashOnHand / monthlyOutflow : null;
  const estimatedAssets = assessment.cashOnHand + assessment.otherAssets;
  const estimatedLiabilities = assessment.debtOutstanding + assessment.otherLiabilities;
  const estimatedEquity = estimatedAssets - estimatedLiabilities;
  const postDebtCashEstimate = operatingProfit - assessment.monthlyDebtPayment;

  financeReportValues.replaceChildren();
  financeRecommendations.replaceChildren();
  financeOutputSummary.replaceChildren();
  financeReport.hidden = false;

  addMetric(financeMessage("monthlyIncome"), formatPesos(assessment.monthlyIncome));
  addMetric(financeMessage("operatingExpenses"), formatPesos(assessment.monthlyExpenses));
  addMetric(financeMessage("operatingProfit"), formatPesos(operatingProfit));
  addMetric(financeMessage("cashBuffer"), cashMonths === null ? "—" : financeMessage("monthsValue", { months: cashMonths.toFixed(1) }));
  addMetric(financeMessage("debtBalance"), formatPesos(assessment.debtOutstanding));
  addMetric(financeMessage("totalAssets"), formatPesos(estimatedAssets));
  addMetric(financeMessage("totalLiabilities"), formatPesos(estimatedLiabilities));
  addMetric(financeMessage("estimatedEquity"), formatPesos(estimatedEquity));

  if (operatingProfit <= 0) {
    addRecommendation("cashManagement", financeMessage("negativeCash"));
  } else if (cashMonths !== null && cashMonths < 1) {
    addRecommendation("cashManagement", financeMessage("lowBuffer"));
  } else if (cashMonths !== null) {
    addRecommendation("cashManagement", financeMessage("reserve", { months: cashMonths.toFixed(1) }));
  } else {
    addRecommendation("cashManagement", financeMessage("positiveCash"));
  }

  if (assessment.debtOutstanding === 0) {
    addRecommendation("debtManagement", financeMessage("noDebt"));
  } else if (assessment.monthlyDebtPayment > Math.max(operatingProfit, 0) * 0.3) {
    addRecommendation("debtManagement", financeMessage("highDebt"));
  } else {
    addRecommendation("debtManagement", financeMessage("debtReview"));
  }

  const taxMessages = {
    current: "taxCurrent",
    "needs-filing": "taxDue",
    behind: "taxBehind",
    "not-registered": "taxNotRegistered"
  };
  addRecommendation("taxCompliance", financeMessage(taxMessages[assessment.taxStanding]));
  addRecommendation("investment", financeMessage(
    operatingProfit > 0 && cashMonths !== null && cashMonths >= 3 && postDebtCashEstimate > 0
      ? "investmentReady"
      : "investmentWait"
  ));

  addReportSummary("reportProfitLoss", [
    [financeMessage("monthlyIncome"), formatPesos(assessment.monthlyIncome)],
    [financeMessage("operatingExpenses"), formatPesos(assessment.monthlyExpenses)],
    [financeMessage("operatingProfit"), formatPesos(operatingProfit)]
  ]);
  addReportSummary("reportBalanceSheet", [
    [financeMessage("totalAssets"), formatPesos(estimatedAssets)],
    [financeMessage("totalLiabilities"), formatPesos(estimatedLiabilities)],
    [financeMessage("estimatedEquity"), formatPesos(estimatedEquity)]
  ]);
  addReportSummary("reportCashFlow", [
    [financeMessage("operatingProfit"), formatPesos(operatingProfit)],
    [financeMessage("debtPayment"), formatPesos(assessment.monthlyDebtPayment)],
    [financeMessage("cashFlowAfterDebt"), formatPesos(postDebtCashEstimate)]
  ]);

  const practiceSetNote = document.createElement("p");
  practiceSetNote.className = "finance-practice-note";
  practiceSetNote.textContent = financeMessage("financialReports");
  financeOutputSummary.append(practiceSetNote);
  financeDelete.hidden = false;
}

function populateForm(assessment) {
  for (const name of financeFieldNames) {
    financeForm.elements.namedItem(name).value = String(assessment[name]);
  }
  financeForm.elements.namedItem("taxStanding").value = assessment.taxStanding;
  financeForm.elements.namedItem("consent").checked = true;
}

async function loadAssessment() {
  setFinanceStatus(financeMessage("loading"));
  try {
    const { assessment } = await requestFinance("/api/finance/assessment");
    if (assessment) {
      savedAssessment = true;
      populateForm(assessment);
      renderAssessment(assessment);
      setFinanceStatus("");
    } else {
      financeReport.hidden = true;
      financeDelete.hidden = true;
      setFinanceStatus(financeMessage("empty"), false, "empty");
    }
  } catch (error) {
    setFinanceStatus(error.message || financeMessage("error"), true);
  }
}

financeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFinanceStatus("");
  if (!financeForm.reportValidity()) return;
  const button = financeForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const assessment = readFormValues();
    await requestFinance("/api/finance/assessment", {
      method: "PUT",
      body: JSON.stringify(assessment)
    });
    savedAssessment = true;
    renderAssessment(assessment);
    setFinanceStatus(financeMessage("saved"), false, "saved");
  } catch (error) {
    setFinanceStatus(error.message || financeMessage("error"), true);
  } finally {
    button.disabled = false;
  }
});

financeDelete.addEventListener("click", async () => {
  financeDelete.disabled = true;
  try {
    await requestFinance("/api/finance/assessment", { method: "DELETE" });
    financeForm.reset();
    financeReport.hidden = true;
    financeDelete.hidden = true;
    savedAssessment = false;
    setFinanceStatus(financeMessage("deleted"), false, "deleted");
  } catch (error) {
    setFinanceStatus(error.message || financeMessage("error"), true);
  } finally {
    financeDelete.disabled = false;
  }
});

document.addEventListener("enterseed:languagechange", () => {
  if (financeStatusKey) setFinanceStatus(financeMessage(financeStatusKey), false, financeStatusKey);
  if (savedAssessment && !financeReport.hidden) {
    const values = Object.fromEntries(financeFieldNames.map((name) => [
      name, Number(financeForm.elements.namedItem(name).value)
    ]));
    values.taxStanding = financeForm.elements.namedItem("taxStanding").value;
    renderAssessment(values);
  }
});

window.EnterseedAuthReady?.then((isAuthenticated) => {
  if (isAuthenticated) void window.EnterseedI18n.ready.then(loadAssessment);
});
