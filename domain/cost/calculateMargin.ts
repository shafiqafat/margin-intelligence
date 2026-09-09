export function calculateContributionMargin(
  contribution: number,
  revenue: number,
) {
  if (revenue <= 0) {
    return 0;
  }

  return (contribution / revenue) * 100;
}
