import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { locationService } from "../../../api/services/location";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Modal from "../../../components/ui/Modal/Modal";
import Breadcrumb from "../../../components/ui/Breadcrumb/Breadcrumb";
import Card from "../../../components/ui/Card/Card";
import useCrudModal from "../../../hooks/useCrudModal";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import "./LocationList.css";

const LocationList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const emptyAddress = { street: "", city: "", zip: "", country: "" };
  const [addForm, setAddForm] = useState({ name: "", address: emptyAddress });
  const [updateForm, setUpdateForm] = useState({ name: "", address: emptyAddress });

  const formatAddress = (address) =>
    address ? [address.street, address.city, address.zip, address.country].filter(Boolean).join(", ") : "";

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLocation, setInviteLocation] = useState(null);
  const [kickOpen, setKickOpen] = useState(false);
  const [kickLocation, setKickLocation] = useState(null);

  const { selected, addOpen, setAddOpen, updateOpen, setUpdateOpen,
          deleteOpen, openAdd, openUpdate, openDelete, closeAll } = useCrudModal();

  const fetchLocations = async () => {
    try {
      const data = await locationService.list();
      setLocations(data.data || []);
    } catch {
      addToast("Failed to load locations.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  const filtered = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      formatAddress(loc.address).toLowerCase().includes(search.toLowerCase())
  );

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAddressChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, address: { ...prev.address, [name]: value } }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await locationService.create(addForm);
      setAddOpen(false);
      setAddForm({ name: "", address: emptyAddress });
      fetchLocations();
      addToast("Location created successfully.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create location.", "error");
    }
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateAddressChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({ ...prev, address: { ...prev.address, [name]: value } }));
  };

  const handleOpenUpdate = (loc) => {
    setUpdateForm({ name: loc.name, address: loc.address || emptyAddress });
    openUpdate(loc);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await locationService.update(selected._id, updateForm);
      closeAll();
      fetchLocations();
      addToast("Location updated successfully.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update location.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await locationService.delete(selected._id);
      closeAll();
      fetchLocations();
      addToast("Location deleted.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete location.", "error");
    }
  };

  const handleOpenInvite = (loc) => {
    setInviteLocation(loc);
    setInviteEmail("");
    setInviteOpen(true);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await locationService.invite(inviteLocation._id, inviteEmail);
      setInviteOpen(false);
      fetchLocations();
      addToast("User invited successfully.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to invite user.", "error");
    }
  };

  const handleOpenKick = (loc) => {
    setKickLocation(loc);
    setKickOpen(true);
  };

  const handleKick = async (memberId) => {
    try {
      await locationService.kick(kickLocation._id, memberId);
      fetchLocations();
      setKickLocation((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m._id !== memberId),
      }));
      addToast("User removed.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to remove user.", "error");
    }
  };

  const getMenuItems = (loc) => {
    const isOwner = loc.owner?._id === user?.id;
    const items = [
      { label: "Update", icon: <EditOutlinedIcon fontSize="small" />, onClick: () => handleOpenUpdate(loc) },
      { label: "Delete", icon: <DeleteOutlineIcon fontSize="small" />, onClick: () => openDelete(loc), variant: "danger" },
    ];
    if (isOwner) {
      items.push(
        { label: "Invite user", icon: <PersonAddOutlinedIcon fontSize="small" />, onClick: () => handleOpenInvite(loc) },
        { label: "Kick user", icon: <PersonRemoveOutlinedIcon fontSize="small" />, onClick: () => handleOpenKick(loc), variant: "danger" },
      );
    }
    return items;
  };

  return (
    <div className="list-view">
      <Breadcrumb items={[{ label: "Locations" }]} />
      <div className="list-view__header">
        <h1>Locations</h1>
      </div>

      <div className="list-view__toolbar">
        <div className="list-view__search">
          <SearchIcon fontSize="small" />
          <input placeholder="Search location..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="success" onClick={() => openAdd(() => setAddForm({ name: "", address: emptyAddress }))}>
          <AddIcon fontSize="small" /> Add location
        </Button>
      </div>

      {!loading && (
        <div className="card-grid-wrapper">
          <div className="card-grid-scroll">
            <div className="card-grid">
              {filtered.map((loc) => (
                <Card
                  key={loc._id}
                  name={loc.name}
                  rows={[
                    {
                      label: "Owner",
                      render: (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span className="table-avatar">{loc.owner?.username?.charAt(0).toUpperCase()}</span>
                          {loc.owner?.username}
                        </div>
                      ),
                    },
                    {
                      label: "Members",
                      render: (
                        <div className="members-cell">
                          {loc.members?.slice(0, 5).map((m, i) => (
                            <span key={i} className="table-avatar">{m.username?.charAt(0).toUpperCase()}</span>
                          ))}
                        </div>
                      ),
                    },
                  ]}
                  footerLeft={formatAddress(loc.address)}
                  onClick={() => navigate(`/locations/${loc._id}/rooms`, { state: { locationName: loc.name } })}
                  getMenuItems={() => getMenuItems(loc)}
                />
              ))}
              {filtered.length === 0 && <p className="card-grid__empty">No locations found.</p>}
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={addOpen} onClose={closeAll} title="Add location">
        <form onSubmit={handleAdd} className="modal-form">
          <Input id="name" label="Name" value={addForm.name} onChange={handleAddChange} required />
          <Input id="street" label="Street" value={addForm.address.street} onChange={handleAddAddressChange} required />
          <Input id="city" label="City" value={addForm.address.city} onChange={handleAddAddressChange} required />
          <Input id="zip" label="ZIP" value={addForm.address.zip} onChange={handleAddAddressChange} required />
          <Input id="country" label="Country" value={addForm.address.country} onChange={handleAddAddressChange} required />
          <Button type="submit" variant="success" fullWidth>Create</Button>
        </form>
      </Modal>

      <Modal isOpen={updateOpen} onClose={closeAll} title="Update location">
        <form onSubmit={handleUpdate} className="modal-form">
          <Input id="name" label="Name" value={updateForm.name} onChange={handleUpdateChange} required />
          <Input id="street" label="Street" value={updateForm.address.street} onChange={handleUpdateAddressChange} required />
          <Input id="city" label="City" value={updateForm.address.city} onChange={handleUpdateAddressChange} required />
          <Input id="zip" label="ZIP" value={updateForm.address.zip} onChange={handleUpdateAddressChange} required />
          <Input id="country" label="Country" value={updateForm.address.country} onChange={handleUpdateAddressChange} required />
          <Button type="submit" variant="success" fullWidth>Save changes</Button>
        </form>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={closeAll} title="Delete location">
        <div className="modal-form">
          <p>Are you sure you want to delete <strong>{selected?.name}</strong>? This action cannot be undone.</p>
          <div>
            <Button variant="primary" fullWidth onClick={closeAll}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite user">
        <form onSubmit={handleInvite} className="modal-form">
          <p>Invite a user to <strong>{inviteLocation?.name}</strong> by email.</p>
          <Input id="inviteEmail" label="Email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="user@example.com" required />
          <Button type="submit" variant="success" fullWidth>Invite</Button>
        </form>
      </Modal>

      <Modal isOpen={kickOpen} onClose={() => setKickOpen(false)} title="Manage members">
        <div className="modal-form">
          <p>Members of <strong>{kickLocation?.name}</strong></p>
          {kickLocation?.members?.length > 0 ? (
            <div className="kick-member-list">
              {kickLocation.members.map((member) => (
                <div key={member._id} className="kick-member-row">
                  <div className="kick-member-info">
                    <span className="table-avatar">{member.username?.charAt(0).toUpperCase()}</span>
                    <div>
                      <div>{member.username}</div>
                      <div className="kick-member-email">{member.email}</div>
                    </div>
                  </div>
                  <Button variant="danger" onClick={() => handleKick(member._id)}>Remove</Button>
                </div>
              ))}
            </div>
          ) : (
            <p>No members to remove.</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default LocationList;
