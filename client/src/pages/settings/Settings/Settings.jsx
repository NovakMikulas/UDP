import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { userService } from "../../../api/services/user";
import Input from "../../../components/ui/Input/Input";
import Button from "../../../components/ui/Button/Button";
import "./Settings.css";

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const initials = user?.username?.charAt(0).toUpperCase() || "?";

  const [basicForm, setBasicForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [darkMode, setDarkMode] = useState(false);

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBasicSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await userService.update(basicForm);
      updateUser(res.data);
      setBasicForm({ username: res.data.username, email: res.data.email });
      addToast("Profile updated successfully.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update profile.", "error");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.changePassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      addToast("Password changed successfully.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to change password.", "error");
    }
  };

  return (
    <div className="settings-view">
      <h1>Settings</h1>
      <div className="settings-card">
        <div className="settings-avatar-col">
          <div className="settings-avatar">{initials}</div>
        </div>

        <div className="settings-sections">
          <section className="settings-section">
            <span className="settings-section-label">BASIC INFORMATION</span>
            <form onSubmit={handleBasicSubmit} className="settings-form">
              <Input id="username" label="Username" value={basicForm.username} onChange={handleBasicChange} />
              <Input id="email" label="E-mail" type="email" value={basicForm.email} onChange={handleBasicChange} />
              <Button type="submit" variant="primary">Save changes</Button>
            </form>
          </section>

          <hr className="settings-divider" />

          <section className="settings-section">
            <span className="settings-section-label">CHANGE PASSWORD</span>
            <form onSubmit={handlePasswordSubmit} className="settings-form">
              <Input id="currentPassword" label="Current password" type="password" value={passwordForm.currentPassword} onChange={handlePasswordChange} />
              <Input id="newPassword" label="New password" type="password" value={passwordForm.newPassword} onChange={handlePasswordChange} />
              <Input id="confirmPassword" label="Confirm new password" type="password" value={passwordForm.confirmPassword} onChange={handlePasswordChange} />
              <Button type="submit" variant="primary">Save changes</Button>
            </form>
          </section>

          <hr className="settings-divider" />

          <section className="settings-section">
            <span className="settings-section-label">VISUAL</span>
            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <span className="settings-toggle-title">Dark mode</span>
                <span className="settings-toggle-desc">Change to dark theme of the application</span>
              </div>
              <label className="settings-toggle">
                <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
                <span className="settings-toggle__track">
                  <span className="settings-toggle__thumb" />
                </span>
                <span className="settings-toggle__label">{darkMode ? "On" : "Off"}</span>
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
