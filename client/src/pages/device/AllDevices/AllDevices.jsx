import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deviceService } from "../../../api/services/device";
import { messageService } from "../../../api/services/message";
import { useToast } from "../../../context/ToastContext";
import { OFFLINE_THRESHOLD_MS } from "../../../constants/device";
import { voltageStatus, isVoltageAlive } from "../../../constants/voltage";
import Breadcrumb from "../../../components/ui/Breadcrumb/Breadcrumb";
import Card from "../../../components/ui/Card/Card";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

const AllDevices = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDevices = async () => {
    try {
      const data = await deviceService.listAll();
      const rawDevices = data.data || [];

      const augmented = await Promise.all(
        rawDevices.map(async (device) => {
          const locationId = device.roomId?.locationId?._id;
          if (!locationId) return { ...device, lastMessageAt: null, voltage: null, isOnline: false };
          try {
            const msgData = await messageService.list(device._id, locationId);
            const messages = (msgData.data || []).sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            );
            const latest = messages[0];
            const age = latest ? Date.now() - new Date(latest.createdAt) : Infinity;
            const voltage = latest?.system?.voltage_rest ?? null;
            const isOnline = !!latest && isVoltageAlive(voltage) && age < OFFLINE_THRESHOLD_MS;
            return { ...device, lastMessageAt: latest?.createdAt ?? null, voltage, isOnline };
          } catch {
            return { ...device, lastMessageAt: null, voltage: null, isOnline: false };
          }
        }),
      );

      setDevices(augmented);
    } catch {
      addToast("Failed to load devices.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const filtered = devices.filter((d) => {
    const q = search.toLowerCase();
    const locationName = d.roomId?.locationId?.name || "";
    const roomName = d.roomId?.name || "";
    return (
      d.serialNumber?.toLowerCase().includes(q) ||
      locationName.toLowerCase().includes(q) ||
      roomName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="list-view">
      <Breadcrumb items={[{ label: "Devices" }]} />
      <div className="list-view__header">
        <h1>All Devices</h1>
      </div>

      <div className="list-view__toolbar">
        <div className="list-view__search">
          <SearchIcon fontSize="small" />
          <input
            placeholder="Search device, location, room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {!loading && (
        <div className="card-grid-wrapper">
          <div className="card-grid-scroll">
            <div className="card-grid">
              {filtered.map((device) => {
                const locationId = device.roomId?.locationId?._id;
                const locationName = device.roomId?.locationId?.name || "—";
                const roomId = device.roomId?._id;
                const roomName = device.roomId?.name || "—";

                return (
                  <Card
                    key={device._id}
                    name={device.serialNumber}
                    rows={[
                      { label: "Location", render: locationName },
                      { label: "Room", render: roomName },
                      { label: "Last message", render: device.lastMessageAt ? new Date(device.lastMessageAt).toLocaleString() : "—" },
                      { label: "Voltage", render: voltageStatus(device.voltage) },
                    ]}
                    footerLeft={device.serialNumber}
                    footerRight={
                      device.isOnline
                        ? <><CheckCircleOutlineIcon fontSize="small" />Online</>
                        : <span className="card__status--offline"><CancelOutlinedIcon fontSize="small" />Offline</span>
                    }
                    onClick={() => locationId && roomId && navigate(
                      `/locations/${locationId}/rooms/${roomId}/devices/${device._id}/messages`,
                      { state: { locationName, roomName, deviceSerial: device.serialNumber } },
                    )}
                  />
                );
              })}
              {filtered.length === 0 && <p className="card-grid__empty">No devices found.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllDevices;
