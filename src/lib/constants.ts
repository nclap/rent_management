export const PRICING = {
  ELECTRICITY_PER_KWH: 3500,
  SANITATION_WIFI: 70000,
};

// Hàm tính tiền nước dựa trên số người
export const calculateWaterCost = (numberOfMembers: number): number => {
  if (numberOfMembers <= 0) return 0;
  if (numberOfMembers === 1) return 50000;
  if (numberOfMembers === 2) return 95000;

  return 50000;
};
