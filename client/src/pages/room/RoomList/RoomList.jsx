import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { roomService } from "../../../api/services/room";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Table from "../../../components/ui/Table/Table";
import Modal from "../../../components/ui/Modal/Modal";
import AddIcon from "@mui/icons-material/Add";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", capacity: "" });
  const [formError, setFormError] = useState("");

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await roomService.create(locationId, {
        name: formData.name,
        capacity: Number(formData.capacity),
      });
      setModalOpen(false);
      setFormData({ name: "", capacity: "" });
      fetchRooms();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create room.");
    }
  };

  const getMenuItems = (room) => [
    { label: "Update", onClick: () => console.log("update", room) },
    { label: "Delete", onClick: () => console.log("delete", room), variant: "danger" },
  ];

  return (
    <div className="table-view">
      <div className="table-view__header">
        <h1>Rooms</h1>
        <Button variant="success" onClick={() => setModalOpen(true)}>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add room">
        <form onSubmit={handleAdd} className="modal-form">
          {formError && <div className="modal-form__error">{formError}</div>}
          <Input id="name" label="Name" value={formData.name} onChange={handleChange} required />
          <Input id="capacity" label="Capacity" type="number" value={formData.capacity} onChange={handleChange} required />
          <Button type="submit" variant="success" fullWidth>Create</Button>
        </form>
      </Modal>
    </div>
  );
};

export default RoomList;
