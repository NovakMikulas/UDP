import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { locationService } from "../../../api/services/location";
import { useAuth } from "../../../context/AuthContext";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Table from "../../../components/ui/Table/Table";
import Modal from "../../../components/ui/Modal/Modal";
import AddIcon from "@mui/icons-material/Add";
import "./LocationList.css";

const columns = [
  {
    header: "Name",
    render: (loc) => loc.name,
  },
  {
    header: "Address",
    render: (loc) => loc.address,
  },
  {
    header: "Owner",
    render: (loc) => (
      <div className="owner-cell">
        <span className="table-avatar">
          {loc.owner?.username?.charAt(0).toUpperCase()}
        </span>
        {loc.owner?.username}
      </div>
    ),
  },
  {
    header: "Members",
    render: (loc) => (
      <div className="members-cell">
        {loc.members?.slice(0, 5).map((m, i) => (
          <span key={i} className="table-avatar">
            {m.username?.charAt(0).toUpperCase()}
          </span>
        ))}
      </div>
    ),
  },
];

const LocationList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", address: "" });
  const [formError, setFormError] = useState("");

  const fetchLocations = async () => {
    try {
      const data = await locationService.list();
      setLocations(data.data || []);
    } catch {
      setError("Failed to load locations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await locationService.create(formData);
      setModalOpen(false);
      setFormData({ name: "", address: "" });
      fetchLocations();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create location.");
    }
  };

  const getMenuItems = (loc) => {
    const isOwner = loc.owner?._id === user?.id;
    const items = [
      { label: "Update", onClick: () => console.log("update", loc) },
      { label: "Delete", onClick: () => console.log("delete", loc), variant: "danger" },
    ];
    if (isOwner) {
      items.push(
        { label: "Invite user", onClick: () => console.log("invite", loc) },
        { label: "Kick user", onClick: () => console.log("kick", loc), variant: "danger" },
      );
    }
    return items;
  };

  return (
    <div className="table-view">
      <div className="table-view__header">
        <h1>Locations</h1>
        <Button variant="success" onClick={() => setModalOpen(true)}>
          <AddIcon fontSize="small" /> Add location
        </Button>
      </div>

      {error && <div className="table-view__error">{error}</div>}

      <Table
        columns={columns}
        data={locations}
        loading={loading}
        emptyMessage="No locations found."
        onRowClick={(loc) => navigate(`/locations/${loc._id}/rooms`)}
        getMenuItems={getMenuItems}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add location">
        <form onSubmit={handleAdd} className="modal-form">
          {formError && <div className="modal-form__error">{formError}</div>}
          <Input id="name" label="Name" value={formData.name} onChange={handleChange} required />
          <Input id="address" label="Address" value={formData.address} onChange={handleChange} required />
          <Button type="submit" variant="success" fullWidth>Create</Button>
        </form>
      </Modal>
    </div>
  );
};

export default LocationList;
