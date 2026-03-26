import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { deviceService } from "../../../api/services/device";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Table from "../../../components/ui/Table/Table";
import Modal from "../../../components/ui/Modal/Modal";
import Breadcrumb from "../../../components/ui/Breadcrumb/Breadcrumb";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import "./DeviceList.css";

const columns = [
  { header: "Serial number", render: (device) => <span className="device-serial">{device.serialNumber}</span> },
  { header: "Location", render: (device) => device.roomId?.locationId?.name ?? "—" },
  { header: "Room", render: (device) => device.roomId?.name ?? "—" },
  { header: "Battery", render: (device) => device.battery != null ? `${device.battery}%` : "—" },
  {
    header: "Status",
    render: (device) => device.status === "active"
      ? <CheckCircleOutlineIcon className="status-icon status-icon-active" fontSize="small" />
      : <CancelOutlinedIcon className="status-icon status-icon-inactive" fontSize="small" />,
  },
];

const DeviceList = () => {
  const { roomId, locationId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const locationName = state?.locationName || locationId;
  const roomName = state?.roomName || roomId;

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [serialNumber, setSerialNumber] = useState("");

  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateSerial, setUpdateSerial] = useState("");
  const [selected, setSelected] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchDevices = async () => {
    try {
      const data = await deviceService.list(roomId, locationId);
      setDevices(data.data || []);
    } catch {
      setLoadError("Failed to load devices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roomId || !locationId) return;
    fetchDevices();
  }, [roomId, locationId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await deviceService.create(locationId, { serialNumber, roomId });
      setAddOpen(false);
      setSerialNumber("");
      fetchDevices();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create device.");
    }
  };

  const openUpdate = (device) => {
    setSelected(device);
    setUpdateSerial(device.serialNumber);
    setFormError("");
    setUpdateOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await deviceService.update(selected._id, locationId, { serialNumber: updateSerial });
      setUpdateOpen(false);
      setSelected(null);
      fetchDevices();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to update device.");
    }
  };

  const openDelete = (device) => {
    setSelected(device);
    setFormError("");
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    setFormError("");
    try {
      await deviceService.delete(selected._id, locationId);
      setDeleteOpen(false);
      setSelected(null);
      fetchDevices();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to delete device.");
    }
  };

  const getMenuItems = (device) => [
    { label: "Update", icon: <EditOutlinedIcon fontSize="small" />, onClick: () => openUpdate(device) },
    { label: "Delete", icon: <DeleteOutlineIcon fontSize="small" />, onClick: () => openDelete(device), variant: "danger" },
  ];

  return (
    <div className="table-view">
      <Breadcrumb items={[
        { label: "Locations", path: "/locations" },
        { label: locationName, path: `/locations/${locationId}/rooms`, state: { locationName } },
        { label: roomName },
      ]} />
      <div className="table-view__header">
        <h1>Devices</h1>
        <Button variant="success" onClick={() => { setFormError(""); setAddOpen(true); }}>
          <AddIcon fontSize="small" /> Add device
        </Button>
      </div>

      {loadError && <div className="table-view__error">{loadError}</div>}

      <Table
        columns={columns}
        data={devices}
        loading={loading}
        emptyMessage="No devices found."
        onRowClick={(device) => navigate(`/locations/${locationId}/rooms/${roomId}/devices/${device._id}/messages`, { state: { locationName, roomName, deviceSerial: device.serialNumber } })}
        getMenuItems={getMenuItems}
      />

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add device">
        <form onSubmit={handleAdd} className="modal-form">
          {formError && <div className="modal-form__error">{formError}</div>}
          <Input id="serialNumber" label="Serial number" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} required />
          <Button type="submit" variant="success" fullWidth>Create</Button>
        </form>
      </Modal>

      <Modal isOpen={updateOpen} onClose={() => setUpdateOpen(false)} title="Update device">
        <form onSubmit={handleUpdate} className="modal-form">
          {formError && <div className="modal-form__error">{formError}</div>}
          <Input id="serialNumber" label="Serial number" value={updateSerial} onChange={(e) => setUpdateSerial(e.target.value)} required />
          <Button type="submit" variant="success" fullWidth>Save changes</Button>
        </form>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete device">
        <div className="modal-form">
          {formError && <div className="modal-form__error">{formError}</div>}
          <p>
            Are you sure you want to delete <strong>{selected?.serialNumber}</strong>? This action cannot be undone.
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

export default DeviceList;
