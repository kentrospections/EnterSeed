/** Generate business-plan outlines locally without sending form data to the server. */
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function buildDocumentMarkup(data) {
  const title = data.documentType === "business-plan" ? "Business Plan" : "Feasibility Study";
  const sections = [
    ["1. Executive summary", "Describe the business opportunity, proposed product or service, and funding objective."],
    ["2. Business and product", `Business: ${data.businessName}. Product or service: ${data.description}.`],
    ["3. Market and customers", "Identify target customers, their needs, local demand, competitors, and the evidence supporting your assumptions."],
    ["4. Location and operations", `Proposed municipality: ${data.location}. Explain suppliers, staffing, production or service delivery, and operating requirements.`],
    ["5. Startup costs and funding", `Initial capital estimate: PHP ${Number(data.capital).toLocaleString("en-PH")}. Attach quotations and explain the proposed use of funds.`],
    ["6. Sales and financial assumptions", "Document prices, expected sales volume, operating costs, cash flow, break-even assumptions, and repayment capacity."],
    ["7. Risks and next steps", "List key risks, mitigation plans, supporting documents, and questions for your lender or adviser."]
  ];

  return `<h2>${title}: ${escapeHtml(data.businessName)}</h2><p><strong>Location:</strong> ${escapeHtml(data.location)} · <strong>Prepared:</strong> ${new Date().toLocaleDateString("en-PH")}</p><p class="document-warning">Working draft only. Confirm current lender requirements and replace every assumption with verified business information.</p>${sections.map(([heading, text]) => `<section><h3>${heading}</h3><p>${escapeHtml(text)}</p></section>`).join("")}<h3>Lender discussion checklist</h3><ul><li>Confirm current loan eligibility and required forms directly with the lender.</li><li>Request the current document checklist from your lending officer.</li><li>Validate projections and attach supporting records or supplier quotations.</li></ul>`;
}

const documentForm = document.querySelector("#document-form");
const documentOutput = document.querySelector("#document-output");
const previewActions = document.querySelector("#preview-actions");
const documentStyles = "body{max-width:800px;margin:40px auto;font:16px/1.6 sans-serif;color:#2B1C33}h2,h3{color:#4A1D8F}.document-warning{padding:12px;background:#FFF0E4}";
let latestDocument = "";

function createStandaloneDocument(content) {
  return `<!doctype html><meta charset="utf-8"><title>Enterseed business document</title><style>${documentStyles}</style>${content}`;
}

documentForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!documentForm.reportValidity()) return;
  latestDocument = buildDocumentMarkup(Object.fromEntries(new FormData(documentForm)));
  documentOutput.innerHTML = latestDocument;
  previewActions.hidden = false;
});

document.querySelector("#download-document")?.addEventListener("click", () => {
  if (!latestDocument) return;
  const blob = new Blob([createStandaloneDocument(latestDocument)], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: "enterseed-business-plan-outline.html" });
  link.click();
  URL.revokeObjectURL(url);
});

document.querySelector("#print-document")?.addEventListener("click", () => {
  if (!latestDocument) return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(createStandaloneDocument(latestDocument));
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
});
