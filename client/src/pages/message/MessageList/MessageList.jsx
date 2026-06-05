import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { messageService } from "../../../api/services/message";
import { useToast } from "../../../context/ToastContext";
import socket from "../../../api/socket";
import Table from "../../../components/ui/Table/Table";
import Breadcrumb from "../../../components/ui/Breadcrumb/Breadcrumb";
import "./MessageList.css";

const columns = [
  { header: "Time",    render: (msg) => new Date(msg.createdAt).toLocaleString() },
  { header: "In",      render: (msg) => msg.in },
  { header: "Out",     render: (msg) => msg.out },
  { header: "Battery", render: (msg) => (msg.battery != null ? `${msg.battery}%` : "—") },
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

  useEffect(() => {
    if (!deviceId || !locationId) return;
    messageService
      .list(deviceId, locationId)
      .then((data) => setMessages(data.data || []))
      .catch(() => addToast("Failed to load messages.", "error"))
      .finally(() => setLoading(false));
  }, [deviceId, locationId]);

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
      <Table columns={columns} data={messages} loading={loading} emptyMessage="No messages found." />
    </div>
  );
};

export default MessageList;
