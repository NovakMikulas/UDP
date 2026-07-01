import { useState, useEffect } from "react";
import { locationService } from "../../../api/services/location";
import { useToast } from "../../../context/ToastContext";
import Breadcrumb from "../../../components/ui/Breadcrumb/Breadcrumb";
import Button from "../../../components/ui/Button/Button";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import "./Notifications.css";

const Notifications = () => {
  const { addToast } = useToast();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    try {
      const data = await locationService.listInvitations();
      setInvitations(data.data || []);
    } catch {
      addToast("Failed to load notifications.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAccept = async (locationId) => {
    try {
      await locationService.acceptInvite(locationId);
      setInvitations((prev) => prev.filter((inv) => inv._id !== locationId));
      addToast("Invitation accepted.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to accept invitation.", "error");
    }
  };

  const handleDecline = async (locationId) => {
    try {
      await locationService.declineInvite(locationId);
      setInvitations((prev) => prev.filter((inv) => inv._id !== locationId));
      addToast("Invitation declined.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to decline invitation.", "error");
    }
  };

  return (
    <div className="table-view">
      <Breadcrumb items={[{ label: "Notifications" }]} />
      <div className="table-view__header">
        <h1>Notifications</h1>
      </div>

      {!loading && (
        <div className="notifications-list">
          {invitations.length === 0 ? (
            <p className="notifications-empty">No pending invitations.</p>
          ) : (
            invitations.map((location) => (
              <div key={location._id} className="notification-card">
                <div className="notification-info">
                  <span className="notification-title">
                    You've been invited to <strong>{location.name}</strong>
                  </span>
                  <span className="notification-meta">
                    {location.owner?.username && `by ${location.owner.username}`}
                    {location.invitations?.[0]?.createdAt &&
                      ` · ${new Date(location.invitations[0].createdAt).toLocaleDateString()}`}
                  </span>
                </div>
                <div className="notification-actions">
                  <Button variant="success" onClick={() => handleAccept(location._id)}>
                    <CheckCircleOutlineIcon fontSize="small" /> Accept
                  </Button>
                  <Button variant="danger" onClick={() => handleDecline(location._id)}>
                    <CancelOutlinedIcon fontSize="small" /> Decline
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
