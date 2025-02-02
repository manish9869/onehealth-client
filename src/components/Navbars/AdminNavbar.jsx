import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout, Avatar, Dropdown, Space } from "antd";
import {
  UserOutlined,
  SettingOutlined,
  CalendarOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { ThemeContext } from "../../App";
import teamImg from "./../../assets/images/brand/team-1-800x800.jpg";
import "./AdminNavbar.css";

const { Header } = Layout;

const AdminNavbar = ({ collapsed, brandText }) => {
  const { isDarkTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const userData = localStorage.getItem("userData")
    ? JSON.parse(localStorage.getItem("userData"))
    : null;
  const username = userData ? userData.user_name : "User"; // Default to "User" if not found

  const menuItems = [
    {
      key: "profile",
      label: (
        <Link to="/admin/user-profile">
          <UserOutlined />
          <span> My Profile</span>
        </Link>
      ),
    },

    {
      type: "divider",
    },
    {
      key: "logout",
      label: (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // Clear localStorage and redirect to login
            localStorage.removeItem("userData");
            navigate("/auth/login"); // Redirect to login
          }}
        >
          <LogoutOutlined />
          <span> Logout</span>
        </a>
      ),
    },
  ];

  return (
    <Header
      className="navbar"
      style={{
        position: "fixed",
        width: collapsed ? "calc(100% - 60px)" : "calc(100% - 250px)",
        left: collapsed ? "60px" : "250px",
        zIndex: 100,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
        backgroundColor: isDarkTheme ? "#001529" : "#1677ff",
      }}
    >
      <div className="navbar-brand">
        <Link
          className="h4 mb-0 text-uppercase"
          to="/"
          style={{ color: isDarkTheme ? "white" : "white" }}
        >
          {brandText}
        </Link>
      </div>

      <div className="navbar-right" style={{ float: "right" }}>
        <Dropdown
          menu={{ items: menuItems }}
          trigger={["click"]}
          overlayClassName={
            isDarkTheme
              ? "dropdown-menu dark-dropdown"
              : "dropdown-menu light-dropdown"
          }
        >
          <Space>
            <Avatar size="small" src={teamImg} />
            <span style={{ color: isDarkTheme ? "white" : "white" }}>
              {username}
            </span>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AdminNavbar;
