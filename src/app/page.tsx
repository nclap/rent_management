"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { House, Room } from "@/types/database";
import { PRICING, calculateWaterCost } from "@/lib/constants";
import * as htmlToImage from "html-to-image";

export default function CalculateBillPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  
  const [selectedHouseId, setSelectedHouseId] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [currentElectric, setCurrentElectric] = useState<string>("");
  
  const [showReceipt, setShowReceipt] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    const { data } = await supabase.from("houses").select("*").order("created_at", { ascending: false });
    if (data) setHouses(data);
  };

  const fetchRooms = async (houseId: string) => {
    const { data } = await supabase.from("rooms").select("*").eq("house_id", houseId).order("name");
    if (data) setRooms(data);
  };

  const handleHouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const houseId = e.target.value;
    setSelectedHouseId(houseId);
    setSelectedRoom(null);
    setShowReceipt(false);
    if (houseId) {
      fetchRooms(houseId);
    } else {
      setRooms([]);
    }
  };

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roomId = e.target.value;
    const room = rooms.find(r => r.id === roomId) || null;
    setSelectedRoom(room);
    setShowReceipt(false);
  };

  const handlePrint = () => {
    if (!selectedRoom || !currentElectric) return;
    const currentElecNum = parseInt(currentElectric, 10);
    if (currentElecNum < selectedRoom.latest_electric_number) {
      alert("Số điện hiện tại phải lớn hơn hoặc bằng số điện tháng trước!");
      return;
    }
    setShowReceipt(true);
    setReceiptImage(null);
    
    // Scroll to receipt and generate image
    setTimeout(() => {
      receiptRef.current?.scrollIntoView({ behavior: 'smooth' });
      generateImage();
    }, 100);
  };

  const generateImage = () => {
    setTimeout(async () => {
      if (receiptRef.current) {
        try {
          const imgData = await htmlToImage.toPng(receiptRef.current, { quality: 1, pixelRatio: 2 });
          setReceiptImage(imgData);
        } catch (err) {
          console.error("Lỗi khi tạo ảnh hóa đơn:", err);
        }
      }
    }, 300);
  };

  const saveBill = async () => {
    if (isSaving || !selectedRoom || !currentElectric) return;
    setIsSaving(true);
    
    const currentElecNum = parseInt(currentElectric, 10);
    const totalAmount = selectedRoom.rent_cost + 
                  (currentElecNum - selectedRoom.latest_electric_number) * PRICING.ELECTRICITY_PER_KWH + 
                  calculateWaterCost(selectedRoom.number_of_members) + 
                  PRICING.SANITATION_WIFI;

    const { error: billError } = await supabase.from('monthly_bills').insert([{
       room_id: selectedRoom.id,
       month,
       year,
       electric_number: currentElecNum,
       total_amount: totalAmount,
       is_paid: false
    }]);

    if (billError) {
       if (billError.code === '23505') {
          alert('Hóa đơn phòng này trong tháng đã được lưu trước đó!');
       } else {
          alert('Lỗi lưu hóa đơn: ' + billError.message);
       }
       setIsSaving(false);
       return;
    }

    const { error: roomError } = await supabase.from('rooms')
      .update({ latest_electric_number: currentElecNum })
      .eq('id', selectedRoom.id);

    if (roomError) {
       alert('Đã lưu hóa đơn nhưng gặp lỗi khi cập nhật số điện phòng: ' + roomError.message);
    } else {
       alert('Lưu hóa đơn thành công!');
       if (selectedHouseId) fetchRooms(selectedHouseId);
       
       setSelectedRoom({
          ...selectedRoom,
          latest_electric_number: currentElecNum
       });
       
       setCurrentElectric("");
       setShowReceipt(false);
    }
    
    setIsSaving(false);
  };

  // Generate Year options
  const years = Array.from({ length: 25 }, (_, i) => 2026 + i);

  return (
    <div>
      <h2 style={{ marginBottom: "16px" }}>Tính hóa đơn</h2>
      
      <div className="card">
        <div className="form-group" style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Tháng</label>
            <select className="form-control" value={month} onChange={e => { setMonth(Number(e.target.value)); setShowReceipt(false); }}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">Năm</label>
            <select className="form-control" value={year} onChange={e => { setYear(Number(e.target.value)); setShowReceipt(false); }}>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Nhà trọ</label>
          <select className="form-control" value={selectedHouseId} onChange={handleHouseChange}>
            <option value="">-- Chọn nhà trọ --</option>
            {houses.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        {selectedHouseId && (
          <div className="form-group">
            <label className="form-label">Phòng trọ</label>
            <select className="form-control" value={selectedRoom?.id || ""} onChange={handleRoomChange}>
              <option value="">-- Chọn phòng trọ --</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        )}

        {selectedRoom && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '8px', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <strong>Thông tin phòng:</strong>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                <div>Số người: <strong>{selectedRoom.number_of_members}</strong></div>
                <div>Tiền phòng: <strong>{selectedRoom.rent_cost.toLocaleString()}đ</strong></div>
                <div style={{ gridColumn: 'span 2' }}>
                  Số điện tháng trước: <strong style={{ color: 'var(--primary-color)' }}>{selectedRoom.latest_electric_number}</strong>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Số điện hiện tại</label>
              <input 
                type="number" 
                className="form-control" 
                value={currentElectric} 
                onChange={e => { setCurrentElectric(e.target.value); setShowReceipt(false); }}
                placeholder="Nhập số điện trên đồng hồ"
              />
            </div>

            <button className="btn btn-primary" onClick={handlePrint} disabled={!currentElectric}>
              In hóa đơn
            </button>
          </div>
        )}
      </div>

      {showReceipt && selectedRoom && currentElectric && (
        <div style={{ marginTop: '24px' }}>
          {!receiptImage ? (
            <div 
              className="receipt" 
              ref={receiptRef}
              style={{
                 margin: '0',
                 padding: '24px',
                 background: 'white',
                 color: 'black'
              }}
            >
              <div className="receipt-header">
                <h3>HÓA ĐƠN TIỀN PHÒNG</h3>
                <p>Phòng: {selectedRoom.name}</p>
                <p>Tháng {month} / {year}</p>
              </div>
              
              <div className="receipt-body">
                <div className="receipt-row">
                  <span>Tiền phòng:</span>
                  <span>{selectedRoom.rent_cost.toLocaleString()} đ</span>
                </div>
                
                <div className="receipt-row" style={{ color: 'var(--text-secondary)' }}>
                  <span>Số điện cũ:</span>
                  <span>{selectedRoom.latest_electric_number}</span>
                </div>
                <div className="receipt-row" style={{ color: 'var(--text-secondary)' }}>
                  <span>Số điện mới:</span>
                  <span>{currentElectric}</span>
                </div>
                <div className="receipt-row">
                  <span>Tiền điện ({(Number(currentElectric) - selectedRoom.latest_electric_number)} ký x {PRICING.ELECTRICITY_PER_KWH.toLocaleString()}đ):</span>
                  <span>{((Number(currentElectric) - selectedRoom.latest_electric_number) * PRICING.ELECTRICITY_PER_KWH).toLocaleString()} đ</span>
                </div>
                
                <div className="receipt-row">
                  <span>Nước ({selectedRoom.number_of_members} người):</span>
                  <span>{calculateWaterCost(selectedRoom.number_of_members).toLocaleString()} đ</span>
                </div>
                
                <div className="receipt-row">
                  <span>Vệ sinh/Wifi:</span>
                  <span>{PRICING.SANITATION_WIFI.toLocaleString()} đ</span>
                </div>
                
                <div className="receipt-total receipt-row">
                  <span>TỔNG CỘNG:</span>
                  <span>
                    {(
                      selectedRoom.rent_cost + 
                      (Number(currentElectric) - selectedRoom.latest_electric_number) * PRICING.ELECTRICITY_PER_KWH + 
                      calculateWaterCost(selectedRoom.number_of_members) + 
                      PRICING.SANITATION_WIFI
                    ).toLocaleString()} đ
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                👆 Nhấn giữ vào ảnh hóa đơn để lưu về máy
              </p>
              <img 
                src={receiptImage} 
                alt="Hóa đơn" 
                style={{ width: '100%', maxWidth: '400px', display: 'block', margin: '0 auto', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }} 
              />
              
              <div style={{ marginTop: '24px' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={saveBill} 
                  disabled={isSaving}
                  style={{ border: '2px solid var(--primary-color)', color: 'var(--primary-color)' }}
                >
                  {isSaving ? "Đang lưu..." : "💾 Lưu vào lịch sử & Cập nhật số điện"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
