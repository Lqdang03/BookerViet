import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Avatar
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueTab, setRevenueTab] = useState(0);

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

  const handleRevenueTabChange = (event, newValue) => {
    setRevenueTab(newValue);
  };

  // Group revenue data by different time periods
  const groupRevenueData = (data, period) => {
    const groupedData = {};

    data.forEach(item => {
      let key;
      switch (period) {
        case 0: // Ngày
          key = `${item._id.year}-${item._id.month}-${item._id.day}`;
          break;
        case 1: // Tuần
          key = `${item._id.year}-Tuần ${item._id.week}`;
          break;
        case 2: // Tháng
          key = `${item._id.year}-${item._id.month}`;
          break;
        case 3: // Năm
          key = `${item._id.year}`;
          break;
      }

      if (!groupedData[key]) {
        groupedData[key] = 0;
      }
      // Thay đổi từ dailyRevenue sang netRevenue
      groupedData[key] += item.netRevenue;
    });

    return Object.entries(groupedData)
      .map(([name, revenue]) => ({ name, revenue }))
      .reverse();
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  if (error) return <Typography color="error">Lỗi: {error}</Typography>;
  if (!stats) return <Typography>Lỗi khi tải dữ liệu</Typography>;

  // Prepare revenue data for different periods
  const revenueData = [
    groupRevenueData(stats.revenueAnalysis, 0), // Ngày
    groupRevenueData(stats.revenueAnalysis, 1), // Tuần
    groupRevenueData(stats.revenueAnalysis, 2), // Tháng
    groupRevenueData(stats.revenueAnalysis, 3)  // Năm
  ];

  return (
    <Box sx={{ p: 3, width: "100%", maxWidth: "1200px", mx: "auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 600, color: "#2c3e50", marginBottom: 2 }}
      >
        Admin Dashboard
      </Typography>

      {/* Top-level statistics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
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
              Tổng Doanh Thu
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontSize: "2rem", fontWeight: 700, color: "#3498db" }}
            >
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(stats.totalRevenue ?? 0)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
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
        <Grid item xs={12} md={4}>
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

      {/* Products and Revenue Section */}
      <Box sx={{ mt: 4, display: 'flex', gap: 3, height: 500 }}>
        {/* Top Selling Products */}
        <Box sx={{ flex: 1, height: '100%' }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "#2c3e50", marginBottom: 2 }}
          >
            Top 10 Sản Phẩm Bán Chạy
          </Typography>
          {stats.topSellingProducts && stats.topSellingProducts.length > 0 ? (
            <TableContainer
              component={Paper}
              sx={{
                height: 'calc(100% - 50px)',
                overflowY: 'auto'
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Xếp Hạng</TableCell>
                    <TableCell>Ảnh</TableCell>
                    <TableCell>Tên Sách</TableCell>
                    <TableCell align="right">Số Lượng Bán</TableCell>
                    <TableCell align="right">Tổng Doanh Thu</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.topSellingProducts.map((product, index) => (
                    <TableRow key={product.bookId}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {product.bookImages && product.bookImages.length > 0 ? (
                          <Avatar
                            variant="square"
                            src={product.bookImages[0]}
                            alt={product.bookName}
                            sx={{ width: 56, height: 56 }}
                          />
                        ) : (
                          <Avatar variant="square">N/A</Avatar>
                        )}
                      </TableCell>
                      <TableCell>{product.bookName}</TableCell>
                      <TableCell align="right">{product.totalQuantity}</TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(product.totalRevenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={{ color: "#888" }}>Không có dữ liệu sản phẩm bán chạy</Typography>
          )}
        </Box>

        {/* Revenue Analysis Chart */}
        <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "#2c3e50", marginBottom: 2 }}
          >
            Phân Tích Doanh Thu
          </Typography>
          <Tabs
            value={revenueTab}
            onChange={handleRevenueTabChange}
            aria-label="revenue analysis tabs"
            sx={{ marginBottom: 2 }}
          >
            <Tab label="Ngày" />
            <Tab label="Tuần" />
            <Tab label="Tháng" />
            <Tab label="Năm" />
          </Tabs>
          <Paper sx={{ flex: 1, padding: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData[revenueTab]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(value),
                    'Doanh Thu'
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;