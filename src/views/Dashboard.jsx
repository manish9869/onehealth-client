import React from "react";
import { Layout, Card, Row, Col, Table, Typography, Statistic, notification, Button, List } from "antd";
import { Line, Bar, Pie, Column } from "@ant-design/plots";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { ArrowUpOutlined, ArrowDownOutlined, BulbOutlined, CheckOutlined } from "@ant-design/icons";
import "leaflet/dist/leaflet.css";
import axios from "../helpers/axiosConfig";
import API_ENDPOINTS from "../config/apiConfig";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const { Content, Footer } = Layout;

// Example data for table
const dataSource = [
	{ key: "1", metric: "Metric A", value: 1200 },
	{ key: "2", metric: "Metric B", value: 800 },
	{ key: "3", metric: "Metric C", value: 600 },
];

const columns = [
	{ title: "Metric", dataIndex: "metric", key: "metric" },
	{ title: "Value", dataIndex: "value", key: "value" },
];

// Monthly Active Users Data
const mauData = Array.from({ length: 12 }, (_, i) => ({
	month: new Date(2024, i).toLocaleString("default", { month: "short" }),
	users: Math.floor(Math.random() * 1000) + 500,
}));

// Line chart data
const lineData = [
	{ date: "2024-01-01", value: 400 },
	{ date: "2024-02-01", value: 600 },
	{ date: "2024-03-01", value: 800 },
];

// Bar chart data
const barData = [
	{ category: "Product A", sales: 500 },
	{ category: "Product B", sales: 300 },
	{ category: "Product C", sales: 200 },
];

// Pie chart data
const pieData = [
	{ type: "Category A", value: 27 },
	{ type: "Category B", value: 25 },
	{ type: "Category C", value: 18 },
	{ type: "Category D", value: 15 },
	{ type: "Other", value: 15 },
];

// Drug usage data
const drugUsageData = [
	{ drug: "Paracetamol", usage: 800 },
	{ drug: "Ibuprofen", usage: 500 },
	{ drug: "Aspirin", usage: 400 },
	{ drug: "Amoxicillin", usage: 300 },
];

// Hospital locations
const hospitalLocations = [
	{ name: "Toronto General Hospital", coords: [43.6596, -79.3892] },
	{ name: "Mount Sinai Hospital", coords: [43.6535, -79.3868] },
	{ name: "Sunnybrook Hospital", coords: [43.7227, -79.3772] },
	{ name: "Ottawa Hospital", coords: [45.4033, -75.7003] },
];

const Dashboard = () => {
	const [mauData, setMauData] = useState([]);
	const [reminders, setReminders] = useState([]);
	const [upcomingReminders, setUpcomingReminders] = useState([]);
	const [loadingId, setLoadingId] = useState(null); // Track which button is being pressed

	// Fetch reminders from API
	const fetchReminders = async () => {
		try {
			const response = await axios.get(API_ENDPOINTS.REMINDER);
			const reminderData = response.data.data.data.map(reminder => ({
				...reminder,
				reminder_date: dayjs(reminder.reminder_date).format("DD-MM-YYYY"),
				reminder_time: dayjs(reminder.reminder_time, "hh:mm A").format("hh:mm A"),
			}));

			// Filter reminders with status "Pending"
			const pendingReminders = reminderData.filter(reminder => reminder.status === "Pending");

			setReminders(pendingReminders);

			// Filter and sort the next 5 reminders
			const now = dayjs();
			const upcoming = pendingReminders
				.filter(reminder =>
					dayjs(`${reminder.reminder_date} ${reminder.reminder_time}`, "DD-MM-YYYY hh:mm A").isAfter(now)
				)
				.sort((a, b) =>
					dayjs(`${a.reminder_date} ${a.reminder_time}`, "DD-MM-YYYY hh:mm A").diff(
						dayjs(`${b.reminder_date} ${b.reminder_time}`, "DD-MM-YYYY hh:mm A")
					)
				)
				.slice(0, 5);

			setUpcomingReminders(upcoming);
		} catch (error) {
			console.error("Error fetching reminders:", error);
			notification.error({
				message: "Error fetching reminders",
				description: error.message,
			});
		}
	};

	useEffect(() => {
		fetchReminders();
	}, []);

	// Handle marking reminder as completed
	const markAsCompleted = async id => {
		setLoadingId(id); // Set the loading state for this button
		try {
			// Update status in backend
			await axios.put(`${API_ENDPOINTS.REMINDER}/${id}`, {
				status: "Completed",
			});

			// Temporarily mark as completed locally
			setUpcomingReminders(prevReminders =>
				prevReminders.map(reminder => (reminder.id === id ? { ...reminder, completed: true } : reminder))
			);

			// Remove the reminder after 2 seconds
			setTimeout(() => {
				setUpcomingReminders(prevReminders => prevReminders.filter(reminder => reminder.id !== id));
				setLoadingId(null); // Reset loading state
				notification.success({
					message: "Reminder Completed",
					duration: 2, // Notification will disappear after 2 seconds
				});
			}, 2000);
		} catch (error) {
			console.error("Error marking reminder as completed:", error);
			notification.error({
				message: "Error marking reminder as completed",
				description: error.message,
			});
			setLoadingId(null); // Reset loading state in case of error
		}
	};

	// Fetch data from API
	const fetchData = async () => {
		try {
			const response = await axios.get(`${API_ENDPOINTS.DASHBOARD}/monthly-active-users`);

			const result = response.data;

			if (result.status === "success") {
				setMauData(result.data);
			} else {
				console.error("Failed to fetch data:", result.message);
			}
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const mauConfig = {
		data: mauData,
		xField: "month",
		yField: "users",
		point: { size: 5, shape: "circle" },
		smooth: true,
		lineStyle: { stroke: "#3b82f6", lineWidth: 2 },
	};

	const lineConfig = {
		data: lineData,
		xField: "date",
		yField: "value",
		smooth: true,
		point: { size: 5, shape: "diamond" },
	};

	const barConfig = {
		data: barData,
		xField: "sales",
		yField: "category",
		seriesField: "category",
		color: ["#3b82f6", "#ef4444", "#10b981"],
		legend: false,
	};

	const pieConfig = {
		appendPadding: 10,
		data: pieData,
		angleField: "value",
		colorField: "type",
		radius: 1,
		label: { type: "outer", content: "{name} {percentage}" },
	};

	const drugUsageConfig = {
		data: drugUsageData,
		xField: "drug",
		yField: "usage",
		color: "#10b981",
		label: { position: "top" },
	};

	const [loading, setLoading] = useState(false);
	const [completed, setCompleted] = useState(false);

	const handleClick = () => {
		setLoading(true);
		setTimeout(() => {
			setLoading(false);
			setCompleted(true);

			// Call the onComplete callback to handle reminder completion logic
			onComplete(reminderId);

			// Remove the reminder after 2 seconds
			setTimeout(() => {
				setCompleted(false); // Optional reset if needed for a reusable component
			}, 2000);
		}, 2000); // Simulates an action taking 2 seconds
	};

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<Content style={{ margin: "24px 16px 0" }}>
				<Row gutter={16} style={{ marginBottom: 16 }}>
					<Col span={12}>
						<Card title="Upcoming Reminders" bordered>
							{upcomingReminders.length > 0 ? (
								<List
									itemLayout="horizontal"
									dataSource={upcomingReminders}
									renderItem={reminder => (
										<List.Item
											actions={[
												<Button
													type="primary"
													shape="circle"
													icon={reminder.completed ? <CheckOutlined /> : <BulbOutlined />}
													onClick={() => markAsCompleted(reminder.id)}
													loading={loadingId === reminder.id} // Show loading only for the clicked button
													disabled={reminder.completed} // Disable if already completed
													style={{
														backgroundColor: reminder.completed ? "#52c41a" : "#1890ff",
														borderColor: reminder.completed ? "#52c41a" : "#1890ff",
													}}
												/>,
											]}
										>
											<List.Item.Meta
												title={reminder.title}
												description={`Date: ${reminder.reminder_date} Time: ${reminder.reminder_time}`}
											/>
										</List.Item>
									)}
								/>
							) : (
								<Typography.Text>No upcoming reminders.</Typography.Text>
							)}
						</Card>
					</Col>
				</Row>

				{/* Row for Active and Idle Statistics */}
				<Row gutter={16}>
					<Col span={12}>
						<Card bordered={false}>
							<Statistic
								title="Active"
								value={11.28}
								precision={2}
								valueStyle={{ color: "#3f8600" }}
								prefix={<ArrowUpOutlined />}
								suffix="%"
							/>
						</Card>
					</Col>
					<Col span={12}>
						<Card bordered={false}>
							<Statistic
								title="Idle"
								value={9.3}
								precision={2}
								valueStyle={{ color: "#cf1322" }}
								prefix={<ArrowDownOutlined />}
								suffix="%"
							/>
						</Card>
					</Col>
				</Row>

				{/* Cards for Total Users, Sales, Monthly Growth */}
				<Row gutter={16} style={{ marginTop: 16 }}>
					<Col span={8}>
						<Card title="Total Users" bordered={false}>
							<p style={{ fontSize: "24px", fontWeight: "bold" }}>1,200</p>
						</Card>
					</Col>
					<Col span={8}>
						<Card title="Sales" bordered={false}>
							<p style={{ fontSize: "24px", fontWeight: "bold" }}>$34,000</p>
						</Card>
					</Col>
					<Col span={8}>
						<Card title="Monthly Growth" bordered={false}>
							<p style={{ fontSize: "24px", fontWeight: "bold" }}>15%</p>
						</Card>
					</Col>
				</Row>

				{/* Row for Monthly Active Users */}
				<Row gutter={16} style={{ marginTop: 16 }}>
					<Col span={24}>
						<Card title="Monthly Active Users" bordered={false}>
							<Line {...mauConfig} />
						</Card>
					</Col>
				</Row>

				{/* Row for Line Chart and Bar Chart */}
				<Row gutter={16} style={{ marginTop: 16 }}>
					<Col span={12}>
						<Card title="Sales Growth Over Time" bordered={false}>
							<Line {...lineConfig} />
						</Card>
					</Col>
					<Col span={12}>
						<Card title="Sales by Product" bordered={false}>
							<Bar {...barConfig} />
						</Card>
					</Col>
				</Row>

				{/* Row for Pie Chart and Table */}
				<Row gutter={16} style={{ marginTop: 16 }}>
					<Col span={12}>
						<Card title="Category Breakdown" bordered={false}>
							<Pie {...pieConfig} />
						</Card>
					</Col>
					<Col span={12}>
						<Card title="Recent Metrics" bordered={false}>
							<Table dataSource={dataSource} columns={columns} pagination={false} />
						</Card>
					</Col>
				</Row>

				{/* Row for Drug Usage */}
				<Row gutter={16} style={{ marginTop: 16 }}>
					<Col span={24}>
						<Card title="Drug Usage Statistics" bordered={false}>
							<Column {...drugUsageConfig} />
						</Card>
					</Col>
				</Row>

				{/* Map for Connected Hospitals */}
				<Row gutter={16} style={{ marginTop: 16 }}>
					<Col span={24}>
						<Card title="Connected Hospitals in Ontario" bordered={false}>
							<MapContainer
								center={[43.65107, -79.347015]}
								zoom={8}
								style={{
									height: "400px",
									width: "100%",
									border: "1px solid #ddd",
									borderRadius: "8px",
								}}
							>
								<TileLayer
									url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
									attribution="© OpenStreetMap contributors"
								/>
								{hospitalLocations.map(hospital => (
									<Marker position={hospital.coords} key={hospital.name}>
										<Popup>{hospital.name}</Popup>
									</Marker>
								))}
							</MapContainer>
						</Card>
					</Col>
				</Row>
			</Content>

			<Footer style={{ textAlign: "center" }}>One Health Corporation ©2024</Footer>
		</Layout>
	);
};

export default Dashboard;
