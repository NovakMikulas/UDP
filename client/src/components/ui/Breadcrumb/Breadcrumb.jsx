import { Link } from "react-router-dom";
import "./Breadcrumb.css";

const Breadcrumb = ({ items }) => (
  <nav className="breadcrumb">
    {items.map((item, i) => (
      <span key={item.label} className="breadcrumb__item">
        {i > 0 && <span className="breadcrumb__separator">/</span>}
        {item.path ? (
          <Link to={item.path} state={item.state} className="breadcrumb__link">
            {item.label}
          </Link>
        ) : (
          <span className="breadcrumb__current">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

export default Breadcrumb;
