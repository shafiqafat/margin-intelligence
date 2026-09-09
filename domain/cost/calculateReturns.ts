type ReturnRecord = {
  refund_amount: number;
  return_shipping_cost: number;
  restocking_cost: number;
};

export function calculateReturnImpact(returnRecord: ReturnRecord) {
  return {
    refundedRevenue: returnRecord.refund_amount,
    returnCosts:
      returnRecord.return_shipping_cost + returnRecord.restocking_cost,
  };
}

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
