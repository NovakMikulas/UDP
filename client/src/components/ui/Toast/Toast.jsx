import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CloseIcon from "@mui/icons-material/Close";
import "./Toast.css";

const Toast = ({ toast, onRemove }) => (
  <div className={`toast toast--${toast.type}`}>
    <span className="toast__icon">
      {toast.type === "success"
        ? <CheckCircleOutlineIcon fontSize="small" />
        : <CancelOutlinedIcon fontSize="small" />}
    </span>
    <span className="toast__message">{toast.message}</span>
    <button className="toast__close" onClick={() => onRemove(toast.id)}>
      <CloseIcon fontSize="small" />
    </button>
  </div>
);

export default Toast;
