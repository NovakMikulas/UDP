import { useState } from "react";
import { authService } from "../../../api/services/auth.js";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import "./Register.css";

const Register = () => {
//Form states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // States for handling messages
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const navigate = useNavigate();

  // Handle input changes for all form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMsg("");
  setSuccessMsg("");

  if (formData.password !== formData.confirmPassword) {
    setErrorMsg("Passwords do not match");
    return;
  }

  try {
    const { username, email, password } = formData;
    const response = await authService.register(username, email, password);
    setSuccessMsg(response.message || "Successfully registered");
    setFormData({ username: "", email: "", password: "", confirmPassword: "" });
    setTimeout(() => {
      navigate("/login");
    }, 2000);

  } catch (err) {
    const message = err.response?.data?.message || "Error during registration";
    setErrorMsg(message);
  }
};

  return (
    <div className="register-wrapper">
      <div className="register-box">
        <form onSubmit={handleSubmit} className="register-form">
          <h1>Register</h1>

          {errorMsg && <div className="error-banner">{errorMsg}</div>}
          {successMsg && <div className="success-banner">{successMsg}</div>}

          <Input
            id="username"
            label="Username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
          />

          <Input
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@domain.com"
            required
          />

          <Input
            id="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <Input
            id="confirmPassword"
            label="Confirm password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <Button type="submit" fullWidth>Sign up</Button>

          <div className="signin-link">
            Already have an account? <span onClick={() => navigate("/login")}>Sign in</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;