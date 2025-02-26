import React from "react";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";
import BookIcon from '@mui/icons-material/Book';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

const Sidebar = () => {
  return (
    <Drawer variant="permanent" anchor="left">
      <List>
        <ListItem component={Link} to="/admin/users" button>
            <AccountBoxIcon/>
          <ListItemText primary="User Management" />
        </ListItem>
        <ListItem component={Link} to="/admin/books" button>
            <BookIcon/>
          <ListItemText primary="Book Management" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
