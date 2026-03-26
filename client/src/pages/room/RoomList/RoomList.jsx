import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { roomService } from "../../../api/services/room";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Table from "../../../components/ui/Table/Table";
import Modal from "../../../components/ui/Modal/Modal";
import Breadcrumb from "../../../components/ui/Breadcrumb/Breadcrumb";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const columns = [
  { header: "Name", render: (room) => room.name },
  { header: "Capacity", render: (room) => room.capacity },
];

const RoomList = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const locationName = state?.locationName || locationId;

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", capacity: "" });

  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({ name: "", capacity: "" });
  const [selected, setSelected] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchRooms = async () => {
    try {
      const data = await roomService.list(locationId);
      setRooms(data.data || []);
    } catch {
      setLoadError("Failed to load rooms.");
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
    setFormError("");
    try {
      await roomService.create(locationId, { name: addForm.name, capacity: Number(addForm.capacity) });
      setAddOpen(false);
      setAddForm({ name: "", capacity: "" });
      fetchRooms();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create room.");
    }
  };

  const openUpdate = (room) => {
    setSelected(room);
    setUpdateForm({ name: room.name, capacity: String(room.capacity) });
    setFormError("");
    setUpdateOpen(true);
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await roomService.update(selected._id, locationId, { name: updateForm.name, capacity: Number(updateForm.capacity) });
      setUpdateOpen(false);
      setSelected(null);
      fetchRooms();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to update room.");
    }
  };

  const openDelete = (room) => {
    setSelected(room);
    setFormError("");
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    setFormError("");
    try {
      await roomService.delete(selected._id, locationId);
      setDeleteOpen(false);
      setSelected(null);
      fetchRooms();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to delete room.");
    }
  };

  const getMenuItems = (room) => [
    { label: "Update", icon: <EditOutlinedIcon fontSize="small" />, onClick: () => openUpdate(room) },
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
        <Button variant="success" onClick={() => { setFormError(""); setAddOpen(true); }}>
          <AddIcon fontSize="small" /> Add room
        </Button>
      </div>

      {loadError && <div className="table-view__error">{loadError}</div>}

      <Table
        columns={columns}
        data={rooms}
        loading={loading}
        emptyMessage="No rooms found."
        onRowClick={(room) => navigate(`/locations/${locationId}/rooms/${room._id}/devices`, { state: { locationName, roomName: room.name } })}
        getMenuItems={getMenuItems}
      />

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add room">
        <form onSubmit={handleAdd} className="modal-form">
          {formError && <div className="modal-form__error">{formError}</div>}
          <Input id="name" label="Name" value={addForm.name} onChange={handleAddChange} required />
          <Input id="capacity" label="Capacity" type="number" value={addForm.capacity} onChange={handleAddChange} required />
          <Button type="submit" variant="success" fullWidth>Create</Button>
        </form>
      </Modal>

      <Modal isOpen={updateOpen} onClose={() => setUpdateOpen(false)} title="Update room">
        <form onSubmit={handleUpdate} className="modal-form">
          {formError && <div className="modal-form__error">{formError}</div>}
          <Input id="name" label="Name" value={updateForm.name} onChange={handleUpdateChange} required />
          <Input id="capacity" label="Capacity" type="number" value={updateForm.capacity} onChange={handleUpdateChange} required />
          <Button type="submit" variant="success" fullWidth>Save changes</Button>
        </form>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete room">
        <div className="modal-form">
          {formError && <div className="modal-form__error">{formError}</div>}
          <p>
            Are you sure you want to delete <strong>{selected?.name}</strong>? This action cannot be undone.
          </p>
          <div>
            <Button variant="primary" fullWidth onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoomList;
