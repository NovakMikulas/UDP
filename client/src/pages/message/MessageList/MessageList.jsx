import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { messageService } from "../../../api/services/message";
import { useToast } from "../../../context/ToastContext";
import socket from "../../../api/socket";
import Table from "../../../components/ui/Table/Table";
import Breadcrumb from "../../../components/ui/Breadcrumb/Breadcrumb";
import { voltageStatus } from "../../../constants/voltage";
import "./MessageList.css";

const PAGE_SIZE = 20;
const SCROLL_THRESHOLD = 120;

const columns = [
  { header: "Time",         render: (msg) => new Date(msg.createdAt).toLocaleString() },
  { header: "Motion Left",  render: (msg) => msg.motion?.totalizer?.motion_left ?? "—" },
  { header: "Motion Right", render: (msg) => msg.motion?.totalizer?.motion_right ?? "—" },
  { header: "Temperature",  render: (msg) => msg.thermometer?.temperature != null ? `${msg.thermometer.temperature} °C` : "—" },
  { header: "Samples",      render: (msg) => msg.motion?.samples ? msg.motion.samples.length - 1 : 0 },
  { header: "Voltage",      render: (msg) => voltageStatus(msg.system?.voltage_rest) },
];

const MessageList = () => {
  const { deviceId, locationId, roomId } = useParams();
  const { state } = useLocation();
  const locationName = state?.locationName || locationId;
  const roomName = state?.roomName || roomId;
  const deviceSerial = state?.deviceSerial || deviceId;
  const { addToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);

  const loadPage = (page, append) =>
    messageService.list(deviceId, locationId, page, PAGE_SIZE).then((data) => {
      pageRef.current = page;
      setMessages((prev) => (append ? [...prev, ...(data.data || [])] : data.data || []));
      setHasMore(Boolean(data.pagination && data.pagination.page < data.pagination.totalPages));
    });

  useEffect(() => {
    if (!deviceId || !locationId) return;
    setLoading(true);
    pageRef.current = 1;
    loadPage(1, false)
      .catch(() => addToast("Failed to load messages.", "error"))
      .finally(() => setLoading(false));
  }, [deviceId, locationId]);

  const handleScroll = (e) => {
    if (loading || loadingMore || !hasMore) return;
    const el = e.target;
    if (el.scrollHeight - el.scrollTop - el.clientHeight > SCROLL_THRESHOLD) return;
    setLoadingMore(true);
    loadPage(pageRef.current + 1, true)
      .catch(() => addToast("Failed to load more messages.", "error"))
      .finally(() => setLoadingMore(false));
  };

  useEffect(() => {
    socket.connect();
    socket.on("new_message", (msg) => {
      if (msg.deviceId !== deviceId) return;
      setMessages((prev) => [msg, ...prev]);
    });
    return () => {
      socket.off("new_message");
      socket.disconnect();
    };
  }, [deviceId]);

  return (
    <div className="table-view">
      <Breadcrumb items={[
        { label: "Locations", path: "/locations" },
        { label: locationName, path: `/locations/${locationId}/rooms`, state: { locationName } },
        { label: roomName, path: `/locations/${locationId}/rooms/${roomId}/devices`, state: { locationName, roomName } },
        { label: deviceSerial },
      ]} />
      <div className="table-view__header">
        <h1>Messages</h1>
      </div>
      <Table
        columns={columns}
        data={messages}
        loading={loading}
        emptyMessage="No messages found."
        onScroll={handleScroll}
        footer={loadingMore ? "Loading more messages…" : null}
      />
    </div>
  );
};

export default MessageList;
