import React, { useState } from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
import { Layout } from "antd";
import { authRoutes } from "../routes/Routes";
const { Content } = Layout;
import ForgotPassword from "../views/ForgotPassword";

const Auth = () => {
	const [collapsed, setCollapsed] = useState(false);
	const mainContent = React.useRef(null);
	const location = useLocation();

	const toggleCollapse = () => {
		setCollapsed(!collapsed);
	};

	React.useEffect(() => {
		document.body.classList.add("bg-default");
		return () => {
			document.body.classList.remove("bg-default");
		};
	}, []);

	React.useEffect(() => {
		document.documentElement.scrollTop = 0;
		document.scrollingElement.scrollTop = 0;
		mainContent.current.scrollTop = 0;
	}, [location]);

	const getRoutes = routes => {
		return routes.reduce((acc, prop, key) => {
			if (prop.layout === "/auth") {
				acc.push(<Route path={prop.path} element={prop.component} key={key} />);
			}
			return acc;
		}, []);
	};

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<Layout>
				<Content ref={mainContent}>
					{/* <Routes>
						{getRoutes(authRoutes)}
						<Route path="*" element={<Navigate to="/auth/login" replace />} />
					</Routes> */}
					<Routes>
						{getRoutes(authRoutes)}
						<Route path="/auth/forgot-password" element={<ForgotPassword />} />
						<Route path="*" element={<Navigate to="/auth/login" replace />} />
					</Routes>
				</Content>
			</Layout>
		</Layout>
	);
};

export default Auth;
