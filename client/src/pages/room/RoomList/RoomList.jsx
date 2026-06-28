import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { roomService } from "../../../api/services/room";
import { useToast } from "../../../context/ToastContext";
import { OFFLINE_THRESHOLD_MS } from "../../../constants/device";
import { isVoltageAlive } from "../../../constants/voltage";
import { deviceService } from "../../../api/services/device";
import { messageService } from "../../../api/services/message";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Modal from "../../../components/ui/Modal/Modal";
import Breadcrumb from "../../../components/ui/Breadcrumb/Breadcrumb";
import Card from "../../../components/ui/Card/Card";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import useCrudModal from "../../../hooks/useCrudModal";
import "./RoomList.css";

const RoomList = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const locationName = state?.locationName || locationId;

  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const filtered = rooms.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  const [loading, setLoading] = useState(true);
  const [addForm, setAddForm] = useState({ name: "", capacity: "" });
  const [updateForm, setUpdateForm] = useState({ name: "", capacity: "" });
  const { addToast } = useToast();

  const { selected, addOpen, setAddOpen, updateOpen, setUpdateOpen,
          deleteOpen, openAdd, openUpdate, openDelete, closeAll } = useCrudModal();

  const fetchRooms = async () => {
    try {
      const data = await roomService.list(locationId);
      const rawRooms = data.data || [];

      const augmented = await Promise.all(
        rawRooms.map(async (room) => {
          try {
            const devicesData = await deviceService.list(room._id, locationId);
            const devices = devicesData.data || [];

            const deviceSerials = devices.map((d) => d.serialNumber).join(", ") || "—";

            let currentlyInside = 0;
            let isOnline = false;

            await Promise.all(
              devices.map(async (device) => {
                try {
                  const msgData = await messageService.list(device._id, locationId);
                  const messages = (msgData.data || []).sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                  );
                  const latestMessage = messages[0];
                  if (latestMessage) {
                    const samples = latestMessage.motion?.samples || [];
                    for (let i = 1; i < samples.length; i++) {
                      currentlyInside += (samples[i][3] || 0) - (samples[i][4] || 0);
                    }
                    const age = Date.now() - new Date(latestMessage.createdAt);
                    if (isVoltageAlive(latestMessage.system?.voltage_rest) && age < OFFLINE_THRESHOLD_MS) {
                      isOnline = true;
                    }
                  }
                } catch {
                  // no messages for this device yet
                }
              })
            );

            return {
              ...room,
              deviceSerials,
              currentlyInside: Math.max(0, currentlyInside),
              isOnline,
            };
          } catch {
            return { ...room, deviceSerials: "—", currentlyInside: 0, isOnline: false };
          }
        })
      );

      setRooms(augmented);
    } catch {
      addToast("Failed to load rooms.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!locationId) return;
    fetchRooms();
  }, [locationId]);

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await roomService.create(locationId, { name: addForm.name, capacity: Number(addForm.capacity) });
      setAddOpen(false);
      setAddForm({ name: "", capacity: "" });
      fetchRooms();
      addToast("Room created successfully.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create room.", "error");
    }
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenUpdate = (room) => {
    setUpdateForm({ name: room.name, capacity: String(room.capacity) });
    openUpdate(room);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await roomService.update(selected._id, locationId, { name: updateForm.name, capacity: Number(updateForm.capacity) });
      closeAll();
      fetchRooms();
      addToast("Room updated successfully.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update room.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await roomService.delete(selected._id, locationId);
      closeAll();
      fetchRooms();
      addToast("Room deleted.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete room.", "error");
    }
  };

  const getMenuItems = (room) => [
    { label: "Update", icon: <EditOutlinedIcon fontSize="small" />, onClick: () => handleOpenUpdate(room) },
    { label: "Delete", icon: <DeleteOutlineIcon fontSize="small" />, onClick: () => openDelete(room), variant: "danger" },
  ];

  return (
    <div className="table-view">
      <Breadcrumb items={[
        { label: "Locations", path: "/locations" },
        { label: locationName },
      ]} />
      <div className="table-view__header">
        <h1>Rooms</h1>
      </div>

      <div className="table-view__toolbar">
        <div className="table-view__search">
          <SearchIcon fontSize="small" />
          <input
            placeholder="Search room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="success" onClick={openAdd}>
          <AddIcon fontSize="small" /> Add room
        </Button>
      </div>

      {!loading && (
        <div className="card-grid-wrapper">
          <div className="card-grid-scroll">
            <div className="card-grid">
              {filtered.map((room) => (
                <Card
                  key={room._id}
                  name={room.name}
                  rows={[
                    { label: "Capacity", render: room.capacity ?? 0 },
                    { label: "Currently inside", render: room.currentlyInside ?? 0 },
                  ]}
                  extra={(() => {
                    const pct = room.capacity > 0 ? Math.min((room.currentlyInside ?? 0) / room.capacity, 1) : 0;
                    return (
                      <div className="card__bar-track">
                        <div className={`card__bar-fill${pct >= 0.8 ? " danger" : ""}`} style={{ width: `${pct * 100}%` }} />
                      </div>
                    );
                  })()}
                  footerLeft={room.deviceSerials || "—"}
                  footerRight={
                    room.isOnline
                      ? <><CheckCircleOutlineIcon fontSize="small" />Online</>
                      : <span className="card__status--offline"><CancelOutlinedIcon fontSize="small" />Offline</span>
                  }
                  onClick={() => navigate(`/locations/${locationId}/rooms/${room._id}/devices`, { state: { locationName, roomName: room.name } })}
                  getMenuItems={() => getMenuItems(room)}
                />
              ))}
              {filtered.length === 0 && (
                <p className="card-grid__empty">No rooms found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={addOpen} onClose={closeAll} title="Add room">
        <form onSubmit={handleAdd} className="modal-form">

          <Input id="name" label="Name" value={addForm.name} onChange={handleAddChange} required />
          <Input id="capacity" label="Capacity" type="number" value={addForm.capacity} onChange={handleAddChange} required />
          <Button type="submit" variant="success" fullWidth>Create</Button>
        </form>
      </Modal>

      <Modal isOpen={updateOpen} onClose={closeAll} title="Update room">
        <form onSubmit={handleUpdate} className="modal-form">

          <Input id="name" label="Name" value={updateForm.name} onChange={handleUpdateChange} required />
          <Input id="capacity" label="Capacity" type="number" value={updateForm.capacity} onChange={handleUpdateChange} required />
          <Button type="submit" variant="success" fullWidth>Save changes</Button>
        </form>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={closeAll} title="Delete room">
        <div className="modal-form">

          <p>
            Are you sure you want to delete <strong>{selected?.name}</strong>? This action cannot be undone.
          </p>
          <div>
            <Button variant="primary" fullWidth onClick={closeAll}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoomList;
