import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deviceService } from "../../../api/services/device";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Table from "../../../components/ui/Table/Table";
import Modal from "../../../components/ui/Modal/Modal";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import "./DeviceList.css";

const columns = [

  {
    header: "Serial number",
    render: (device) => (
      <span className="device-serial">{device.serialNumber}</span>
    ),
  },
  {
    header: "Location",
    render: (device) => device.roomId?.locationId?.name ?? "—",
  },
  {
    header: "Room",
    render: (device) => device.roomId?.name ?? "—",
  },
  {
    header: "Battery",
    render: (device) =>
      device.battery != null ? `${device.battery}%` : "—",
  },
  {
    header: "Status",
    render: (device) =>
      device.status === "active" ? (
        <CheckCircleOutlineIcon className="status-icon status-icon--active" fontSize="small" />
      ) : (
        <CancelOutlinedIcon className="status-icon status-icon--inactive" fontSize="small" />
      ),
  },
];

const DeviceList = () => {
  const { roomId, locationId } = useParams();
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [serialNumber, setSerialNumber] = useState("");
  const [addError, setAddError] = useState("");

  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateSerial, setUpdateSerial] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [selected, setSelected] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchDevices = async () => {
    try {
      const data = await deviceService.list(roomId, locationId);
      setDevices(data.data || []);
    } catch {
      setError("Failed to load devices.");
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
    setAddError("");
    try {
      await deviceService.create(locationId, { serialNumber, roomId });
      setAddOpen(false);
      setSerialNumber("");
      fetchDevices();
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to create device.");
    }
  };

  const openUpdate = (device) => {
    setSelected(device);
    setUpdateSerial(device.serialNumber);
    setUpdateError("");
    setUpdateOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateError("");
    try {
      await deviceService.update(selected._id, locationId, { serialNumber: updateSerial });
      setUpdateOpen(false);
      setSelected(null);
      fetchDevices();
    } catch (err) {
      setUpdateError(err.response?.data?.message || "Failed to update device.");
    }
  };

  const openDelete = (device) => {
    setSelected(device);
    setDeleteError("");
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    setDeleteError("");
    try {
      await deviceService.delete(selected._id, locationId);
      setDeleteOpen(false);
      setSelected(null);
      fetchDevices();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete device.");
    }
  };

  const getMenuItems = (device) => [
    {
      label: "Update",
      icon: <EditOutlinedIcon fontSize="small" />,
      onClick: () => openUpdate(device),
    },
    {
      label: "Delete",
      icon: <DeleteOutlineIcon fontSize="small" />,
      onClick: () => openDelete(device),
      variant: "danger",
    },
  ];

  return (
    <div className="table-view">
      <div className="table-view__header">
        <h1>Devices</h1>
        <Button variant="success" onClick={() => setAddOpen(true)}>
          <AddIcon fontSize="small" /> Add device
        </Button>
      </div>

      {error && <div className="table-view__error">{error}</div>}

      <Table
        columns={columns}
        data={devices}
        loading={loading}
        emptyMessage="No devices found."
        onRowClick={(device) =>
          navigate(`/locations/${locationId}/rooms/${roomId}/devices/${device._id}/messages`)
        }
        getMenuItems={getMenuItems}
      />

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add device">
        <form onSubmit={handleAdd} className="modal-form">
          {addError && <div className="modal-form__error">{addError}</div>}
          <Input
            id="serialNumber"
            label="Serial number"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            required
          />
          <Button type="submit" variant="success" fullWidth>Create</Button>
        </form>
      </Modal>

      <Modal isOpen={updateOpen} onClose={() => setUpdateOpen(false)} title="Update device">
        <form onSubmit={handleUpdate} className="modal-form">
          {updateError && <div className="modal-form__error">{updateError}</div>}
          <Input
            id="serialNumber"
            label="Serial number"
            value={updateSerial}
            onChange={(e) => setUpdateSerial(e.target.value)}
            required
          />
          <Button type="submit" variant="success" fullWidth>Save changes</Button>
        </form>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete device">
        <div className="modal-form">
          {deleteError && <div className="modal-form__error">{deleteError}</div>}
          <p className="modal-confirm__text">
            Are you sure you want to delete <strong>{selected?.serialNumber}</strong>? This action cannot be undone.
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

export default DeviceList;
