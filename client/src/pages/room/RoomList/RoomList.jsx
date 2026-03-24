import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { roomService } from "../../../api/services/room";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Table from "../../../components/ui/Table/Table";
import Modal from "../../../components/ui/Modal/Modal";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const columns = [
  {
    header: "Name",
    render: (room) => room.name,
  },
  {
    header: "Capacity",
    render: (room) => room.capacity,
  },
];

const RoomList = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", capacity: "" });
  const [addError, setAddError] = useState("");

  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({ name: "", capacity: "" });
  const [updateError, setUpdateError] = useState("");
  const [selected, setSelected] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchRooms = async () => {
    try {
      const data = await roomService.list(locationId);
      setRooms(data.data || []);
    } catch {
      setError("Failed to load rooms.");
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
    setAddError("");
    try {
      await roomService.create(locationId, {
        name: addForm.name,
        capacity: Number(addForm.capacity),
      });
      setAddOpen(false);
      setAddForm({ name: "", capacity: "" });
      fetchRooms();
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to create room.");
    }
  };

  const openUpdate = (room) => {
    setSelected(room);
    setUpdateForm({ name: room.name, capacity: String(room.capacity) });
    setUpdateError("");
    setUpdateOpen(true);
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateError("");
    try {
      await roomService.update(selected._id, locationId, {
        name: updateForm.name,
        capacity: Number(updateForm.capacity),
      });
      setUpdateOpen(false);
      setSelected(null);
      fetchRooms();
    } catch (err) {
      setUpdateError(err.response?.data?.message || "Failed to update room.");
    }
  };

  const openDelete = (room) => {
    setSelected(room);
    setDeleteError("");
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    setDeleteError("");
    try {
      await roomService.delete(selected._id, locationId);
      setDeleteOpen(false);
      setSelected(null);
      fetchRooms();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete room.");
    }
  };

  const getMenuItems = (room) => [
    {
      label: "Update",
      icon: <EditOutlinedIcon fontSize="small" />,
      onClick: () => openUpdate(room),
    },
    {
      label: "Delete",
      icon: <DeleteOutlineIcon fontSize="small" />,
      onClick: () => openDelete(room),
      variant: "danger",
    },
  ];

  return (
    <div className="table-view">
      <div className="table-view__header">
        <h1>Rooms</h1>
        <Button variant="success" onClick={() => setAddOpen(true)}>
          <AddIcon fontSize="small" /> Add room
        </Button>
      </div>

      {error && <div className="table-view__error">{error}</div>}

      <Table
        columns={columns}
        data={rooms}
        loading={loading}
        emptyMessage="No rooms found."
        onRowClick={(room) => navigate(`/locations/${locationId}/rooms/${room._id}/devices`)}
        getMenuItems={getMenuItems}
      />

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add room">
        <form onSubmit={handleAdd} className="modal-form">
          {addError && <div className="modal-form__error">{addError}</div>}
          <Input id="name" label="Name" value={addForm.name} onChange={handleAddChange} required />
          <Input id="capacity" label="Capacity" type="number" value={addForm.capacity} onChange={handleAddChange} required />
          <Button type="submit" variant="success" fullWidth>Create</Button>
        </form>
      </Modal>

      <Modal isOpen={updateOpen} onClose={() => setUpdateOpen(false)} title="Update room">
        <form onSubmit={handleUpdate} className="modal-form">
          {updateError && <div className="modal-form__error">{updateError}</div>}
          <Input id="name" label="Name" value={updateForm.name} onChange={handleUpdateChange} required />
          <Input id="capacity" label="Capacity" type="number" value={updateForm.capacity} onChange={handleUpdateChange} required />
          <Button type="submit" variant="success" fullWidth>Save changes</Button>
        </form>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete room">
        <div className="modal-form">
          {deleteError && <div className="modal-form__error">{deleteError}</div>}
          <p className="modal-confirm__text">
            Are you sure you want to delete <strong>{selected?.name}</strong>? This action cannot be undone.
          </p>
          <div className="modal-confirm__actions">
            <Button variant="primary" fullWidth onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoomList;
