-- Bảng Nhà trọ (houses)
CREATE TABLE houses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  address text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bảng Phòng trọ (rooms)
CREATE TABLE rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  house_id uuid REFERENCES houses(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  number_of_members integer DEFAULT 0 NOT NULL,
  rent_cost numeric NOT NULL,
  latest_electric_number integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bảng Hóa đơn hàng tháng (monthly_bills)
CREATE TABLE monthly_bills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  electric_number integer NOT NULL, -- Số điện ghi nhận trong tháng
  total_amount numeric NOT NULL, -- Tổng tiền thanh toán (bạn gọi là summary)
  is_paid boolean DEFAULT false NOT NULL, -- Trạng thái thanh toán (đề xuất thêm)
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Đảm bảo mỗi phòng chỉ có tối đa 1 hóa đơn cho 1 tháng cụ thể trong năm
  UNIQUE(room_id, month, year)
);

-- (Tùy chọn) Bật RLS (Row Level Security) để bảo mật nếu sau này bạn cần public
-- ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE monthly_bills ENABLE ROW LEVEL SECURITY;
