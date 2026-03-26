import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import "./AppLayout.css";

const AppLayout = () => (
  <div className="app-layout">
    <Sidebar />
    <main>
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
