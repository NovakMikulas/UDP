import "./Input.css";

const Input = ({ id, label, type = "text", value, onChange, placeholder, required }) => (
  <div className="input-group">
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
    />
  </div>
);

export default Input;
