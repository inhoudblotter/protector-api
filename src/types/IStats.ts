export interface IStats {
  numberOfCompletedOrders: number;
  profit: number;
  groupDistribution: { label: string; value: number }[];
  workLoad: {
    daily: { hour: number; value: number }[];
    weekly?: { day: number; value: number }[];
    annual?: { month: number; value: number }[];
  };
}
