import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = user?.username?.charAt(0).toUpperCase() || "?";

  return (
    <aside className={`sidebar${isOpen ? " sidebar--open" : ""}`}>
      <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
        <CloseIcon fontSize="small" />
      </button>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{initials}</div>
        <div className="sidebar-user-info">
          <span className="sidebar-email">{user?.email}</span>
          <span className="sidebar-name">{user?.username}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">MAIN</span>

        <NavLink to="/locations" onClick={onClose} className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
          <LocationOnIcon fontSize="small" /> Locations
        </NavLink>

        <NavLink to="/devices" onClick={onClose} className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
          <DeviceHubIcon fontSize="small" /> Devices
        </NavLink>

        <span className="sidebar-section-label">ADMINISTRATION</span>

        <NavLink to="/notifications" onClick={onClose} className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
          <NotificationsNoneIcon fontSize="small" /> Notifications
        </NavLink>

        <NavLink to="/settings" onClick={onClose} className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
          <SettingsOutlinedIcon fontSize="small" /> Settings
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
          <LogoutIcon fontSize="small" /> Logout Account
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
