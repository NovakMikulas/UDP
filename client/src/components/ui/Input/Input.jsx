import "./Input.css";

const Input = ({ id, label, type = "text", value, onChange, placeholder, required, min, max, pattern, minLength, title, hint }) => (
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
      min={min}
      max={max}
      pattern={pattern}
      minLength={minLength}
      title={title}
    />
    {hint && <p className="input-hint">{hint}</p>}
  </div>
);

export default Input;
