import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
    const [open, setOpen] = React.useState(false);
    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };
    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <div style={{ flex: 1, padding: "20px" }}>
                <Outlet /> {/* Hiển thị nội dung UserManagement hoặc BookManagement */}
            </div>
        </div>
    );
};

export default AdminLayout;
