import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const decodeToken = token => {
	try {
		const base64Payload = token.split(".")[1];
		const decodedPayload = atob(base64Payload);
		return JSON.parse(decodedPayload);
	} catch (error) {
		return null;
	}
};

const ProtectedRoute = ({ children }) => {
	const [loading, setLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const location = useLocation();

	// Define public routes
	const publicRoutes = ["/auth/login", "/auth/forgot-password"];

	useEffect(() => {
		const tokenData = localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")) : null;
		const token = tokenData?.token;

		if (token) {
			const decodedToken = decodeToken(token);
			const isTokenExpired = decodedToken?.exp * 1000 < Date.now();

			if (isTokenExpired) {
				setIsAuthenticated(false);
				localStorage.removeItem("userData");
			} else {
				setIsAuthenticated(true);
			}
		} else {
			setIsAuthenticated(false);
		}
		setLoading(false);
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	// Improved public route validation
	const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));

	// Allow public routes without authentication
	if (isPublicRoute) {
		return children;
	}

	// Redirect based on authentication status
	return isAuthenticated ? children : <Navigate to="/auth/login" replace />;
};

export default ProtectedRoute;
