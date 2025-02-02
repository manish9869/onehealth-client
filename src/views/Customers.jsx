import React, { useState, useEffect } from "react";
import axios from "./../helpers/axiosConfig";
import { Card, Row, Col, Form, Input, Button, Table, Tooltip, notification, DatePicker } from "antd";
import { EyeOutlined, DeleteOutlined, FundViewOutlined, EditOutlined, MailOutlined } from "@ant-design/icons";
import API_ENDPOINTS from "./../config/apiConfig";
import MESSAGES from "./../config/messages";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const Customers = () => {
	const [rowData, setRowData] = useState([]);
	const [isEdit, setIsEdit] = useState(false);
	const [editedCustomerId, setEditedCustomerId] = useState(null);
	const [searchText, setSearchText] = useState("");
	const [filteredData, setFilteredData] = useState([]);
	const [form] = Form.useForm();

	const navigate = useNavigate();

	const fetchCustomers = async () => {
		try {
			const response = await axios.get(API_ENDPOINTS.CUSTOMERS);
			setRowData(response.data.data);
			setFilteredData(response.data.data);
		} catch (error) {
			notification.error({ message: MESSAGES.FETCH_ERROR });
		}
	};

	useEffect(() => {
		fetchCustomers();
	}, []);

	const handleView = record => {
		navigate(`/admin/customer-view/${record.customer_id}`);
	};

	const handleEdit = record => {
		setIsEdit(true);
		setEditedCustomerId(record.customer_id);

		// Set form fields with the values from the record
		form.setFieldsValue({
			fullname: record.fullname,
			email: record.email,
			mobile: record.mobile,
			alt_mobile: record.alt_mobile || "",
			address: record.address || "",
			DOB: record.DOB ? moment(record.DOB) : null,
			insurance_policy: record.insurance_policy,
		});
	};

	const handleDelete = async customerId => {
		try {
			await axios.delete(`${API_ENDPOINTS.CUSTOMERS}/${customerId}`);
			notification.success({ message: MESSAGES.DELETE_SUCCESS });
			fetchCustomers();
		} catch (error) {
			notification.error({ message: MESSAGES.DELETE_ERROR });
		}
	};

	const handleSendEmail = async userId => {
		try {
			await axios.post(`${API_ENDPOINTS.CUSTOMERS}/${userId}/send-email`);
			notification.success({ message: "Email sent successfully!" });
		} catch (error) {
			notification.error({ message: "Failed to send email" });
		}
	};

	const handleSubmit = async values => {
		try {
			const dataToSubmit = {
				...values,
				DOB: values.DOB ? values.DOB.toISOString() : null,
			};

			const url = isEdit ? `${API_ENDPOINTS.CUSTOMERS}/${editedCustomerId}` : API_ENDPOINTS.CUSTOMERS;
			const method = isEdit ? "put" : "post";
			await axios[method](url, dataToSubmit);
			notification.success({
				message: isEdit ? MESSAGES.UPDATE_SUCCESS : MESSAGES.ADD_SUCCESS,
			});
			fetchCustomers();
			resetForm();
		} catch (error) {
			notification.error({ message: "Failed to submit customer data" });
		}
	};

	const resetForm = () => {
		setIsEdit(false);
		setEditedCustomerId(null);
		form.resetFields();
	};

	const handleGlobalSearch = value => {
		setSearchText(value);
		const filtered = rowData.filter(item => item.fullname.toLowerCase().includes(value.toLowerCase()));
		setFilteredData(filtered);
	};

	const columns = [
		{
			title: "Full Name",
			dataIndex: "fullname",
			sorter: (a, b) => a.fullname.localeCompare(b.fullname),
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
				<div style={{ padding: 8 }}>
					<Input
						placeholder="Search Full Name"
						value={selectedKeys[0]}
						onChange={e => {
							setSelectedKeys(e.target.value ? [e.target.value] : []);
							handleGlobalSearch(e.target.value);
						}}
						onPressEnter={() => {
							confirm();
							handleGlobalSearch(selectedKeys[0]);
						}}
						style={{ width: 188, marginBottom: 8, display: "block" }}
					/>
					<Button
						onClick={() => {
							setSelectedKeys([]);
							confirm();
							handleGlobalSearch("");
						}}
					>
						Reset
					</Button>
				</div>
			),
			onFilter: (value, record) => record.fullname.toLowerCase().includes(value.toLowerCase()),
			filterIcon: filtered => <span>🔍</span>,
		},
		{
			title: "Email",
			dataIndex: "email",
			sorter: (a, b) => a.email.localeCompare(b.email),
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
				<div style={{ padding: 8 }}>
					<Input
						placeholder="Search Email"
						value={selectedKeys[0]}
						onChange={e => {
							setSelectedKeys(e.target.value ? [e.target.value] : []);
							handleGlobalSearch(e.target.value);
						}}
						onPressEnter={() => {
							confirm();
							handleGlobalSearch(selectedKeys[0]);
						}}
						style={{ width: 188, marginBottom: 8, display: "block" }}
					/>
					<Button
						onClick={() => {
							setSelectedKeys([]);
							confirm();
							handleGlobalSearch("");
						}}
					>
						Reset
					</Button>
				</div>
			),
			onFilter: (value, record) => record.email.toLowerCase().includes(value.toLowerCase()),
			filterIcon: filtered => <span>🔍</span>,
		},
		{
			title: "Mobile",
			dataIndex: "mobile",
			sorter: (a, b) => a.mobile.localeCompare(b.mobile),
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
				<div style={{ padding: 8 }}>
					<Input
						placeholder="Search Mobile"
						value={selectedKeys[0]}
						onChange={e => {
							setSelectedKeys(e.target.value ? [e.target.value] : []);
							handleGlobalSearch(e.target.value);
						}}
						onPressEnter={() => {
							confirm();
							handleGlobalSearch(selectedKeys[0]);
						}}
						style={{ width: 188, marginBottom: 8, display: "block" }}
					/>
					<Button
						onClick={() => {
							setSelectedKeys([]);
							confirm();
							handleGlobalSearch("");
						}}
					>
						Reset
					</Button>
				</div>
			),
			onFilter: (value, record) => record.mobile.toLowerCase().includes(value.toLowerCase()),
			filterIcon: filtered => <span>🔍</span>,
		},
		{
			title: "Actions",
			render: (text, record) => (
				<span style={{ display: "flex", gap: "8px" }}>
					{/* View Icon */}
					<Tooltip title="View">
						<EyeOutlined
							onClick={() => handleView(record)}
							style={{ color: "#52c41a", fontSize: "16px", cursor: "pointer" }}
						/>
					</Tooltip>

					{/* Edit Icon */}
					<Tooltip title="Edit">
						<EditOutlined
							onClick={() => handleEdit(record)}
							style={{ color: "#1890ff", fontSize: "16px", cursor: "pointer" }}
						/>
					</Tooltip>

					{/* Delete Icon */}
					<Tooltip title="Delete">
						<DeleteOutlined
							onClick={() => handleDelete(record.customer_id)}
							style={{ color: "#f5222d", fontSize: "16px", cursor: "pointer" }}
						/>
					</Tooltip>

					{/* Send Email Icon */}
					<Tooltip title="Send Email">
						<MailOutlined
							onClick={() => handleSendEmail(record.customer_id)}
							style={{ color: "#ffcc00", fontSize: "16px", cursor: "pointer" }}
						/>
					</Tooltip>
				</span>
			),
			filterIcon: filtered => <span>🔍</span>,
		},
	];

	return (
		<Row gutter={[16, 16]}>
			<Col lg={8} md={24} xs={24}>
				<Card title={isEdit ? "Update Customer" : "Manage Customer"}>
					<Form form={form} onFinish={handleSubmit} layout="vertical">
						<Form.Item
							name="fullname"
							label="Full Name"
							rules={[{ required: true, message: "Please enter the Full Name" }]}
						>
							<Input placeholder="Full Name" />
						</Form.Item>
						<Form.Item
							name="email"
							label="Email"
							rules={[{ type: "email", message: "Please enter a valid Email" }]}
						>
							<Input placeholder="Email" />
						</Form.Item>
						<Form.Item
							name="mobile"
							label="Mobile"
							rules={[{ required: true, message: "Please enter the Mobile number" }]}
						>
							<Input placeholder="Mobile" />
						</Form.Item>
						<Form.Item name="alt_mobile" label="Alternate Mobile">
							<Input placeholder="Alternate Mobile" />
						</Form.Item>
						<Form.Item name="address" label="Address">
							<Input.TextArea placeholder="Address" rows={4} />
						</Form.Item>
						<Form.Item
							name="password"
							label="Password"
							rules={[{ required: !isEdit, message: "Please enter a Password" }]}
						>
							<Input.Password placeholder="Password" />
						</Form.Item>
						<Form.Item
							name="DOB"
							label="Date of Birth"
							rules={[{ required: true, message: "Please select your Date of Birth" }]}
						>
							<DatePicker format="YYYY-MM-DD" />
						</Form.Item>
						<Form.Item
							name="insurance_policy"
							label="Insurance Policy"
							rules={[{ required: true, message: "Please enter Insurance Policy" }]}
						>
							<Input placeholder="Insurance Policy" />
						</Form.Item>
						<Form.Item>
							<Button type="primary" htmlType="submit">
								{isEdit ? "Update Customer" : "Add Customer"}
							</Button>
							<Button style={{ marginLeft: 8 }} onClick={resetForm} type="primary" danger>
								Cancel
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</Col>

			<Col lg={16} md={24} xs={24}>
				<Card title="Customer List">
					<Input
						placeholder="Search"
						value={searchText}
						onChange={e => handleGlobalSearch(e.target.value)}
						style={{ marginBottom: 16 }}
					/>
					<Table
						columns={columns}
						dataSource={filteredData}
						rowKey="customer_id"
						pagination={{ pageSize: 10 }}
						scroll={{ x: 600 }}
					/>
				</Card>
			</Col>
		</Row>
	);
};

export default Customers;
