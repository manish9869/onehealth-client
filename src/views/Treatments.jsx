import { useState, useEffect } from "react";
import axios from "./../helpers/axiosConfig";
import { Card, Row, Col, Form, Input, Button, Table, notification, Select, Tooltip, Modal } from "antd";
import { EyeOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import API_ENDPOINTS from "./../config/apiConfig";
import MESSAGES from "./../config/messages";

const { Option } = Select;

const Treatments = () => {
	const [rowData, setRowData] = useState([]);
	const [isEdit, setIsEdit] = useState(false);
	const [editedTreatmentId, setEditedTreatmentId] = useState(null);
	const [searchText, setSearchText] = useState("");
	const [filteredData, setFilteredData] = useState([]);
	const [form] = Form.useForm();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [viewedRecord, setViewedRecord] = useState(null);

	const fetchTreatments = async () => {
		try {
			const response = await axios.get(API_ENDPOINTS.TREATMENTS);
			setRowData(response.data.data);
			setFilteredData(response.data.data);
		} catch (error) {
			notification.error({ message: MESSAGES.FETCH_ERROR });
		}
	};

	useEffect(() => {
		fetchTreatments();
	}, []);

	const handleView = record => {
		setViewedRecord(record);
		setIsModalVisible(true);
	};

	const handleEdit = record => {
		setIsEdit(true);
		setEditedTreatmentId(record.treatment_id);

		form.setFieldsValue({
			name: record.name,
			cost: record.cost,
			duration: record.duration,
			type: record.type,
			description: record.description,
		});
	};

	const handleDelete = async treatmentId => {
		try {
			await axios.delete(`${API_ENDPOINTS.TREATMENTS}/${treatmentId}`);
			notification.success({ message: MESSAGES.DELETE_SUCCESS });
			fetchTreatments();
		} catch (error) {
			notification.error({ message: MESSAGES.DELETE_ERROR });
		}
	};

	const handleSubmit = async values => {
		try {
			const dataToSubmit = {
				...values,
				cost: Number(values.cost),
			};

			const url = isEdit ? `${API_ENDPOINTS.TREATMENTS}/${editedTreatmentId}` : API_ENDPOINTS.TREATMENTS;
			const method = isEdit ? "put" : "post";
			await axios[method](url, dataToSubmit);
			notification.success({
				message: isEdit ? MESSAGES.UPDATE_SUCCESS : MESSAGES.ADD_SUCCESS,
			});
			fetchTreatments();
			resetForm();
		} catch (error) {
			notification.error({ message: "Failed to submit treatment data" });
		}
	};

	const resetForm = () => {
		setIsEdit(false);
		setEditedTreatmentId(null);
		form.resetFields();
	};

	const handleGlobalSearch = value => {
		setSearchText(value);
		const filtered = rowData.filter(
			item =>
				item.name.toLowerCase().includes(value.toLowerCase()) ||
				item.cost.toLowerCase().includes(value.toLowerCase()) ||
				item.duration.toLowerCase().includes(value.toLowerCase()) ||
				item.type.toLowerCase().includes(value.toLowerCase())
		);
		setFilteredData(filtered);
	};

	const handleCostChange = e => {
		const value = e.target.value.replace(/[^0-9.]/g, ""); // Allow only digits and periods
		if (/^\d*\.?\d{0,2}$/.test(value)) {
			// Match currency format with max 2 decimals
			form.setFieldsValue({ cost: value });
		}
	};

	const columns = [
		{
			title: "Name",
			dataIndex: "name",
			sorter: (a, b) => a.name.localeCompare(b.name),
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
				<div style={{ padding: 8 }}>
					<Input
						placeholder="Search Name"
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
			onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
			filterIcon: filtered => <span>🔍</span>,
		},
		{
			title: "Cost",
			dataIndex: "cost",
			sorter: (a, b) => a.cost - b.cost,
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
				<div style={{ padding: 8 }}>
					<Input
						placeholder="Search Cost"
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
			onFilter: (value, record) => record.cost.toString().includes(value),
			filterIcon: filtered => <span>🔍</span>,
		},
		{
			title: "Duration",
			dataIndex: "duration",
			sorter: (a, b) => a.duration.localeCompare(b.duration),
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
				<div style={{ padding: 8 }}>
					<Input
						placeholder="Search Duration"
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
			onFilter: (value, record) => record.duration.toLowerCase().includes(value.toLowerCase()),
			filterIcon: filtered => <span>🔍</span>,
		},
		{
			title: "Type",
			dataIndex: "type",
			sorter: (a, b) => a.type.localeCompare(b.type),
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
				<div style={{ padding: 8 }}>
					<Input
						placeholder="Search Type"
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
			onFilter: (value, record) => record.type.toLowerCase().includes(value.toLowerCase()),
			filterIcon: filtered => <span>🔍</span>,
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
							onClick={() => handleDelete(record.treatment_id)}
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
				<Card title={isEdit ? "Update Treatment" : "Add Treatment"}>
					<Form form={form} onFinish={handleSubmit} layout="vertical">
						<Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter the Name" }]}>
							<Input placeholder="Name" />
						</Form.Item>
						<Form.Item name="cost" label="Cost" rules={[{ required: true, message: "Please enter the Cost" }]}>
							<Input placeholder="Cost" onChange={handleCostChange} maxLength={10} />
						</Form.Item>
						<Form.Item
							name="duration"
							label="Duration"
							rules={[{ required: true, message: "Please enter the Duration" }]}
						>
							<Input placeholder="Duration" type="number" />
						</Form.Item>
						<Form.Item name="type" label="Type" rules={[{ required: true, message: "Please enter the Type" }]}>
							<Input placeholder="Type" />
						</Form.Item>
						<Form.Item
							name="description"
							label="Description"
							rules={[{ required: true, message: "Please enter the Description" }]}
						>
							<Input.TextArea placeholder="Description" rows={4} />
						</Form.Item>
						<Form.Item>
							<Button type="primary" htmlType="submit">
								{isEdit ? "Update Treatment" : "Add Treatment"}
							</Button>
							<Button style={{ marginLeft: 8 }} onClick={resetForm} type="primary" danger>
								Cancel
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</Col>

			<Col lg={16} md={24} sm={24} xs={24}>
				<Card title="Treatment List">
					<Input
						placeholder="Search by any field"
						value={searchText}
						onChange={e => handleGlobalSearch(e.target.value)}
						style={{ marginBottom: 16 }}
					/>
					<Table
						columns={columns}
						dataSource={filteredData}
						rowKey="treatment_id"
						pagination={{ pageSize: 10 }}
						scroll={{ x: 600 }}
					/>
				</Card>
			</Col>

			<Modal
				title="Treatment Details"
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
							<strong>Name:</strong> {viewedRecord.name}
						</p>
						<p>
							<strong>Cost:</strong> {viewedRecord.cost}
						</p>
						<p>
							<strong>Duration:</strong> {viewedRecord.duration}
						</p>
						<p>
							<strong>Type:</strong> {viewedRecord.type}
						</p>
						<p>
							<strong>Description:</strong> {viewedRecord.description}
						</p>
					</div>
				)}
			</Modal>
		</Row>
	);
};

export default Treatments;
