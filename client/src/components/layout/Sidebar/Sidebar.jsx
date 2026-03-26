import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import HomeIcon from "@mui/icons-material/Home";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import HelpIcon from "@mui/icons-material/Help";
import LogoutIcon from "@mui/icons-material/Logout";
import "./Sidebar.css";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = user?.username?.charAt(0).toUpperCase() || "?";

  return (
    <aside className="sidebar">
      <div className="sidebar-user">
        <div className="sidebar-avatar">{initials}</div>
        <div className="sidebar-user-info">
          <span className="sidebar-email">{user?.email}</span>
          <span className="sidebar-name">{user?.username}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span>MAIN</span>

        <NavLink to="/locations" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
          <LocationOnIcon fontSize="small" /> Locations
        </NavLink>

        <NavLink to="/devices" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
          <DeviceHubIcon fontSize="small" /> Devices
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
