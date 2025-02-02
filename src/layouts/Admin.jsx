import React, { useState } from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
import { Layout } from "antd";
import Sidebar from "../components/sidebar/Sidebar"; // Sidebar component
import AdminNavbar from "../components/Navbars/AdminNavbar";
import ProtectedRoute from "../routes/ProtectedRoute";
import { routes } from "../routes/Routes";
import CustomerView from "../views/CustomerView";

const { Content } = Layout;

const Admin = () => {
	const [collapsed, setCollapsed] = useState(false);
	const mainContent = React.useRef(null);
	const location = useLocation();

	const toggleCollapse = () => {
		setCollapsed(!collapsed);
	};

	React.useEffect(() => {
		document.documentElement.scrollTop = 0;
		document.scrollingElement.scrollTop = 0;
		mainContent.current.scrollTop = 0;
	}, [location]);

	const getBrandText = pathname => {
		if (pathname.includes("/admin/customer-view")) {
			return "Customer View";
		}

		for (let i = 0; i < routes.length; i++) {
			if (pathname.indexOf(routes[i].layout + routes[i].path) !== -1) {
				return routes[i].name;
			}
			if (routes[i].sub_menu && routes[i].sub_menu.length > 0) {
				for (let j = 0; j < routes[i].sub_menu.length; j++) {
					if (pathname.indexOf(routes[i].layout + routes[i].sub_menu[j].path) !== -1) {
						return routes[i].sub_menu[j].name;
					}
				}
			}
		}
		return "Admin Dashboard";
	};

	const getRoutes = routes => {
		return routes.reduce((acc, prop, key) => {
			if (prop.layout === "/admin") {
				acc.push(<Route path={prop.path} element={<ProtectedRoute>{prop.component}</ProtectedRoute>} key={key} />);
			}
			if (prop.sub_menu && prop.sub_menu.length > 0) {
				prop.sub_menu.forEach((subItem, subKey) => {
					if (subItem.layout === "/admin") {
						acc.push(
							<Route
								path={subItem.path}
								element={<ProtectedRoute>{subItem.component}</ProtectedRoute>}
								key={`${key}-${subKey}`}
							/>
						);
					}
				});
			}
			return acc;
		}, []);
	};

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<Sidebar collapsed={collapsed} toggleCollapse={toggleCollapse} />
			<Layout style={{ marginLeft: collapsed ? "60px" : "250px" }}>
				<AdminNavbar collapsed={collapsed} brandText={getBrandText(location.pathname)} />
				<Content ref={mainContent} style={{ padding: "20px" }}>
					<Routes>
						{getRoutes(routes)}
						<Route
							path="/customer-view/:customerId"
							element={
								<ProtectedRoute>
									<CustomerView />
								</ProtectedRoute>
							}
						/>
						<Route path="*" element={<Navigate to="/admin/index" replace />} />
					</Routes>
				</Content>
			</Layout>
		</Layout>
	);
};

export default Admin;
