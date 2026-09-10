import type { InsightFinding } from "@/types/intelligence";

export function generateInsightExplanation(
  finding: InsightFinding,
  relatedFindings: InsightFinding[] = [],
) {
  const related = relatedFindings.filter(
    (item) =>
      item.productId === finding.productId && item.type !== finding.type,
  );

  const supportingSignals =
    related.length > 0
      ? related.map((item) => `${item.title}.`).join(" ")
      : null;

  switch (finding.type) {
    case "low_margin":
      return buildLowMarginExplanation(finding, supportingSignals);

    case "cost_increase":
      return buildCostIncreaseExplanation(finding, supportingSignals);

    case "return_anomaly":
      return buildReturnExplanation(finding, supportingSignals);

    case "supplier_opportunity":
      return buildSupplierOpportunityExplanation(finding, supportingSignals);

    case "supplier_issue":
      return buildSupplierIssueExplanation(finding, supportingSignals);

    default:
      return finding.description;
  }
}

function buildLowMarginExplanation(
  finding: InsightFinding,
  supportingSignals: string | null,
) {
  const why = supportingSignals
    ? `Possible contributing signals: ${supportingSignals}`
    : "The product is generating less contribution than the business target.";

  const action =
    "Review the product's purchase costs, direct costs, selling price, and recent returns.";

  return `${finding.description} ${why} What to investigate: ${action}`;
}

function buildCostIncreaseExplanation(
  finding: InsightFinding,
  supportingSignals: string | null,
) {
  const why = supportingSignals
    ? `Related signals: ${supportingSignals}`
    : "Recent purchase costs are higher than the product's earlier cost pattern.";

  const action =
    "Review recent supplier prices and compare them with earlier purchases.";

  return `${finding.description} ${why} What to investigate: ${action}`;
}

function buildReturnExplanation(
  finding: InsightFinding,
  supportingSignals: string | null,
) {
  const why = supportingSignals
    ? `Related signals: ${supportingSignals}`
    : "The product's return activity is materially higher than the business baseline.";

  const action =
    "Review return reasons and determine whether product quality, sizing, delivery, or customer expectations are contributing.";

  return `${finding.description} ${why} What to investigate: ${action}`;
}

function buildSupplierOpportunityExplanation(
  finding: InsightFinding,
  supportingSignals: string | null,
) {
  const why = supportingSignals
    ? `Related signals: ${supportingSignals}`
    : "Historical purchase data indicates another supplier may offer a lower acquisition cost.";

  const action =
    "Compare supplier quality, minimum order quantities, shipping, and payment terms before switching.";

  return `${finding.description} ${why} What to investigate: ${action}`;
}

function buildSupplierIssueExplanation(
  finding: InsightFinding,
  supportingSignals: string | null,
) {
  const why = supportingSignals
    ? `Related signals: ${supportingSignals}`
    : "Recent purchases from this supplier are materially more expensive than earlier purchases.";

  const action =
    "Review recent supplier pricing and confirm whether the increase is temporary or persistent.";

  return `${finding.description} ${why} What to investigate: ${action}`;
}
