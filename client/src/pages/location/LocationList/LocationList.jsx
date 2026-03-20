import { useState, useEffect } from "react";
import { locationService } from "../../../api/services/location";
import Button from "../../../components/ui/Button/Button";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "./LocationList.css";

const LocationList = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    locationService.list()
      .then((data) => setLocations(data.data || []))
      .catch(() => setError("Failed to load locations."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="location-list">
      <div className="location-list-header">
        <h1>Locations</h1>
        <Button variant="success"><AddIcon fontSize="small" /> Add location</Button>
      </div>

      {error && <div className="location-error">{error}</div>}

      {!loading && !error && (
        <table className="location-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Name</th>
              <th>Address</th>
              <th>Owner</th>
              <th>Members</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr key={loc._id}>
                <td><input type="checkbox" /></td>
                <td>{loc.name}</td>
                <td>{loc.address}</td>
                <td>
                  <div className="owner-cell">
                    <span className="table-avatar">{loc.owner?.username?.charAt(0).toUpperCase()}</span>
                    {loc.owner?.username}
                  </div>
                </td>
                <td>
                  <div className="members-cell">
                    {loc.members?.slice(0, 5).map((m, i) => (
                      <span key={i} className="table-avatar">{m.username?.charAt(0).toUpperCase()}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <button className="icon-btn"><MoreVertIcon fontSize="small" /></button>
                </td>
              </tr>
            ))}
            {locations.length === 0 && (
              <tr>
                <td colSpan={6} className="location-empty">No locations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LocationList;
