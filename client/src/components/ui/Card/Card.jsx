import { useRef, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ActionMenu from "../ActionMenu/ActionMenu";
import "./Card.css";

const Card = ({ name, rows = [], extra, footerLeft, footerRight, onClick, getMenuItems }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const anchorRef = useRef(null);

  return (
    <div className="card" onClick={onClick}>
      <div className="card__header">
        <span className="card__name">{name}</span>
        {getMenuItems && (
          <div className="relative">
            <button
              ref={anchorRef}
              className="icon-btn"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            >
              <MoreVertIcon fontSize="small" />
            </button>
            {menuOpen && (
              <ActionMenu
                items={getMenuItems()}
                onClose={() => setMenuOpen(false)}
                anchorEl={anchorRef.current}
              />
            )}
          </div>
        )}
      </div>

      <div className="card__rows">
        {rows.map((row, i) => (
          <div key={i} className="card__row">
            <span className="card__label">{row.label}</span>
            <span className="card__value">{row.render}</span>
          </div>
        ))}
      </div>

      {extra && <div className="card__extra">{extra}</div>}

      {(footerLeft !== undefined || footerRight !== undefined) && (
        <>
          <div className="card__divider" />
          <div className="card__footer">
            <span className="card__footer-left">{footerLeft}</span>
            <span className="card__footer-right">{footerRight}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default Card;
