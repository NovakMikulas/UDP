import "./Button.css";

const Button = ({ children, onClick, type = "button", variant = "primary", fullWidth = false }) => {
  const classes = ["btn", `btn--${variant}`, fullWidth && "btn--full"].filter(Boolean).join(" ");

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
};

export default Button;
