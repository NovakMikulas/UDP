import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout/AppLayout";
import Login from "./pages/auth/Login/Login.jsx";
import Register from "./pages/auth/Register/Register.jsx";
import LocationList from "./pages/location/LocationList/LocationList.jsx";
import RoomList from "./pages/room/RoomList/RoomList.jsx";
import DeviceList from "./pages/device/DeviceList/DeviceList.jsx";
import AllDevices from "./pages/device/AllDevices/AllDevices.jsx";
import MessageList from "./pages/message/MessageList/MessageList.jsx";
import Settings from "./pages/settings/Settings/Settings.jsx";
import Notifications from "./pages/notifications/Notifications/Notifications.jsx";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/devices" element={<AllDevices />} />
              <Route path="/locations" element={<LocationList />} />
              <Route path="/locations/:locationId/rooms" element={<RoomList />} />
              <Route path="/locations/:locationId/rooms/:roomId/devices" element={<DeviceList />} />
              <Route path="/locations/:locationId/rooms/:roomId/devices/:deviceId/messages" element={<MessageList />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/locations" replace />} />
          <Route path="*" element={<div>Nothing here 404</div>} />
        </Routes>
      </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
