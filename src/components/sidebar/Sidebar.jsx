import React, { useContext, useState, useEffect } from "react";
import { Layout, Menu, Button } from "antd";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi";
import { MedicineBoxOutlined } from "@ant-design/icons";
import { useLocation, Link } from "react-router-dom";
import { routes } from "./../../routes/Routes";
import "./sidebar.css";
import API_ENDPOINTS from "../../config/apiConfig";
import axios from "../../helpers/axiosConfig";
import { ThemeContext } from "../../App";

const { Sider } = Layout;

const Sidebar = ({ collapsed, toggleCollapse }) => {
	const [darkTheme, setDarkTheme] = useState(true);
	const { isDarkTheme, toggleTheme } = useContext(ThemeContext);
	const [userPermissions, setUserPermissions] = useState(null);
	const [permittedRoutes, setPermittedRoutes] = useState([]);
	const location = useLocation();

	// Fetch user permissions from the API
	useEffect(() => {
		const fetchPermissions = async () => {
			try {
				const response = await axios.get(API_ENDPOINTS.USER_FEATURE_PERMISSIONS);
				const result = response.data;
				if (result.status === "success") {
					setUserPermissions(result.data.featurePermission);
				} else {
					console.error("Failed to fetch permissions:", result.message);
				}
			} catch (error) {
				console.error("Error fetching permissions:", error);
			}
		};

		fetchPermissions();
	}, []);

	// Filter routes based on user permissions
	useEffect(() => {
		if (userPermissions) {
			const filteredRoutes = routes
				.filter(route => userPermissions[route.feature_id])
				.map(route => {
					if (route.sub_menu && route.sub_menu.length > 0) {
						const filteredSubMenu = route.sub_menu.filter(subItem => userPermissions[subItem.feature_id]);
						return { ...route, sub_menu: filteredSubMenu };
					}
					return route;
				});

			setPermittedRoutes(filteredRoutes);
		}
	}, [userPermissions]);

	const generateMenuItems = routes => {
		return routes.map((route, index) => {
			if (route.sub_menu && route.sub_menu.length > 0) {
				return {
					key: route.path || `parent-${index}`,
					icon: route.icon,
					label: route.name,
					children: route.sub_menu.map((subItem, subIndex) => ({
						key: subItem.layout + subItem.path || `sub-${index}-${subIndex}`,
						label: <Link to={subItem.layout + subItem.path}>{subItem.name}</Link>,
					})),
				};
			} else {
				return {
					key: route.layout + route.path || `item-${index}`,
					icon: route.icon,
					label: <Link to={route.layout + route.path}>{route.name}</Link>,
				};
			}
		});
	};

	return (
		<Sider
			collapsible
			collapsed={collapsed}
			onCollapse={toggleCollapse}
			theme={isDarkTheme ? "dark" : "light"}
			className="sidebar"
			breakpoint="lg"
			collapsedWidth="60"
			width={250}
		>
			<div className="logo">
				<div
					className="logo-icon"
					style={{
						backgroundColor: isDarkTheme ? "#001529" : "#1677ff",
					}}
				>
					<MedicineBoxOutlined />
				</div>
			</div>
			{userPermissions ? (
				<Menu
					theme={isDarkTheme ? "dark" : "light"}
					mode="inline"
					selectedKeys={[location.pathname]}
					items={generateMenuItems(permittedRoutes)}
				/>
			) : (
				<div>Loading permissions...</div>
			)}
			<div className="sidebar-footer">
				<Button
					onClick={toggleTheme}
					className="toggle-theme-btn"
					icon={isDarkTheme ? <HiOutlineSun /> : <HiOutlineMoon />}
					style={{
						width: collapsed ? "60px" : "250px",
						backgroundColor: isDarkTheme ? "#002140" : "#fff",
						color: isDarkTheme ? "#fff" : "#000",
					}}
				/>
			</div>
		</Sider>
	);
};

export default Sidebar;
