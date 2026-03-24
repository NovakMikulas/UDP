import { useEffect, useRef } from "react";
import "./ActionMenu.css";

const ActionMenu = ({ items, onClose, anchorEl }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !anchorEl?.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, anchorEl]);

  return (
    <div className="action-menu" ref={menuRef}>
      {items.map((item, i) => (
        <button
          key={i}
          className={`action-menu__item${item.variant ? ` action-menu__item--${item.variant}` : ""}`}
          onClick={(e) => { e.stopPropagation(); item.onClick(); onClose(); }}
        >
          {item.icon && <span className="action-menu__icon">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default ActionMenu;
