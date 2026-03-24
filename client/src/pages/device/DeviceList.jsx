import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { deviceService } from "../../api/services/device";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import Table from "../../components/ui/Table/Table";
import Modal from "../../components/ui/Modal/Modal";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import "./DeviceList.css";

const columns = [
  {
    header: "Name",
    render: (device) => device.name ?? device.serialNumber,
  },
  {
    header: "Serial number",
    render: (device) => (
      <span className="device-serial">{device.serialNumber}</span>
    ),
  },
  {
    header: "Location",
    render: (device) => device.room?.location?.name ?? "—",
  },
  {
    header: "Room",
    render: (device) => device.room?.name ?? "—",
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
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [serialNumber, setSerialNumber] = useState("");
  const [formError, setFormError] = useState("");

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
    setFormError("");
    try {
      await deviceService.create(locationId, { serialNumber, roomId });
      setModalOpen(false);
      setSerialNumber("");
      fetchDevices();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create device.");
    }
  };

  const getMenuItems = (device) => [
    { label: "Update", onClick: () => console.log("update", device) },
    { label: "Delete", onClick: () => console.log("delete", device), variant: "danger" },
  ];

  return (
    <div className="table-view">
      <div className="table-view__header">
        <h1>Devices</h1>
        <Button variant="success" onClick={() => setModalOpen(true)}>
          <AddIcon fontSize="small" /> Add device
        </Button>
      </div>

      {error && <div className="table-view__error">{error}</div>}

      <Table
        columns={columns}
        data={devices}
        loading={loading}
        emptyMessage="No devices found."
        getMenuItems={getMenuItems}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add device">
        <form onSubmit={handleAdd} className="modal-form">
          {formError && <div className="modal-form__error">{formError}</div>}
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
    </div>
  );
};

export default DeviceList;
