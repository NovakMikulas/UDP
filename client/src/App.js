import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout/AppLayout";
import Login from "./pages/auth/Login/Login.jsx";
import Register from "./pages/auth/Register/Register.jsx";
import LocationList from "./pages/location/LocationList/LocationList.jsx";
import RoomList from "./pages/room/RoomList/RoomList.jsx";
import DeviceList from "./pages/device/DeviceList/DeviceList.jsx";
import MessageList from "./pages/message/MessageList/MessageList.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/locations" element={<LocationList />} />
              <Route path="/locations/:locationId/rooms" element={<RoomList />} />
              <Route path="/locations/:locationId/rooms/:roomId/devices" element={<DeviceList />} />
              <Route path="/locations/:locationId/rooms/:roomId/devices/:deviceId/messages" element={<MessageList />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/locations" replace />} />
          <Route path="*" element={<div>Nothing here 404</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
