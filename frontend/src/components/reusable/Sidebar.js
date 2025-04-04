import React from "react";
import { Drawer, List, ListItem, ListItemText, ListItemIcon, Divider, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import BarChartIcon from "@mui/icons-material/BarChart";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import FeedbackIcon from "@mui/icons-material/Feedback";
import RateReview  from "@mui/icons-material/RateReview";

const Sidebar = ({ isSidebarOpen }) => {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: isSidebarOpen ? 240 : 60,
        flexShrink: 0,
        transition: "width 0.3s",
        "& .MuiDrawer-paper": {
          width: isSidebarOpen ? 240 : 60,
          transition: "width 0.3s",
          overflowX: "hidden",
        },
      }}
      PaperProps={{ sx: { backgroundColor: "#187bcd", color: "white" } }} 
    >
      <List sx={{ width: "100%", paddingTop: 2 }}>
        {isSidebarOpen && <h1 style={{textAlign: "center"}}>BookerViet</h1>}
        {!isSidebarOpen && <h1 style={{textAlign: "center"}}>B</h1>}
        <Divider sx={{ backgroundColor: "white" }}/>
        {[ 
          { text: "Dashboard", icon: <HomeIcon />, link: "/admin/dashboard" },
          { text: "Quản lý người dùng", icon: <PeopleIcon />, link: "/admin/users" },
          { text: "Quản lý sách", icon: <MenuBookIcon />, link: "/admin/books" },
          { text: "Quản lý đơn hàng", icon: <ReceiptLongIcon />, link: "/admin/orders" },
          { text: "Quản lý mã giảm giá", icon: <LocalOfferIcon />, link: "/admin/discounts" },
          { text: "Quản lý các báo cáo", icon: <FeedbackIcon />, link: "/admin/reports" },
          { text: "Quản lý các đánh giá", icon: <RateReview />, link: "/admin/review_rating" },
        ].map((item) => (
          <Tooltip title={!isSidebarOpen ? item.text : ""} placement="right" key={item.text}>
            <ListItem component={Link} to={item.link} button>
              <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
              {isSidebarOpen && <ListItemText primary={item.text} sx={{ color: "white" }}/>}
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
