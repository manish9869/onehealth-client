import React, { useState } from "react";
import { Form, Input, Button, Checkbox, notification } from "antd";
import axios from "axios";
import "../assets/styles/login.css";
import OneHealth from "../assets/images/brand/onehealth.png";
import { checkEmailAndPasswordFormat } from "../helpers/functions";
import MESSAGES from "./../config/messages";
import API_ENDPOINTS from "./../config/apiConfig";
import TwoFACode from "./TwoFACode";
import TwoFAQR from "./TwoFAQR";
import { ConfigProvider } from "antd";
import { Link } from "react-router-dom"; // Import Link for navigation

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [twoFaQrUrl, setTwoFaQrUrl] = useState(null);
	const [isTwoFaEnabled, setIsTwoFaEnabled] = useState(false);
	const [secret, setSecret] = useState("");

	const handleLogin = async () => {
		try {
			if (checkEmailAndPasswordFormat(email, password)) {
				const response = await axios.post(`${API_ENDPOINTS.AUTH}/login`, {
					email,
					password,
				});

				const twoFaUrl = response?.data?.data?.data?.twoFaQrUrl;

				if (twoFaUrl) {
					setTwoFaQrUrl(twoFaUrl);
					setSecret(response?.data?.data?.data.secretKey);
					setIsTwoFaEnabled(false);
				} else {
					setSecret(response?.data?.data?.data.secretKey);
					setIsTwoFaEnabled(true);
					setTwoFaQrUrl(null);
				}
			} else {
				notification.error({
					message: MESSAGES.INVALID_EMAIL_PASSWORD,
				});
			}
		} catch (error) {
			notification.error({
				message: "Login failed. Please check your credentials.",
			});
		}
	};

	return (
		<ConfigProvider
			theme={{
				token: {
					colorBgBase: "#ffffff",
					colorTextBase: "#000000",
				},
			}}
		>
			<div className="login-container">
				<div className="login-image">
					<img src={OneHealth} alt="login" />
				</div>
				<div className="login-form">
					{twoFaQrUrl ? (
						<TwoFAQR qrUrl={twoFaQrUrl} email={email} secret={secret} />
					) : isTwoFaEnabled ? (
						<TwoFACode secret={secret} email={email} />
					) : (
						<Form name="basic" initialValues={{ remember: false }} layout="vertical" onFinish={handleLogin}>
							<Form.Item>
								<h2 style={{ textAlign: "center", marginBottom: "30px" }}>Welcome Back!</h2>
							</Form.Item>

							<Form.Item
								label="Email"
								name="email"
								rules={[{ required: true, message: "Please input your email!" }]}
							>
								<Input placeholder="Enter your email" onChange={e => setEmail(e.target.value)} />
							</Form.Item>

							<Form.Item
								label="Password"
								name="password"
								rules={[{ required: true, message: "Please input your password!" }]}
							>
								<Input.Password
									placeholder="Enter your password"
									onChange={e => setPassword(e.target.value)}
								/>
							</Form.Item>

							<Form.Item name="remember" valuePropName="checked">
								<Checkbox>Remember me</Checkbox>
							</Form.Item>

							<Form.Item>
								<Button type="primary" htmlType="submit" block>
									Submit
								</Button>
							</Form.Item>

							{/* Updated "Forgot your password?" link to use Link from react-router-dom */}
							<div className="forgot-password" style={{ textAlign: "center", marginBottom: "20px" }}>
								<Link to="/auth/forgot-password">Forgot your password?</Link>
							</div>

							{/* Add the "Are you a Customer?" link */}
							<div style={{ textAlign: "center", marginTop: "20px" }}>
								<Link to="/customer-login">Are you a Customer?</Link>
							</div>
						</Form>
					)}
				</div>
			</div>
		</ConfigProvider>
	);
};

export default Login;
