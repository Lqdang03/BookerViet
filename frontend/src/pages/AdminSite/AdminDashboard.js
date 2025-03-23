import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, Grid, CircularProgress, List, ListItem } from "@mui/material";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State lưu lỗi

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          setError("Token không tồn tại");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:9999/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Typography color="error">Lỗi: {error}</Typography>;
  if (!stats) return <Typography>Lỗi khi tải dữ liệu</Typography>;

  return (
    <Box sx={{ p: 3, width: "100%", maxWidth: "calc(100% - 250px)", mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Tổng số người dùng</Typography>
            <Typography variant="body1">{stats.totalUsers ?? "Dữ liệu không có sẵn"}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Tổng số sách</Typography>
            <Typography variant="body1">{stats.totalBooks ?? "Dữ liệu không có sẵn"}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Đơn hàng theo trạng thái</Typography>
        {stats.orderStats && stats.orderStats.length > 0 ? (
          <List>
            {stats.orderStats.map((item) => (
              <ListItem key={item._id}>
                <Typography>{item._id}: {item.count}</Typography>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>Không có dữ liệu đơn hàng</Typography>
        )}
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Phương thức thanh toán</Typography>
        {stats.paymentStats && stats.paymentStats.length > 0 ? (
          <List>
            {stats.paymentStats.map((item) => (
              <ListItem key={item._id}>
                <Typography>{item._id}: {item.count}</Typography>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>Không có dữ liệu phương thức thanh toán</Typography>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
