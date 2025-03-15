import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, IconButton, Select, MenuItem,
  TextField
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [searchEmail]);

  // Lấy danh sách user
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
        return;
      }
      const response = await axios.get("http://localhost:9999/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (searchEmail) {
        const UserFiltered = response.data.filter(user => user.email.toLowerCase().includes(searchEmail.toLowerCase()));
        setUsers(UserFiltered);
      } else {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Xóa người dùng
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
          return;
        }
        await axios.delete(`http://localhost:9999/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(users.filter(user => user._id !== userId));
      } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
      }
    }
  };

  // Thay đổi vai trò
  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
        return;
      }
      await axios.put(`http://localhost:9999/admin/users/${userId}`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(user => user._id === userId ? { ...user, role: newRole } : user));
    } catch (error) {
      console.error("Lỗi khi cập nhật vai trò:", error);
    }
  };

  return (
    <Box sx={{ padding: 3, width: "100%", maxWidth: "calc(100% - 250px)", margin: "auto" }}>
      <Typography variant="h4" gutterBottom>Quản lý Người Dùng</Typography>
      <Box sx={{ display: "flex", gap: 3, marginBottom: 2 }}>
        <TextField
          label="Tìm kiếm email"
          variant="outlined"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>STT</b></TableCell>
              <TableCell><b>Tên</b></TableCell>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>SĐT</b></TableCell>
              <TableCell><b>Địa chỉ</b></TableCell>
              <TableCell><b>Điểm</b></TableCell>
              <TableCell><b>Vai trò</b></TableCell>
              <TableCell><b>Hành động</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.address}</TableCell>
                <TableCell>{user.point}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDeleteUser(user._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserManagement;
