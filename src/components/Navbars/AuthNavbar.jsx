import { Link } from "react-router-dom";
import { Layout, Menu, Row, Col } from "antd";
import {
  PlanetOutlined,
  UserAddOutlined,
  LoginOutlined,
  UserOutlined,
} from "@ant-design/icons";
import logo from "./../../assets/images/brand/argon-react-white.png";

const { Header } = Layout;

const AuthNavbar = () => {
  // Menu items array for the navbar
  const menuItems = [
    {
      key: "dashboard",
      icon: <PlanetOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: "register",
      icon: <UserAddOutlined />,
      label: <Link to="/auth/register">Register</Link>,
    },
    {
      key: "login",
      icon: <LoginOutlined />,
      label: <Link to="/auth/login">Login</Link>,
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link to="/admin/user-profile">Profile</Link>,
    },
  ];

  return (
    <Header
      className="navbar-horizontal navbar-dark"
      style={{ backgroundColor: "#001529" }}
    >
      <div className="container">
        <Row justify="space-between" align="middle">
          <Col xs={6}>
            <Link to="/">
              <img alt="Logo" src={logo} style={{ height: "40px" }} />
            </Link>
          </Col>

          <Col xs={18}>
            <Menu
              theme="dark"
              mode="horizontal"
              className="ml-auto"
              items={menuItems}
            />
          </Col>
        </Row>
      </div>
    </Header>
  );
};

export default AuthNavbar;
