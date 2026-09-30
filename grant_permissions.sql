-- Cấp quyền truy cập cho role anon (người dùng chưa đăng nhập, sử dụng anon key)
GRANT ALL ON TABLE houses TO anon;
GRANT ALL ON TABLE rooms TO anon;
GRANT ALL ON TABLE monthly_bills TO anon;

-- Cấp quyền truy cập cho role authenticated (người dùng đã đăng nhập)
GRANT ALL ON TABLE houses TO authenticated;
GRANT ALL ON TABLE rooms TO authenticated;
GRANT ALL ON TABLE monthly_bills TO authenticated;

-- (Tùy chọn) Nếu bạn đã bật RLS, hãy chạy thêm các lệnh sau để cho phép tất cả mọi người thao tác:
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép tất cả truy cập houses" ON houses FOR ALL USING (true);
CREATE POLICY "Cho phép tất cả truy cập rooms" ON rooms FOR ALL USING (true);
CREATE POLICY "Cho phép tất cả truy cập monthly_bills" ON monthly_bills FOR ALL USING (true);
