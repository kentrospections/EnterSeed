/** Render the overview from the account's saved assessment, without sample KPIs. */
const dashboardSummary = document.querySelector("#dashboard-finance-summary");

async function loadDashboardSummary() {
  if (!dashboardSummary) return;
  try {
    const response = await window.EnterseedApi.request("/api/finance/assessment", {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      cache: "no-store"
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not load the saved finance assessment.");
    if (!result.assessment) {
      dashboardSummary.dataset.state = "empty";
      return;
    }
    const assessment = result.assessment;
    const format = (amount) => new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0
    }).format(amount);
    const profit = assessment.monthlyIncome - assessment.monthlyExpenses;
    const coverageCosts = assessment.monthlyExpenses + assessment.monthlyDebtPayment;
    const coverage = coverageCosts > 0
      ? `${(assessment.cashOnHand / coverageCosts).toFixed(1)} months`
      : "Not available";
    dashboardSummary.querySelector("[data-summary-income]").textContent = format(assessment.monthlyIncome);
    dashboardSummary.querySelector("[data-summary-profit]").textContent = format(profit);
    dashboardSummary.querySelector("[data-summary-cash]").textContent = coverage;
    dashboardSummary.dataset.state = "saved";
  } catch (error) {
    console.error("Dashboard finance summary failed to load.", error);
    dashboardSummary.dataset.state = "error";
  }
}

void loadDashboardSummary();
