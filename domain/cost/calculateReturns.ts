type ReturnRecord = {
  product_id?: string;
  refund_amount: number;
  return_shipping_cost: number;
  restocking_cost: number;
};

type ProductReturnImpact = {
  productId: string;
  refundedRevenue: number;
  returnCosts: number;
  totalReturnImpact: number;
};

/*
 * Existing return calculation.
 *
 * Kept for compatibility with the existing
 * Product Profitability calculation.
 */
export function calculateReturnImpact(returnRecord: ReturnRecord) {
  return {
    refundedRevenue: returnRecord.refund_amount,
    returnCosts:
      returnRecord.return_shipping_cost + returnRecord.restocking_cost,
  };
}

/*
 * Product-level return calculation.
 */
export function calculateProductReturnImpact(
  productId: string,
  returns: ReturnRecord[],
): ProductReturnImpact {
  const productReturns = returns.filter(
    (returnRecord) => returnRecord.product_id === productId,
  );

  const result = productReturns.reduce(
    (total, returnRecord) => {
      const impact = calculateReturnImpact(returnRecord);

      return {
        refundedRevenue: total.refundedRevenue + impact.refundedRevenue,

        returnCosts: total.returnCosts + impact.returnCosts,
      };
    },
    {
      refundedRevenue: 0,
      returnCosts: 0,
    },
  );

  return {
    productId,
    refundedRevenue: result.refundedRevenue,
    returnCosts: result.returnCosts,
    totalReturnImpact: result.refundedRevenue + result.returnCosts,
  };
}

/*
 * Business-level return calculation.
 */
export function calculateTotalReturnImpact(returns: ReturnRecord[]) {
  return returns.reduce(
    (total, returnRecord) => {
      const impact = calculateReturnImpact(returnRecord);

      return {
        refundedRevenue: total.refundedRevenue + impact.refundedRevenue,

        returnCosts: total.returnCosts + impact.returnCosts,
      };
    },
    {
      refundedRevenue: 0,
      returnCosts: 0,
    },
  );
}
