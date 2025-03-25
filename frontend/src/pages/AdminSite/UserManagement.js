import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Select, MenuItem,
  TextField, TablePagination, Switch, FormControlLabel
} from "@mui/material";
import axios from "axios";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterActive, setFilterActive] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, [searchEmail, filterActive]);

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
      
      let filteredUsers = response.data;
      
      if (searchEmail) {
        filteredUsers = filteredUsers.filter(user => 
          user.email.toLowerCase().includes(searchEmail.toLowerCase())
        );
      }
      
      if (filterActive !== "all") {
        const isActiveStatus = filterActive === "active" ? true : false;
        filteredUsers = filteredUsers.filter(user => user.isActivated === isActiveStatus);
      }
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleActiveStatusChange = async (user) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
        return;
      }
      // Log the current user before change for debugging      
      const response = await axios.put(
        `http://localhost:9999/admin/users/${user._id}/change-status`, 
        {}, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      // Log the response for debugging
      console.log("Change status response:", response.data);
  
      // Update the entire users array with the new status
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u._id === user._id 
            ? { ...u, isActivated: !u.isActivated } 
            : u
        )
      );
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái người dùng:", error.response ? error.response.data : error);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ padding: 3, width: "100%", maxWidth: "calc(100% - 250px)", margin: "auto" }}>
      <Typography variant="h4" gutterBottom>Quản lý Người Dùng</Typography>
      <Box sx={{ display: "flex", gap: 3, marginBottom: 2, alignItems: "center" }}>
        <TextField
          label="Tìm kiếm email"
          variant="outlined"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <Select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          variant="outlined"
          sx={{ width: 200 }}
        >
          <MenuItem value="all">Tất cả người dùng</MenuItem>
          <MenuItem value="active">Người dùng đang hoạt động</MenuItem>
          <MenuItem value="inactive">Người dùng bị vô hiệu hóa</MenuItem>
        </Select>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>STT</b></TableCell>
              <TableCell><b>Tên</b></TableCell>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>SĐT</b></TableCell>
              <TableCell><b>Vai trò</b></TableCell>
              <TableCell><b>Trạng thái</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user, index) => (
                <TableRow key={user._id}>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
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
                    <FormControlLabel
                      control={
                        <Switch
                          checked={user.isActivated}
                          onChange={() => handleActiveStatusChange(user)}
                          color="primary"
                        />
                      }
                      label={user.isActivated ? "Hoạt động" : "Vô hiệu"}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default UserManagement;