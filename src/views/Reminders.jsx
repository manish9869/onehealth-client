import { useState, useEffect } from "react";
import axios from "../helpers/axiosConfig";
import { Card, Row, Col, Form, Input, Button, Table, notification, Tooltip, Modal, DatePicker, TimePicker } from "antd";
import { EyeOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import API_ENDPOINTS from "../config/apiConfig";
import MESSAGES from "../config/messages";
import dayjs from "dayjs";

const Reminders = () => {
	const [rowData, setRowData] = useState([]);
	const [isEdit, setIsEdit] = useState(false);
	const [editedReminderId, setEditedReminderId] = useState(null);
	const [form] = Form.useForm();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [viewedRecord, setViewedRecord] = useState(null);

	const fetchReminders = async () => {
		try {
			const response = await axios.get(API_ENDPOINTS.REMINDER);
			const formattedData = response.data.data.data.map(reminder => ({
				...reminder,
				reminder_date: dayjs(reminder.reminder_date).format("DD-MM-YYYY"), // Formato deseado
			}));
			setRowData(formattedData);
		} catch (error) {
			console.error("Error fetching reminders:", error.response?.data || error.message);
			notification.error({ message: MESSAGES.FETCH_ERROR });
		}
	};

	useEffect(() => {
		fetchReminders();
	}, []);

	const handleView = record => {
		setViewedRecord(record);
		setIsModalVisible(true);
	};

	// const handleEdit = record => {
	// 	form.setFieldsValue({
	// 		title: record.title,
	// 		description: record.description,
	// 		reminder_date: record.reminder_date,
	// 		reminder_time: record.reminder_time,
	// 	});
	// 	setIsEdit(true);
	// 	setEditedReminderId(record.id);
	// };
	const handleEdit = record => {
		form.setFieldsValue({
			title: record.title,
			description: record.description,
			reminder_date: dayjs(record.reminder_date, "YYYY-MM-DD"), // Convierte a dayjs
			reminder_time: dayjs(record.reminder_time, "hh:mm A"), // Convierte la hora
		});
		setIsEdit(true);
		setEditedReminderId(record.id);
	};

	const handleDelete = async id => {
		try {
			await axios.delete(`${API_ENDPOINTS.REMINDER}/${id}`);
			notification.success({ message: MESSAGES.DELETE_SUCCESS });
			fetchReminders();
		} catch (error) {
			notification.error({ message: MESSAGES.DELETE_ERROR });
		}
	};

	const handleSubmit = async values => {
		try {
			// Convierte los valores del formulario para enviarlos al backend
			const data = {
				title: values.title,
				description: values.description,
				reminder_date: values.reminder_date.format("YYYY-MM-DD"), // Fecha en formato ISO
				reminder_time: values.reminder_time.format("hh:mm A"), // Hora en formato am/pm
				status: "Pending",
			};

			const url = isEdit ? `${API_ENDPOINTS.REMINDER}/${editedReminderId}` : API_ENDPOINTS.REMINDER;

			const method = isEdit ? "put" : "post";

			await axios({
				method,
				url,
				data,
			});

			notification.success({
				message: isEdit ? MESSAGES.UPDATE_SUCCESS : MESSAGES.ADD_SUCCESS,
			});

			fetchReminders();
			resetForm();
		} catch (error) {
			console.error("Error submitting reminder data:", error.response?.data || error.message);
			notification.error({ message: "Failed to submit reminder data" });
		}
	};

	const resetForm = () => {
		setIsEdit(false);
		setEditedReminderId(null);
		form.resetFields();
	};

	const columns = [
		{
			title: "Title",
			dataIndex: "title",
			sorter: (a, b) => a.title.localeCompare(b.title),
		},
		{
			title: "Description",
			dataIndex: "description",
		},
		{
			title: "Date",
			dataIndex: "reminder_date",
			render: date => date,
		},
		{
			title: "Time",
			dataIndex: "reminder_time",
			render: time => time,
		},
		{
			title: "Status",
			dataIndex: "status",
		},
		{
			title: "Actions",
			render: (text, record) => (
				<span style={{ display: "flex", gap: "8px" }}>
					<Tooltip title="View">
						<EyeOutlined
							onClick={() => handleView(record)}
							style={{ color: "#52c41a", fontSize: "16px", cursor: "pointer" }}
						/>
					</Tooltip>
					<Tooltip title="Edit">
						<EditOutlined
							onClick={() => handleEdit(record)}
							style={{ color: "#1890ff", fontSize: "16px", cursor: "pointer" }}
						/>
					</Tooltip>
					<Tooltip title="Delete">
						<DeleteOutlined
							onClick={() => handleDelete(record.id)}
							style={{ color: "#f5222d", fontSize: "16px", cursor: "pointer" }}
						/>
					</Tooltip>
				</span>
			),
		},
	];

	return (
		<Row gutter={[16, 16]}>
			<Col lg={8} md={24} sm={24} xs={24}>
				<Card title={isEdit ? "Update Reminder" : "Add Reminder"}>
					<Form form={form} onFinish={handleSubmit} layout="vertical">
						<Form.Item
							name="title"
							label="Title"
							rules={[{ required: true, message: "Please enter the reminder title" }]}
						>
							<Input placeholder="Title" maxLength={191} />
						</Form.Item>
						<Form.Item
							name="description"
							label="Description"
							rules={[{ required: true, message: "Please enter the description" }]}
						>
							<Input.TextArea placeholder="Description" rows={4} maxLength={191} />
						</Form.Item>
						<Form.Item
							name="reminder_date"
							label="Date"
							rules={[{ required: true, message: "Please select the reminder date" }]}
						>
							<DatePicker
								format="DD-MM-YYYY"
								style={{ width: "100%" }}
								disabledDate={current => current && current < dayjs().startOf("day")} // Deshabilitar fechas pasadas
							/>
						</Form.Item>

						<Form.Item
							name="reminder_time"
							label="Time"
							rules={[{ required: true, message: "Please select the reminder time" }]}
						>
							<TimePicker format="hh:mm A" use12Hours minuteStep={5} style={{ width: "100%" }} />
						</Form.Item>
						{/* <Form.Item
							name="reminder_date"
							label="Date"
							rules={[{ required: true, message: "Please select the reminder date" }]}
						>
							<DatePicker
								format="DD-MM-YYYY"
								style={{ width: "100%" }}
								disabledDate={current => current && current < dayjs().startOf("day")} // Deshabilitar fechas pasadas
							/>
						</Form.Item>
						<Form.Item
							name="reminder_time"
							label="Time"
							rules={[{ required: true, message: "Please select the reminder time" }]}
						>
							<TimePicker format="hh:mm A" use12Hours minuteStep={5} style={{ width: "100%" }} />
						</Form.Item> */}

						<Form.Item>
							<Button type="primary" htmlType="submit">
								{isEdit ? "Update Reminder" : "Add Reminder"}
							</Button>
							<Button style={{ marginLeft: 8 }} onClick={resetForm} type="primary" danger>
								Cancel
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</Col>

			<Col lg={16} md={24} sm={24} xs={24}>
				<Card title="Reminder List">
					<Table
						columns={columns}
						dataSource={rowData}
						rowKey="id"
						pagination={{ pageSize: 10 }}
						scroll={{ x: 600 }}
					/>
				</Card>
			</Col>

			<Modal
				title="Reminder Details"
				open={isModalVisible}
				onCancel={() => setIsModalVisible(false)}
				footer={[
					<Button key="close" onClick={() => setIsModalVisible(false)}>
						Close
					</Button>,
				]}
			>
				{viewedRecord && (
					<div>
						<p>
							<strong>Title:</strong> {viewedRecord.title}
						</p>
						<p>
							<strong>Description:</strong> {viewedRecord.description}
						</p>
						<p>
							<strong>Date:</strong> {viewedRecord.reminder_date}
						</p>
						<p>
							<strong>Time:</strong> {viewedRecord.reminder_time}
						</p>
						<p>
							<strong>Status:</strong> {viewedRecord.status}
						</p>
					</div>
				)}
			</Modal>
		</Row>
	);
};

export default Reminders;
