import "./Button.css";

const Button = ({ children, onClick, type = "button", variant = "primary", fullWidth = false, disabled = false, title }) => {
  const classes = ["btn", `btn-${variant}`, fullWidth && "btn-full"].filter(Boolean).join(" ");

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled} title={title}>
      {children}
    </button>
  );
};

export default Button;
