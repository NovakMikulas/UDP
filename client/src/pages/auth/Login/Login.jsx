import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import "./Login.css";

const Login = () => {
 const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState(""); 
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // Reset error message on new attempt

    try {
      await login(username, password);
      navigate("/locations");
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong. Please try again.";
      setErrorMsg(message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <form onSubmit={handleSubmit} className="login-form">
          <h1>Login</h1>
          {errorMsg && <div className="error-banner">{errorMsg}</div>}
          <Input
            id="username"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />

          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          
          <div className="forgot-password">
            <span>Forgot Password?</span>
          </div>
          
          <Button type="submit" fullWidth>Sign in</Button>
          
          <div className="signup-link">
            Don't have an account? <span onClick={() => navigate("/register")}>Sign up</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;