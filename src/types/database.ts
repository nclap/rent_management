export type House = {
  id: string;
  name: string;
  address: string;
  created_at: string;
};

export type Room = {
  id: string;
  house_id: string;
  name: string;
  number_of_members: number;
  rent_cost: number;
  latest_electric_number: number;
  created_at: string;
};

export type MonthlyBill = {
  id: string;
  room_id: string;
  month: number;
  year: number;
  electric_number: number;
  total_amount: number;
  is_paid: boolean;
  created_at: string;
};
