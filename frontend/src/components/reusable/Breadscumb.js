import React from "react";
import { Breadcrumbs, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";


const BreadcrumbsNav = () => {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);
  
    return (
      <Breadcrumbs sx={{ margin: "16px 24px" }} aria-label="breadcrumb">
        <Link to="/admin/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
          <HomeIcon sx={{ verticalAlign: "middle", marginRight: "4px" }} />
          Dashboard
        </Link>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          return (
            <Typography key={name} color="textPrimary">
              <Link to={routeTo} style={{ textDecoration: "none", color: "inherit" }}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Link>
            </Typography>
          );
        })}
      </Breadcrumbs>
    );
  };
  
  export default BreadcrumbsNav ;