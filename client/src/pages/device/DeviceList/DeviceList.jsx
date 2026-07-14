import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { deviceService } from "../../../api/services/device";
import { roomService } from "../../../api/services/room";
import { useToast } from "../../../context/ToastContext";
import { OFFLINE_THRESHOLD_MS } from "../../../constants/device";
import { voltageStatus, isVoltageAlive } from "../../../constants/voltage";
import { EMPTY_DEVICE_CONFIG, CONFIG_FIELDS } from "../../../constants/deviceConfig";
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
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import useCrudModal from "../../../hooks/useCrudModal";
import "./DeviceList.css";

const DeviceList = () => {
  const { roomId, locationId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const locationName = state?.locationName || locationId;
  const roomName = state?.roomName || roomId;

  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addForm, setAddForm] = useState({ serialNumber: "", invertDirection: false, claimToken: "" });
  const [updateForm, setUpdateForm] = useState({ serialNumber: "", invertDirection: false, claimToken: "", roomId: "" });
  const [configOpen, setConfigOpen] = useState(false);
  const [configDevice, setConfigDevice] = useState(null);
  const [configForm, setConfigForm] = useState(EMPTY_DEVICE_CONFIG);
  const [configLoading, setConfigLoading] = useState(false);
  const { addToast } = useToast();

  const { selected, addOpen, setAddOpen, updateOpen, setUpdateOpen,
          deleteOpen, openAdd, openUpdate, openDelete, closeAll } = useCrudModal();

  const fetchDevices = async () => {
    try {
      const data = await deviceService.list(roomId, locationId);
      const rawDevices = data.data || [];

      const augmented = await Promise.all(
        rawDevices.map(async (device) => {
          try {
            const msgData = await messageService.list(device._id, locationId);
            const messages = (msgData.data || []).sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            const latest = messages[0];
            const age = latest ? Date.now() - new Date(latest.createdAt) : Infinity;
            const voltage = latest?.system?.voltage_rest ?? null;
            const isOnline = !!latest && isVoltageAlive(voltage) && age < OFFLINE_THRESHOLD_MS;
            return {
              ...device,
              lastMessageAt: latest?.createdAt ?? null,
              voltage,
              isOnline,
            };
          } catch {
            return { ...device, lastMessageAt: null, voltage: null, isOnline: false };
          }
        })
      );

      setDevices(augmented);
    } catch {
      addToast("Failed to load devices.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roomId || !locationId) return;
    fetchDevices();
  }, [roomId, locationId]);

  useEffect(() => {
    if (!locationId) return;
    roomService.list(locationId)
      .then((res) => setRooms(res.data || []))
      .catch(() => addToast("Failed to load rooms.", "error"));
  }, [locationId]);

  const filtered = devices.filter((d) => {
    const q = search.toLowerCase();
    return d.serialNumber?.toLowerCase().includes(q);
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await deviceService.create(locationId, {
        serialNumber: addForm.serialNumber,
        invertDirection: addForm.invertDirection,
        claimToken: addForm.claimToken,
        roomId,
      });
      setAddOpen(false);
      setAddForm({ serialNumber: "", invertDirection: false, claimToken: "" });
      fetchDevices();
      addToast("Device added successfully.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to add device.", "error");
    }
  };

  const handleOpenUpdate = (device) => {
    setUpdateForm({
      serialNumber: device.serialNumber,
      invertDirection: device.invertDirection ?? false,
      claimToken: device.claimToken ?? "",
      roomId: device.roomId?._id || device.roomId,
    });
    openUpdate(device);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await deviceService.update(selected._id, locationId, {
        serialNumber: updateForm.serialNumber,
        invertDirection: updateForm.invertDirection,
        claimToken: updateForm.claimToken,
        roomId: updateForm.roomId,
      });
      closeAll();
      fetchDevices();
      addToast("Device updated successfully.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update device.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deviceService.delete(selected._id, locationId);
      closeAll();
      fetchDevices();
      addToast("Device removed.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to remove device.", "error");
    }
  };

  const handleOpenConfig = async (device) => {
    setConfigDevice(device);
    setConfigForm(EMPTY_DEVICE_CONFIG);
    setConfigOpen(true);
    setConfigLoading(true);
    try {
      const res = await deviceService.getConfig(device._id, locationId);
      const pending = res.data || {};
      setConfigForm({
        ...EMPTY_DEVICE_CONFIG,
        ...Object.fromEntries(Object.entries(pending).map(([key, value]) => [key, String(value)])),
      });
    } catch {
      addToast("Failed to load current configuration.", "error");
    } finally {
      setConfigLoading(false);
    }
  };

  const closeConfig = () => {
    setConfigOpen(false);
    setConfigDevice(null);
  };

  const handleSubmitConfig = async (e) => {
    e.preventDefault();
    try {
      const payload = {};
      for (const field of CONFIG_FIELDS) {
        if (field.advanced && configForm.sensitivity !== "individual") continue;
        const value = configForm[field.key];
        if (value === "") continue;
        payload[field.key] = field.select ? value : Number(value);
      }
      await deviceService.setConfig(configDevice._id, locationId, payload);
      closeConfig();
      fetchDevices();
      addToast("Configuration queued for the next device connection.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to save configuration.", "error");
    }
  };

  const getMenuItems = (device) => [
    {
      label: (
        <span className="action-menu__label">
          Configure
          {device.pendingConfig && <span className="menu-item__badge" title="Configuration pending" />}
        </span>
      ),
      icon: <SettingsOutlinedIcon fontSize="small" />,
      onClick: () => handleOpenConfig(device),
    },
    { label: "Update", icon: <EditOutlinedIcon fontSize="small" />, onClick: () => handleOpenUpdate(device) },
    { label: "Delete", icon: <DeleteOutlineIcon fontSize="small" />, onClick: () => openDelete(device), variant: "danger" },
  ];

  return (
    <div className="list-view">
      <Breadcrumb items={[
        { label: "Locations", path: "/locations" },
        { label: locationName, path: `/locations/${locationId}/rooms`, state: { locationName } },
        { label: roomName },
      ]} />
      <div className="list-view__header">
        <h1>Devices</h1>
      </div>

      <div className="list-view__toolbar">
        <div className="list-view__search">
          <SearchIcon fontSize="small" />
          <input
            placeholder="Search device..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="success" onClick={() => openAdd(() => setAddForm({ serialNumber: "", invertDirection: false, claimToken: "" }))}>
          <AddIcon fontSize="small" /> Add device
        </Button>
      </div>

      {!loading && (
        <div className="card-grid-wrapper">
          <div className="card-grid-scroll">
            <div className="card-grid">
              {filtered.map((device) => (
                <Card
                  key={device._id}
                  name={device.serialNumber}
                  rows={[
                    { label: "Last message", render: device.lastMessageAt ? new Date(device.lastMessageAt).toLocaleString() : "—" },
                    { label: "Voltage", render: voltageStatus(device.voltage) },
                  ]}
                  footerLeft={device.serialNumber}
                  footerRight={
                    device.isOnline
                      ? <span className="card__status--online"><CheckCircleOutlineIcon fontSize="small" />Online</span>
                      : <span className="card__status--offline"><CancelOutlinedIcon fontSize="small" />Offline</span>
                  }
                  onClick={() => navigate(
                    `/locations/${locationId}/rooms/${roomId}/devices/${device._id}/messages`,
                    { state: { locationName, roomName, deviceSerial: device.serialNumber } }
                  )}
                  getMenuItems={() => getMenuItems(device)}
                />
              ))}
              {filtered.length === 0 && (
                <p className="card-grid__empty">No devices found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={addOpen} onClose={closeAll} title="Add device">
        <form onSubmit={handleAdd} className="modal-form">

          <p className="modal-notice">You can find the serial number and claim token by scanning the QR code on the device with your phone's camera or a QR scanner app.</p>
          <Input
            id="serialNumber"
            label="Serial number"
            value={addForm.serialNumber}
            onChange={(e) => setAddForm({ ...addForm, serialNumber: e.target.value })}
            pattern="[0-9]{10,}"
            minLength={10}
            title="Serial number must be at least 10 digits"
            required
          />
          <Input id="claimToken" label="Claim token" value={addForm.claimToken} onChange={(e) => setAddForm({ ...addForm, claimToken: e.target.value })} required />
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={addForm.invertDirection}
              onChange={(e) => setAddForm({ ...addForm, invertDirection: e.target.checked })}
            />
            Flip direction (sensor mounted facing the other way)
          </label>
          <Button type="submit" variant="success" fullWidth>Create</Button>
        </form>
      </Modal>

      <Modal isOpen={updateOpen} onClose={closeAll} title="Update device">
        <form onSubmit={handleUpdate} className="modal-form">

          <p className="modal-notice">You can find the serial number and claim token by scanning the QR code on the device with your phone's camera or a QR scanner app.</p>
          <Input
            id="serialNumber"
            label="Serial number"
            value={updateForm.serialNumber}
            onChange={(e) => setUpdateForm({ ...updateForm, serialNumber: e.target.value })}
            pattern="[0-9]{10,}"
            minLength={10}
            title="Serial number must be at least 10 digits"
            required
          />
          <Input id="claimToken" label="Claim token" value={updateForm.claimToken} onChange={(e) => setUpdateForm({ ...updateForm, claimToken: e.target.value })} required />
          <div className="input-group">
            <label htmlFor="roomId">Room</label>
            <select
              id="roomId"
              value={updateForm.roomId}
              onChange={(e) => setUpdateForm({ ...updateForm, roomId: e.target.value })}
              required
            >
              {rooms.map((room) => <option key={room._id} value={room._id}>{room.name}</option>)}
            </select>
          </div>
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={updateForm.invertDirection}
              onChange={(e) => setUpdateForm({ ...updateForm, invertDirection: e.target.checked })}
            />
            Flip direction (sensor mounted facing the other way)
          </label>
          <Button type="submit" variant="success" fullWidth>Save changes</Button>
        </form>
      </Modal>

      <Modal isOpen={configOpen} onClose={closeConfig} title="Configure device">
        <form onSubmit={handleSubmitConfig} className="modal-form">
          <p className="modal-notice">Configuration will be applied on the next device connection.</p>
          {configLoading ? (
            <p>Loading current configuration…</p>
          ) : (
            <>
              {CONFIG_FIELDS.filter((field) => !field.advanced || configForm.sensitivity === "individual").map((field) => (
                field.select ? (
                  <div className="input-group" key={field.key}>
                    <label htmlFor={field.key}>{field.label}</label>
                    <select
                      id={field.key}
                      value={configForm[field.key]}
                      onChange={(e) => setConfigForm({ ...configForm, [field.key]: e.target.value })}
                    >
                      <option value="">—</option>
                      {field.select.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <p className="input-hint">{field.hint}</p>
                  </div>
                ) : (
                  <Input
                    key={field.key}
                    id={field.key}
                    label={field.label}
                    type="number"
                    min={field.min}
                    max={field.max}
                    value={configForm[field.key]}
                    onChange={(e) => setConfigForm({ ...configForm, [field.key]: e.target.value })}
                    hint={field.hint}
                  />
                )
              ))}
              <Button type="submit" variant="success" fullWidth>Save configuration</Button>
            </>
          )}
        </form>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={closeAll} title="Delete device">
        <div className="modal-form">

          <p>Are you sure you want to delete <strong>{selected?.serialNumber}</strong>? This action cannot be undone.</p>
          <div>
            <Button variant="primary" fullWidth onClick={closeAll}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DeviceList;
