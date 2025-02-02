// import React, { useState } from "react";
// import { Form, Input, Button, Card, notification } from "antd";
// import axios from "../helpers/axiosConfig";
// import API_ENDPOINTS from "../config/apiConfig";
// import { Link } from "react-router-dom";
// import OneHealth from "../assets/images/brand/onehealth.png"; // Import the logo

// const ForgotPassword = () => {
// 	const [loading, setLoading] = useState(false);

// 	const onFinish = async values => {
// 		setLoading(true);
// 		try {
// 			const response = await axios.post(`${API_ENDPOINTS.FORGOT_PASSWORD}`, {
// 				email: values.email,
// 			});
// 			notification.success({
// 				message: "Success",
// 				description: response.data.message || "Password reset link has been sent to your email.",
// 			});
// 		} catch (error) {
// 			notification.error({
// 				message: "Error",
// 				description: error.response?.data?.message || "An error occurred while sending the reset link.",
// 			});
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	return (
// 		<div className="login-container">
// 			<div className="login-image">
// 				<img src={OneHealth} alt="OneHealth Logo" />
// 			</div>
// 			<div className="login-form">
// 				<Card title="Forgot Password" style={{ width: 400, margin: "0 auto" }}>
// 					<Form name="forgot_password" onFinish={onFinish} layout="vertical" initialValues={{ remember: true }}>
// 						{/* <Form.Item>
// 							<h2 style={{ textAlign: "center", marginBottom: "30px" }}>Reset Your Password</h2>
// 						</Form.Item> */}

// 						<Form.Item
// 							label="Email"
// 							name="email"
// 							rules={[
// 								{ required: true, message: "Please enter your email!" },
// 								{ type: "email", message: "Please enter a valid email address!" },
// 							]}
// 						>
// 							<Input placeholder="Enter your email" />
// 						</Form.Item>

// 						<Form.Item>
// 							<Button type="primary" htmlType="submit" loading={loading} block>
// 								Send Reset Link
// 							</Button>
// 						</Form.Item>

// 						<div style={{ textAlign: "center", marginTop: "20px" }}>
// 							<Link to="/auth/login">Back to Login</Link>
// 						</div>
// 					</Form>
// 				</Card>
// 			</div>
// 		</div>
// 	);
// };

// export default ForgotPassword;

import React, { useState } from "react";
import { Form, Input, Button, Card, notification } from "antd";
import axios from "../helpers/axiosConfig";
import API_ENDPOINTS from "../config/apiConfig";
import { Link } from "react-router-dom";
import OneHealth from "../assets/images/brand/onehealth.png";

const ForgotPassword = () => {
	const [loading, setLoading] = useState(false);

	const onFinish = async values => {
		setLoading(true);
		try {
			const response = await axios.post(`${API_ENDPOINTS.FORGOT_PASSWORD}`, {
				email: values.email,
			});
			notification.success({
				message: "Success",
				description: response.data.message || "Password reset link has been sent to your email.",
			});
		} catch (error) {
			if (error.response?.status === 429) {
				notification.error({
					message: "Request Limit Reached",
					description: "You have reached the daily limit for password reset requests. Please try again later.",
				});
			} else {
				notification.error({
					message: "Error",
					description: error.response?.data?.message || "An error occurred while sending the reset link.",
				});
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="login-container">
			<div className="login-image">
				<img src={OneHealth} alt="OneHealth Logo" />
			</div>
			<div className="login-form">
				<Card title="Forgot Password" style={{ width: 400, margin: "0 auto" }}>
					<Form name="forgot_password" onFinish={onFinish} layout="vertical">
						<Form.Item
							label="Email"
							name="email"
							rules={[
								{ required: true, message: "Please enter your email!" },
								{ type: "email", message: "Please enter a valid email address!" },
							]}
						>
							<Input placeholder="Enter your email" />
						</Form.Item>

						<Form.Item>
							<Button type="primary" htmlType="submit" loading={loading} block>
								Send Reset Link
							</Button>
						</Form.Item>

						<div style={{ textAlign: "center", marginTop: "20px" }}>
							<Link to="/auth/login">Back to Login</Link>
						</div>
					</Form>
				</Card>
			</div>
		</div>
	);
};

export default ForgotPassword;
