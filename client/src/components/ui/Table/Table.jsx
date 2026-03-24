import { useState, useRef } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ActionMenu from "../ActionMenu/ActionMenu";
import "./Table.css";

const Table = ({ columns, data, emptyMessage = "No data found.", onRowClick, loading, getMenuItems }) => {
  const [openRowId, setOpenRowId] = useState(null);
  const anchorRefs = useRef({});
  const colSpan = columns.length + (getMenuItems ? 1 : 0);

  return (
    <table className="ui-table">
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th key={i} style={col.width ? { width: col.width } : undefined}>
              {col.header}
            </th>
          ))}
          {getMenuItems && <th className="ui-table__actions" />}
        </tr>
      </thead>
      <tbody>
        {!loading && data.map((row, i) => (
          <tr
            key={row._id ?? i}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={onRowClick ? "ui-table__row--clickable" : undefined}
          >
            {columns.map((col, j) => (
              <td key={j}>{col.render(row)}</td>
            ))}
            {getMenuItems && (
              <td className="ui-table__actions">
                <div style={{ position: "relative" }}>
                  <button
                    ref={(el) => (anchorRefs.current[row._id ?? i] = el)}
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenRowId(openRowId === (row._id ?? i) ? null : (row._id ?? i));
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </button>
                  {openRowId === (row._id ?? i) && (
                    <ActionMenu
                      items={getMenuItems(row)}
                      onClose={() => setOpenRowId(null)}
                      anchorEl={anchorRefs.current[row._id ?? i]}
                    />
                  )}
                </div>
              </td>
            )}
          </tr>
        ))}

        {!loading && data.length === 0 && (
          <tr>
            <td colSpan={colSpan} className="ui-table__empty">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default Table;
