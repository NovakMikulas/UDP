import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { messageService } from "../../../api/services/message";
import { useToast } from "../../../context/ToastContext";
import socket from "../../../api/socket";
import Table from "../../../components/ui/Table/Table";
import Modal from "../../../components/ui/Modal/Modal";
import Breadcrumb from "../../../components/ui/Breadcrumb/Breadcrumb";
import { voltageStatus } from "../../../constants/voltage";
import "./MessageList.css";

const PAGE_SIZE = 20;
const SCROLL_THRESHOLD = 120;

// motion.totalizer is a cumulative lifetime counter on the device, so passages
// for this report are the delta against the previous (chronologically earlier)
// message for the same device. messages are sorted newest-first, so the
// previous report sits at index i + 1.
function withMotionDeltas(messages) {
  return messages.map((msg, i) => {
    const prevTotalizer = messages[i + 1]?.motion?.totalizer;
    const totalizer = msg.motion?.totalizer;
    const delta = (key) => {
      if (!totalizer || !prevTotalizer) return 0;
      return Math.max(0, (totalizer[key] ?? 0) - (prevTotalizer[key] ?? 0));
    };
    return { ...msg, motionLeftDelta: delta("motion_left"), motionRightDelta: delta("motion_right") };
  });
}

const columns = [
  { header: "Time",         render: (msg) => new Date(msg.createdAt).toLocaleString() },
  { header: "Motion Left",  render: (msg) => msg.motionLeftDelta },
  { header: "Motion Right", render: (msg) => msg.motionRightDelta },
  { header: "Temperature",  render: (msg) => msg.thermometer?.temperature != null ? `${msg.thermometer.temperature} °C` : "—" },
  { header: "Samples",      render: (msg) => msg.motion?.samples?.length ?? 0 },
  { header: "Voltage",      render: (msg) => voltageStatus(msg.system?.voltage_rest) },
];

const MsgCard = ({ msg, onClick }) => (
  <div className="msg-card" onClick={onClick}>
    <div className="msg-card__time">{new Date(msg.createdAt).toLocaleString()}</div>
    <div className="msg-card__rows">
      <div className="msg-card__row">
        <span className="msg-card__label">Motion left</span>
        <span className="msg-card__value">{msg.motionLeftDelta}</span>
      </div>
      <div className="msg-card__row">
        <span className="msg-card__label">Motion right</span>
        <span className="msg-card__value">{msg.motionRightDelta}</span>
      </div>
      <div className="msg-card__row">
        <span className="msg-card__label">Samples</span>
        <span className="msg-card__value">{msg.motion?.samples?.length ?? 0}</span>
      </div>
    </div>
    <div className="msg-card__divider" />
    <div className="msg-card__footer">
      <span className="msg-card__temp">
        {msg.thermometer?.temperature != null ? `${msg.thermometer.temperature} °C` : "—"}
      </span>
      <span className="msg-card__voltage">
        {voltageStatus(msg.system?.voltage_rest)}
      </span>
    </div>
  </div>
);

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
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 768px)").matches);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const pageRef = useRef(1);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const loadPage = (page, append) =>
    messageService.list(deviceId, locationId, page, PAGE_SIZE).then((data) => {
      pageRef.current = page;
      setMessages((prev) => withMotionDeltas(append ? [...prev, ...(data.data || [])] : data.data || []));
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
      setMessages((prev) => withMotionDeltas([msg, ...prev]));
    });
    return () => {
      socket.off("new_message");
      socket.disconnect();
    };
  }, [deviceId]);

  return (
    <div className="list-view">
      <Breadcrumb items={[
        { label: "Locations", path: "/locations" },
        { label: locationName, path: `/locations/${locationId}/rooms`, state: { locationName } },
        { label: roomName, path: `/locations/${locationId}/rooms/${roomId}/devices`, state: { locationName, roomName } },
        { label: deviceSerial },
      ]} />
      <div className="list-view__header">
        <h1>Messages</h1>
      </div>
      {isMobile ? (
        <div className="msg-card-list" onScroll={handleScroll}>
          {loading && <p className="msg-card-list__state">Loading…</p>}
          {!loading && messages.length === 0 && <p className="msg-card-list__state">No messages found.</p>}
          {messages.map((msg) => <MsgCard key={msg._id} msg={msg} onClick={() => setSelectedMessage(msg)} />)}
          {loadingMore && <p className="msg-card-list__state">Loading more messages…</p>}
        </div>
      ) : (
        <Table
          columns={columns}
          data={messages}
          loading={loading}
          emptyMessage="No messages found."
          onScroll={handleScroll}
          onRowClick={setSelectedMessage}
          footer={loadingMore ? "Loading more messages…" : null}
        />
      )}

      <Modal isOpen={!!selectedMessage} onClose={() => setSelectedMessage(null)} title="Message details">
        <pre className="message-json">
          {selectedMessage && JSON.stringify(
            (({ motionLeftDelta, motionRightDelta, ...raw }) => raw)(selectedMessage),
            null,
            2
          )}
        </pre>
      </Modal>
    </div>
  );
};

export default MessageList;
