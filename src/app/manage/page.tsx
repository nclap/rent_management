"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { House, Room } from "@/types/database";

type Tab = "house" | "room";

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState<Tab>("house");

  const [houses, setHouses] = useState<House[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  // House Form State
  const [selectedHouseId, setSelectedHouseId] = useState<string>("new");
  const [houseName, setHouseName] = useState("");
  const [houseAddress, setHouseAddress] = useState("");

  // Room Form State
  const [selectedRoomId, setSelectedRoomId] = useState<string>("new");
  const [roomHouseId, setRoomHouseId] = useState<string>("");
  const [roomName, setRoomName] = useState("");
  const [roomMembers, setRoomMembers] = useState<number>(1);
  const [roomRent, setRoomRent] = useState<number>(0);
  const [roomElectric, setRoomElectric] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchHouses();
    fetchRooms();
  }, []);

  const fetchHouses = async () => {
    const { data } = await supabase.from("houses").select("*").order("created_at", { ascending: false });
    if (data) setHouses(data);
  };

  const fetchRooms = async () => {
    const { data } = await supabase.from("rooms").select("*").order("name");
    if (data) setRooms(data);
  };

  // House Handlers
  const handleSelectHouse = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedHouseId(id);
    if (id === "new") {
      setHouseName("");
      setHouseAddress("");
    } else {
      const house = houses.find(h => h.id === id);
      if (house) {
        setHouseName(house.name);
        setHouseAddress(house.address);
      }
    }
  };

  const saveHouse = async () => {
    if (!houseName || !houseAddress) return alert("Vui lòng nhập đủ thông tin nhà trọ!");
    setIsLoading(true);

    if (selectedHouseId === "new") {
      const { error } = await supabase.from("houses").insert([{ name: houseName, address: houseAddress }]);
      if (error) alert("Lỗi khi thêm: " + error.message);
      else { 
        alert("Thêm thành công!"); 
        fetchHouses(); 
      }
    } else {
      const { error } = await supabase.from("houses").update({ name: houseName, address: houseAddress }).eq("id", selectedHouseId);
      if (error) alert("Lỗi khi sửa: " + error.message);
      else { alert("Sửa thành công!"); fetchHouses(); }
    }
    setIsLoading(false);
  };

  // Room Handlers
  const handleSelectRoom = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedRoomId(id);
    if (id === "new") {
      setRoomHouseId(houses.length > 0 ? houses[0].id : "");
      setRoomName("");
      setRoomMembers(1);
      setRoomRent(0);
      setRoomElectric(0);
    } else {
      const room = rooms.find(r => r.id === id);
      if (room) {
        setRoomHouseId(room.house_id);
        setRoomName(room.name);
        setRoomMembers(room.number_of_members);
        setRoomRent(room.rent_cost);
        setRoomElectric(room.latest_electric_number);
      }
    }
  };

  const saveRoom = async () => {
    if (!roomHouseId || !roomName || roomRent < 0) return alert("Vui lòng nhập đủ và đúng thông tin phòng!");
    setIsLoading(true);

    const payload = {
      house_id: roomHouseId,
      name: roomName,
      number_of_members: roomMembers,
      rent_cost: roomRent,
      latest_electric_number: roomElectric
    };

    if (selectedRoomId === "new") {
      const { error } = await supabase.from("rooms").insert([payload]);
      if (error) alert("Lỗi khi thêm: " + error.message);
      else {
        alert("Thêm thành công!");
        fetchRooms();
      }
    } else {
      const { error } = await supabase.from("rooms").update(payload).eq("id", selectedRoomId);
      if (error) alert("Lỗi khi sửa: " + error.message);
      else { alert("Sửa thành công!"); fetchRooms(); }
    }
    setIsLoading(false);
  };

  return (
    <div>
      <h2 style={{ marginBottom: "16px" }}>Quản lý dữ liệu</h2>

      <div className="tabs">
        <div
          className={`tab-item ${activeTab === 'house' ? 'active' : ''}`}
          onClick={() => setActiveTab('house')}
        >
          Nhà trọ
        </div>
        <div
          className={`tab-item ${activeTab === 'room' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('room');
            if (selectedRoomId === "new" && !roomHouseId && houses.length > 0) {
              setRoomHouseId(houses[0].id);
            }
          }}
        >
          Phòng trọ
        </div>
      </div>

      {activeTab === 'house' && (
        <div className="card">
          <div className="form-group">
            <label className="form-label">Chọn nhà trọ để thao tác</label>
            <select className="form-control" value={selectedHouseId} onChange={handleSelectHouse}>
              <option value="new">-- Thêm mới nhà trọ --</option>
              {houses.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div style={{ borderTop: "1px solid var(--border-color)", margin: "20px 0" }}></div>

          <div className="form-group">
            <label className="form-label">Tên nhà trọ</label>
            <input className="form-control" placeholder="VD: Nhà trọ số 1" value={houseName} onChange={e => setHouseName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Địa chỉ</label>
            <input className="form-control" placeholder="VD: 123 Đường A..." value={houseAddress} onChange={e => setHouseAddress(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={saveHouse} disabled={isLoading}>
            {isLoading ? "Đang lưu..." : (selectedHouseId === "new" ? "Thêm nhà trọ" : "Lưu thay đổi")}
          </button>
        </div>
      )}

      {activeTab === 'room' && (
        <div className="card">
          <div className="form-group">
            <label className="form-label">Chọn phòng trọ để thao tác</label>
            <select className="form-control" value={selectedRoomId} onChange={handleSelectRoom}>
              <option value="new">-- Thêm mới phòng trọ --</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} - {houses.find(h => h.id === r.house_id)?.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ borderTop: "1px solid var(--border-color)", margin: "20px 0" }}></div>

          <div className="form-group">
            <label className="form-label">Thuộc nhà trọ</label>
            <select className="form-control" value={roomHouseId} onChange={e => setRoomHouseId(e.target.value)}>
              <option value="">-- Chọn nhà trọ --</option>
              {houses.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tên phòng</label>
            <input className="form-control" placeholder="VD: Phòng 101" value={roomName} onChange={e => setRoomName(e.target.value)} />
          </div>

          <div className="form-group" style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Số người ở</label>
              <input type="number" className="form-control" min={1} value={roomMembers} onChange={e => setRoomMembers(Number(e.target.value))} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">Số điện hiện tại</label>
              <input type="number" className="form-control" min={0} value={roomElectric} onChange={e => setRoomElectric(Number(e.target.value))} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Giá thuê phòng (VNĐ)</label>
            <input type="number" className="form-control" min={0} step={100000} value={roomRent} onChange={e => setRoomRent(Number(e.target.value))} />
          </div>

          <button className="btn btn-primary" onClick={saveRoom} disabled={isLoading}>
            {isLoading ? "Đang lưu..." : (selectedRoomId === "new" ? "Thêm phòng trọ" : "Lưu thay đổi")}
          </button>
        </div>
      )}
    </div>
  );
}
