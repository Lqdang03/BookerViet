import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, Grid, CircularProgress } from "@mui/material";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          headers: { Authorization: `Bearer ${token}` },
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
        <CircularProgress color="primary" />
      </Box>
    );
  if (error) return <Typography color="error">Lỗi: {error}</Typography>;
  if (!stats) return <Typography>Lỗi khi tải dữ liệu</Typography>;

  return (
    <Box sx={{ p: 3, width: "100%", maxWidth: "1200px", mx: "auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 600, color: "#2c3e50", marginBottom: 2 }}
      >
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: "#ffffff",
              boxShadow: 3,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 500, color: "#34495e" }}>
              Tổng số người dùng
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontSize: "2rem", fontWeight: 700, color: "#27ae60" }}
            >
              {stats.totalUsers ?? "Dữ liệu không có sẵn"}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: "#ffffff",
              boxShadow: 3,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 500, color: "#34495e" }}>
              Tổng số sách
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontSize: "2rem", fontWeight: 700, color: "#e67e22" }}
            >
              {stats.totalBooks ?? "Dữ liệu không có sẵn"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: "#2c3e50", marginBottom: 2 }}
        >
          Tổng số đơn hàng theo trạng thái
        </Typography>
        {stats.orderStatusCount && stats.orderStatusCount.length > 0 ? (
          <Grid container spacing={2}>
            {stats.orderStatusCount.map((item) => (
              <Grid item xs={12} sm={4} key={item.status}>
                <Paper
                  sx={{
                    p: 3,
                    backgroundColor: "#ffffff",
                    boxShadow: 3,
                    borderRadius: 3,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: "#34495e" }}
                  >
                    {item.status}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#3498db", mt: 1 }}
                  >
                    {item.count}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography sx={{ color: "#888" }}>Không có dữ liệu đơn hàng</Typography>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
