import { getSupplierCostSignals } from "@/lib/services/supplierCostSignals";
import { getProductListData } from "@/lib/services/productList";

export async function getSupplierCostImpact(
  businessId: string,
  supplierId: string,
) {
  const [signals, products] = await Promise.all([
    getSupplierCostSignals(businessId, supplierId),
    getProductListData(businessId),
  ]);

  return signals.map((signal) => {
    const product = products.find((item) => item.id === signal.productId);

    const profitability = product?.profitability ?? null;

    const unitCostChange = signal.latestUnitCost - signal.previousUnitCost;

    const estimatedCostPressure = unitCostChange > 0 ? unitCostChange * 1 : 0;

    return {
      ...signal,
      unitCostChange,
      estimatedCostPressure,
      contributionMargin: profitability?.contributionMargin ?? null,
      targetMargin: product?.target_margin ?? null,
      netRevenue: profitability?.netRevenue ?? 0,
      isBelowTarget:
        profitability !== null &&
        profitability.netRevenue > 0 &&
        profitability.contributionMargin < product!.target_margin,
    };
  });
}
