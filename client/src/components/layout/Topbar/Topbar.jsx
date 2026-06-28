import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../../../context/AuthContext";
import "./Topbar.css";

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const initials = user?.username?.charAt(0).toUpperCase() || "?";

  return (
    <header className="topbar">
      <button className="topbar-menu-btn" onClick={onMenuClick}>
        <MenuIcon />
      </button>
      <div className="topbar-avatar">{initials}</div>
    </header>
  );
};

export default Topbar;
