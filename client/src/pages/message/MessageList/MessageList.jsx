import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { messageService } from "../../../api/services/message";
import Table from "../../../components/ui/Table/Table";
import "./MessageList.css";

const columns = [
  {
    header: "Time",
    render: (msg) => new Date(msg.createdAt).toLocaleString(),
  },
  {
    header: "In",
    render: (msg) => msg.in,
  },
  {
    header: "Out",
    render: (msg) => msg.out,
  },
  {
    header: "Battery",
    render: (msg) => (msg.battery != null ? `${msg.battery}%` : "—"),
  },
];

const MessageList = () => {
  const { deviceId, locationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!deviceId || !locationId) return;
    messageService
      .list(deviceId, locationId)
      .then((data) => setMessages(data.data || []))
      .catch(() => setError("Failed to load messages."))
      .finally(() => setLoading(false));
  }, [deviceId, locationId]);

  return (
    <div className="table-view">
      <div className="table-view__header">
        <h1>Messages</h1>
      </div>

      {error && <div className="table-view__error">{error}</div>}

      <Table
        columns={columns}
        data={messages}
        loading={loading}
        emptyMessage="No messages found."
      />
    </div>
  );
};

export default MessageList;
