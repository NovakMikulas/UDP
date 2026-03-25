import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { locationService } from "../../../api/services/location";
import { useAuth } from "../../../context/AuthContext";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Table from "../../../components/ui/Table/Table";
import Modal from "../../../components/ui/Modal/Modal";
import Breadcrumb from "../../../components/ui/Breadcrumb/Breadcrumb";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import "./LocationList.css";

const columns = [
  { header: "Name", render: (loc) => loc.name },
  { header: "Address", render: (loc) => loc.address },
  {
    header: "Owner",
    render: (loc) => (
      <div className="owner-cell">
        <span className="table-avatar">{loc.owner?.username?.charAt(0).toUpperCase()}</span>
        {loc.owner?.username}
      </div>
    ),
  },
  {
    header: "Members",
    render: (loc) => (
      <div className="members-cell">
        {loc.members?.slice(0, 5).map((m, i) => (
          <span key={i} className="table-avatar">{m.username?.charAt(0).toUpperCase()}</span>
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
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", address: "" });

  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({ name: "", address: "" });
  const [selected, setSelected] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchLocations = async () => {
    try {
      const data = await locationService.list();
      setLocations(data.data || []);
    } catch {
      setLoadError("Failed to load locations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await locationService.create(addForm);
      setAddOpen(false);
      setAddForm({ name: "", address: "" });
      fetchLocations();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create location.");
    }
  };

  const openUpdate = (loc) => {
    setSelected(loc);
    setUpdateForm({ name: loc.name, address: loc.address });
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
      await locationService.update(selected._id, updateForm);
      setUpdateOpen(false);
      setSelected(null);
      fetchLocations();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to update location.");
    }
  };

  const openDelete = (loc) => {
    setSelected(loc);
    setFormError("");
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    setFormError("");
    try {
      await locationService.delete(selected._id);
      setDeleteOpen(false);
      setSelected(null);
      fetchLocations();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to delete location.");
    }
  };

  const getMenuItems = (loc) => {
    const isOwner = loc.owner?._id === user?.id;
    const items = [
      { label: "Update", icon: <EditOutlinedIcon fontSize="small" />, onClick: () => openUpdate(loc) },
      { label: "Delete", icon: <DeleteOutlineIcon fontSize="small" />, onClick: () => openDelete(loc), variant: "danger" },
    ];
    if (isOwner) {
      items.push(
        { label: "Invite user", icon: <PersonAddOutlinedIcon fontSize="small" />, onClick: () => console.log("invite", loc) },
        { label: "Kick user", icon: <PersonRemoveOutlinedIcon fontSize="small" />, onClick: () => console.log("kick", loc), variant: "danger" },
      );
    }
    return items;
  };

  return (
    <div className="table-view">
      <Breadcrumb items={[{ label: "Locations" }]} />
      <div className="table-view__header">
        <h1>Locations</h1>
        <Button variant="success" onClick={() => { setFormError(""); setAddOpen(true); }}>
          <AddIcon fontSize="small" /> Add location
        </Button>
      </div>

      {loadError && <div className="table-view__error">{loadError}</div>}

      <Table
        columns={columns}
        data={locations}
        loading={loading}
        emptyMessage="No locations found."
        onRowClick={(loc) => navigate(`/locations/${loc._id}/rooms`, { state: { locationName: loc.name } })}
        getMenuItems={getMenuItems}
      />

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add location">
        <form onSubmit={handleAdd} className="modal-form">
          {formError && <div className="modal-form__error">{formError}</div>}
          <Input id="name" label="Name" value={addForm.name} onChange={handleAddChange} required />
          <Input id="address" label="Address" value={addForm.address} onChange={handleAddChange} required />
          <Button type="submit" variant="success" fullWidth>Create</Button>
        </form>
      </Modal>

      <Modal isOpen={updateOpen} onClose={() => setUpdateOpen(false)} title="Update location">
        <form onSubmit={handleUpdate} className="modal-form">
          {formError && <div className="modal-form__error">{formError}</div>}
          <Input id="name" label="Name" value={updateForm.name} onChange={handleUpdateChange} required />
          <Input id="address" label="Address" value={updateForm.address} onChange={handleUpdateChange} required />
          <Button type="submit" variant="success" fullWidth>Save changes</Button>
        </form>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete location">
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

export default LocationList;
