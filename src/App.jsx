// import React, { useState, createContext, useEffect } from "react";
// import { ConfigProvider } from "antd";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Admin from "./layouts/Admin";
// import Auth from "./layouts/Auth";
// import CustomerLogin from "./views/CustomerLogin";

// export const ThemeContext = createContext();

// function App() {
// 	const [isDarkTheme, setIsDarkTheme] = useState(() => {
// 		const savedTheme = localStorage.getItem("isDarkTheme");
// 		return savedTheme ? JSON.parse(savedTheme) : false;
// 	});

// 	useEffect(() => {
// 		localStorage.setItem("isDarkTheme", JSON.stringify(isDarkTheme));
// 	}, [isDarkTheme]);

// 	const lightTheme = {
// 		colorBgBase: "#ffffff",
// 		colorTextBase: "#000000",
// 	};

// 	const darkTheme = {
// 		colorBgBase: "#001529",
// 		colorTextBase: "#ffffff",
// 		colorBorder: "#656D74",
// 		controlItemBgActive: "#0000FF",
// 	};

// 	return (
// 		<ThemeContext.Provider value={{ isDarkTheme, toggleTheme: () => setIsDarkTheme(!isDarkTheme) }}>
// 			<ConfigProvider
// 				theme={{
// 					token: isDarkTheme ? darkTheme : lightTheme,
// 				}}
// 			>
// 				<Router>
// 					<Routes>
// 						<Route path="/admin/*" element={<Admin />} />
// 						<Route path="/auth/*" element={<Auth />} />
// 						<Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
// 						<Route path="/customer-login" element={<CustomerLogin />} />
// 					</Routes>
// 				</Router>
// 			</ConfigProvider>
// 		</ThemeContext.Provider>
// 	);
// }

// export default App;

import React, { useState, createContext, useEffect } from "react";
import { ConfigProvider } from "antd";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Admin from "./layouts/Admin";
import Auth from "./layouts/Auth";
import CustomerLogin from "./views/CustomerLogin";
import ProtectedRoute from "./routes/ProtectedRoute"; // Importa ProtectedRoute
import ForgotPassword from "./views/ForgotPassword";

export const ThemeContext = createContext();

function App() {
	const [isDarkTheme, setIsDarkTheme] = useState(() => {
		const savedTheme = localStorage.getItem("isDarkTheme");
		return savedTheme ? JSON.parse(savedTheme) : false;
	});

	useEffect(() => {
		localStorage.setItem("isDarkTheme", JSON.stringify(isDarkTheme));
	}, [isDarkTheme]);

	const lightTheme = {
		colorBgBase: "#ffffff",
		colorTextBase: "#000000",
	};

	const darkTheme = {
		colorBgBase: "#001529",
		colorTextBase: "#ffffff",
		colorBorder: "#656D74",
		controlItemBgActive: "#0000FF",
	};

	return (
		<ThemeContext.Provider value={{ isDarkTheme, toggleTheme: () => setIsDarkTheme(!isDarkTheme) }}>
			<ConfigProvider
				theme={{
					token: isDarkTheme ? darkTheme : lightTheme,
				}}
			>
				<Router>
					<Routes>
						{/* Rutas públicas, no protegidas */}
						<Route path="/auth/*" element={<Auth />} />
						<Route path="/customer-login" element={<CustomerLogin />} />
						<Route path="/auth/forgot-password" element={<ForgotPassword />} />

						{/* Rutas protegidas */}
						<Route
							path="/admin/*"
							element={
								<ProtectedRoute>
									<Admin />
								</ProtectedRoute>
							}
						/>

						{/* Redirección por defecto */}
						<Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
					</Routes>
				</Router>
			</ConfigProvider>
		</ThemeContext.Provider>
	);
}

export default App;
