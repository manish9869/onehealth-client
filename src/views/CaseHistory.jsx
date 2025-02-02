import React, { useEffect, useState, useRef } from "react";
import {
	Form,
	Input,
	Button,
	Select,
	DatePicker,
	Upload,
	Card,
	Row,
	Col,
	Table,
	Modal,
	Tooltip,
	Image,
	notification,
	Typography,
	Divider,
	List,
} from "antd";
import { UploadOutlined, EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, FileOutlined } from "@ant-design/icons";
import axios from "./../helpers/axiosConfig";
import BundledEditor from "./../components/TinyMce/BundledEditor";
import API_ENDPOINTS from "../config/apiConfig";
import MESSAGES from "./../config/messages";
import moment from "moment";
const { Option } = Select;
const { Title, Text } = Typography;
const CaseHistory = () => {
	const [form] = Form.useForm();
	const [caseHistoryList, setCaseHistoryList] = useState([]);
	const [customerList, setCustomerList] = useState([]);
	const [staffMemberList, setStaffMemberList] = useState([]);
	const [conditionList, setConditionList] = useState([]);
	const [treatmentList, setTreatmentList] = useState([]);
	const [medicineList, setMedicineList] = useState([]);
	const [fileList, setFileList] = useState([]);
	const [editingCase, setEditingCase] = useState(null);
	const [viewedRecord, setViewedRecord] = useState(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewImage, setPreviewImage] = useState("");
	const dentailEditorRef = useRef(null);
	const medicalEditorRef = useRef(null);
	const notesEditorRef = useRef(null);
	const [searchText, setSearchText] = useState("");
	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			const responses = await Promise.all([
				axios.get(API_ENDPOINTS.CUSTOMERS),
				axios.get(API_ENDPOINTS.STAFF_MEMBERS),
				axios.get(API_ENDPOINTS.MEDICAL_CONDITIONS),
				axios.get(API_ENDPOINTS.TREATMENTS),
				axios.get(API_ENDPOINTS.MEDICINES),
				axios.get(API_ENDPOINTS.CASE_HISTORY),
			]);

			setCustomerList(responses[0].data.data);
			setStaffMemberList(responses[1].data.data);
			setConditionList(responses[2].data.data);
			setTreatmentList(responses[3].data.data);
			setMedicineList(responses[4].data.data);
			setCaseHistoryList(responses[5].data.data);
		} catch (error) {
			console.error("Error fetching data:", error); // Log error instead of notification
		}
	};

	const handleView = record => {
		console.log("record", record);
		setViewedRecord(record);
		setIsModalVisible(true);
	};

	const handleEdit = record => {
		setIsEdit(true);
		setEditingCase(record);

		form.setFieldsValue({
			customerId: record.customer_id,
			staffMemberId: record.staff_member_id,
			caseDate: record.case_date ? moment(record.case_date) : null,

			conditionIds: record.case_conditions.map(condition => condition.condition_id) || [],
			treatmentIds: record.case_treatments.map(treatment => treatment.treatment_id) || [],
			medicineIds: record.case_medicines.map(medicine => medicine.medicine_id) || [],
		});

		// Set TinyMCE editor content for dental, medical history, and notes
		if (dentailEditorRef.current) {
			dentailEditorRef.current.setContent(record.dental_history || "");
		}
		if (medicalEditorRef.current) {
			medicalEditorRef.current.setContent(record.medical_history || "");
		}
		if (notesEditorRef.current) {
			notesEditorRef.current.setContent(record.notes || "");
		}

		setFileList(
			record.case_documents?.map(doc => ({
				uid: doc.id,
				name: doc.documentName,
				status: "done",
				url: doc.url,
			})) || []
		);
	};

	const handleDelete = async key => {
		try {
			await axios.delete(`${API_ENDPOINTS.CASE_HISTORY}/${key}`);
			notification.success({ message: MESSAGES.DELETE_SUCCESS });
			fetchData();
		} catch (error) {
			notification.error({ message: MESSAGES.DELETE_ERROR });
			console.error("Failed to delete case history:", error);
		}
	};

	const handleSubmit = async values => {
		try {
			const existingFiles = fileList.filter(file => file.url); // Files with URLs
			const newFiles = fileList.filter(file => !file.url); // Files without URLs (new uploads)

			let uploadedFiles = [];

			if (newFiles.length > 0) {
				const formData = new FormData();

				newFiles.forEach(file => {
					formData.append("files", file.originFileObj);
				});

				const uploadResponse = await axios.post(`${API_ENDPOINTS.MEDIA_UPLOAD}/upload`, formData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				});

				if (uploadResponse.data.status === "success") {
					// Map uploaded files to the format you need
					uploadedFiles = uploadResponse.data.data.map(uploadedFile => ({
						documentType: uploadedFile.extension,
						documentName: uploadedFile.filename,
						documentFolder: "2024/documents",
						url: uploadedFile.path,
					}));
				} else {
					notification.error({ message: "Failed to upload document" });
					return;
				}
			}

			// Combine existing and uploaded files for case_documents
			const caseDocuments = [
				...existingFiles.map(file => ({
					documentType: file.documentType || file.url.split(".").pop(), // Extract type if not defined
					documentName: file.name,
					documentFolder: "2024/documents",
					url: file.url,
				})),
				...uploadedFiles,
			];

			const dentalHistoryContent = dentailEditorRef.current ? dentailEditorRef.current.getContent() : "";
			const medicalHistoryContent = medicalEditorRef.current ? medicalEditorRef.current.getContent() : "";
			const notesContent = notesEditorRef.current ? notesEditorRef.current.getContent() : "";

			const dataToSubmit = {
				customer_id: values.customerId,
				staff_member_id: values.staffMemberId,
				case_date: values.caseDate,
				case_conditions: values.conditionIds,
				case_treatments: values.treatmentIds,
				case_medicines: values.medicineIds,
				dental_history: dentalHistoryContent,
				medical_history: medicalHistoryContent,
				notes: notesContent,
				case_documents: caseDocuments,
			};

			const url = isEdit ? `${API_ENDPOINTS.CASE_HISTORY}/${editingCase.key}` : API_ENDPOINTS.CASE_HISTORY;
			const method = isEdit ? "put" : "post";

			await axios[method](url, dataToSubmit);
			notification.success({
				message: isEdit ? MESSAGES.UPDATE_SUCCESS : MESSAGES.ADD_SUCCESS,
			});
			fetchData();
			resetForm();
		} catch (error) {
			notification.error({ message: "Failed to submit customer data" });
			console.error("Failed to submit case history:", error);
		}
	};

	const resetForm = () => {
		form.resetFields();
		setFileList([]);
		setPreviewImage("");
		setEditingCase(null);
		setIsEdit(false);
	};
	const isImage = url => {
		return url && (url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".png") || url.endsWith(".gif"));
	};
	const isPDF = url => {
		return url && url.endsWith(".pdf");
	};

	const handleSearchChange = e => {
		setSearchText(e.target.value);
	};

	// Filter data based on search text
	const filteredData = caseHistoryList.filter(item => {
		const { customer, staff_member, case_date } = item;
		const searchLower = searchText.toLowerCase();
		return (
			customer?.fullname.toLowerCase().includes(searchLower) ||
			staff_member?.fullname.toLowerCase().includes(searchLower) ||
			new Date(case_date).toLocaleDateString().includes(searchLower)
		);
	});
	const columns = [
		{
			title: "Customer Name",
			dataIndex: "customer",
			key: "customer",
			render: customer => customer?.fullname || "N/A",
		},
		{
			title: "Staff Member Name",
			dataIndex: "staff_member",
			key: "staff_member",
			render: staff_member => staff_member?.fullname || "N/A",
		},
		{
			title: "Case Date",
			dataIndex: "case_date",
			key: "case_date",
			render: date => (date ? new Date(date).toLocaleDateString() : "N/A"),
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
							onClick={() => handleDelete(record.case_id)} // Ensure you're using a unique identifier here
							style={{ color: "#f5222d", fontSize: "16px", cursor: "pointer" }}
						/>
					</Tooltip>
				</span>
			),
		},
	];

	const expandedRowRender = record => {
		return (
			<div>
				<h3>Treatments</h3>
				{record.case_treatments.map(treatment => (
					<div key={treatment.treatment_id}>
						{" "}
						{/* Ensure treatment_id is unique */}
						<strong>{treatment.treatment.name}</strong> - {treatment.treatment.description}
					</div>
				))}

				<h3>Medicines</h3>
				{record.case_medicines.map(medicine => (
					<div key={medicine.medicine_id}>
						{" "}
						{/* Ensure medicine_id is unique */}
						<strong>{medicine.medicine.name}</strong> - {medicine.medicine.description}
					</div>
				))}

				<h3>Conditions</h3>
				{record.case_conditions.map(condition => (
					<div key={condition.condition_id}>
						{" "}
						{/* Ensure condition_id is unique */}
						<strong>{condition.medical_condition.name}</strong> - {condition.medical_condition.description}
					</div>
				))}

				<h3>Notes</h3>
				{record.notes}

				<h3>Documents</h3>
				{record.case_documents.map(document => (
					<div key={document.id}>
						{/* Ensure document.id is unique */}
						<strong>{document.documentName}</strong> -
						{isImage(document.url) ? (
							<a
								href="#"
								onClick={e => {
									e.preventDefault();
									handlePreview(document);
								}}
							>
								View Image
							</a>
						) : (
							<a href={document.url} target="_blank" rel="noopener noreferrer">
								View Document
							</a>
						)}
					</div>
				))}
			</div>
		);
	};
	const handlePreview = async file => {
		// Check if the file is an image or a document
		if (file.url && (file.url.endsWith(".pdf") || file.url.endsWith(".doc") || file.url.endsWith(".docx"))) {
			// If it's a document file, open it in a new tab
			window.open(file.url, "_blank");
		} else {
			// For images, preview as before
			if (!file.url && !file.preview) {
				file.preview = await getBase64(file.originFileObj);
			}
			setPreviewImage(file.url || file.preview);
			setPreviewOpen(true);
		}
	};

	const uploadButton = (
		<button
			style={{
				border: 0,
				background: "none",
			}}
			type="button"
		>
			<PlusOutlined />
			<div
				style={{
					marginTop: 8,
				}}
			>
				Upload
			</div>
		</button>
	);

	const getBase64 = file =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = error => reject(error);
		});

	const renderDocumentPreview = doc => {
		if (isImage(doc.url)) {
			return (
				<Image src={doc.url} alt="Image Preview" style={{ width: "100%", maxHeight: "300px", objectFit: "cover" }} />
			);
		} else if (isPDF(doc.url)) {
			return (
				// <iframe
				//   src={doc.url}
				//   title={doc.documentName}
				//   style={{ width: "100%", height: "500px" }}
				// />
				<a href={doc.url} target="_blank" rel="noopener noreferrer">
					<FileOutlined /> View Document
				</a>
			);
		} else {
			return (
				<a href={doc.url} target="_blank" rel="noopener noreferrer">
					<FileOutlined /> View Document
				</a>
			);
		}
	};
	return (
		<div className="container">
			<Col lg={24} md={24} sm={24} xs={24}>
				<Card title="Manage Case History Form">
					<Form form={form} layout="vertical" onFinish={handleSubmit} encType="multipart/form-data">
						<Row gutter={16}>
							<Col lg={8} md={8} sm={24} xs={24}>
								<Form.Item
									name="customerId"
									label="Select Customer"
									rules={[{ required: true, message: "Please select a customer" }]}
								>
									<Select placeholder="Select Customer">
										{customerList.map(customer => (
											<Option key={customer.customer_id} value={customer.customer_id}>
												{customer.fullname}
											</Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col lg={8} md={8} sm={24} xs={24}>
								<Form.Item
									name="staffMemberId"
									label="Select Staff"
									rules={[{ required: true, message: "Please select a staff member" }]}
								>
									<Select placeholder="Select Staff">
										{staffMemberList.map(staff => (
											<Option key={staff.staff_member_id} value={staff.staff_member_id}>
												{staff.fullname}
											</Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col lg={8} md={8} sm={24} xs={24}>
								<Form.Item
									name="caseDate"
									label="Case Date"
									rules={[{ required: true, message: "Please select a case date" }]}
								>
									<DatePicker style={{ width: "100%" }} />
								</Form.Item>
							</Col>
						</Row>

						<Row gutter={16}>
							<Col lg={8} md={8} sm={24} xs={24}>
								<Form.Item
									name="conditionIds"
									label="Select Conditions"
									rules={[
										{
											required: true,
											message: "Please select at least one condition",
										},
									]}
								>
									<Select mode="multiple" placeholder="Select Conditions">
										{conditionList.map(condition => (
											<Option key={condition.condition_id} value={condition.condition_id}>
												{condition.name}
											</Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col lg={8} md={8} sm={24} xs={24}>
								<Form.Item
									name="treatmentIds"
									label="Select Treatments"
									rules={[
										{
											required: true,
											message: "Please select at least one treatment",
										},
									]}
								>
									<Select mode="multiple" placeholder="Select Treatments">
										{treatmentList.map(treatment => (
											<Option key={treatment.treatment_id} value={treatment.treatment_id}>
												{treatment.name}
											</Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col lg={8} md={8} sm={24} xs={24}>
								<Form.Item
									name="medicineIds"
									label="Select Medicines"
									rules={[
										{
											required: true,
											message: "Please select at least one medicine",
										},
									]}
								>
									<Select mode="multiple" placeholder="Select Medicines">
										{medicineList.map(medicine => (
											<Option key={medicine.medicine_id} value={medicine.medicine_id}>
												{medicine.name}
											</Option>
										))}
									</Select>
								</Form.Item>
							</Col>
						</Row>

						<Row gutter={16}>
							<Col lg={12} md={12} sm={24} xs={24}>
								<Form.Item name="dentalHistory" label="Dental History">
									<BundledEditor onInit={(_evt, editor) => (dentailEditorRef.current = editor)} />
								</Form.Item>
							</Col>
							<Col lg={12} md={12} sm={24} xs={24}>
								<Form.Item name="medicalHistory" label="Medical History">
									<BundledEditor onInit={(_evt, editor) => (medicalEditorRef.current = editor)} />
								</Form.Item>
							</Col>
						</Row>

						<Row gutter={16}>
							<Col span={24}>
								<Form.Item name="notes" label="Notes">
									<BundledEditor onInit={(_evt, editor) => (notesEditorRef.current = editor)} />
								</Form.Item>
							</Col>
						</Row>

						<Row gutter={16}>
							<Col span={12}>
								<Form.Item label="Upload Documents">
									<Upload
										listType="picture-card"
										beforeUpload={() => false}
										fileList={fileList}
										onPreview={handlePreview}
										multiple
										onChange={({ fileList }) => setFileList(fileList)}
									>
										{fileList.length >= 8 ? null : uploadButton}
									</Upload>
									{previewImage && (
										<Image
											wrapperStyle={{
												display: "none",
											}}
											preview={{
												visible: previewOpen,
												onVisibleChange: visible => {
													setPreviewOpen(visible);
													if (!visible) setPreviewImage(""); // Reset preview image when closed
												},
											}}
											src={previewImage}
										/>
									)}
								</Form.Item>
							</Col>
						</Row>

						<Row gutter={16}>
							<Col span={24}>
								<Form.Item style={{ display: "flex", justifyContent: "flex-start" }}>
									<Button type="primary" htmlType="submit" style={{ marginRight: "8px" }}>
										{isEdit ? "Update Case" : "Add Case"}
									</Button>
									<Button onClick={resetForm} type="primary" danger>
										Cancel
									</Button>
								</Form.Item>
							</Col>
						</Row>
					</Form>
				</Card>
			</Col>
			<Col lg={24} md={24} sm={24} xs={24}>
				<Card title="Case History List">
					<Input
						placeholder="Search by Customer, Staff, or Case Date"
						value={searchText}
						onChange={handleSearchChange}
						style={{ marginBottom: 16 }}
					/>
					<Table
						columns={columns}
						dataSource={filteredData.map(item => ({
							...item,
							key: item.key || item.case_id, // Make sure to use a unique identifier
						}))}
						expandable={{
							expandedRowRender,
						}}
						scroll={{ x: 600 }}
					/>{" "}
				</Card>
			</Col>
			<Modal
				title={<Title level={3}>View Case History</Title>}
				open={isModalVisible}
				onCancel={() => setIsModalVisible(false)}
				footer={null}
			>
				{viewedRecord && (
					<div>
						<Card bordered style={{ marginBottom: 16 }}>
							<Title level={4}>Basic Information</Title>
							<Text strong>Customer Name:</Text> {viewedRecord.customer?.fullname || "N/A"}
							<br />
							<Text strong>Staff Member Name:</Text> {viewedRecord.staff_member?.fullname || "N/A"}
							<br />
							<Text strong>Case Date:</Text>{" "}
							{viewedRecord.case_date ? new Date(viewedRecord.case_date).toLocaleDateString() : "N/A"}
						</Card>

						<Card bordered style={{ marginBottom: 16 }}>
							<Title level={4}>Case Details</Title>
							<Text strong>Notes:</Text>
							<div
								dangerouslySetInnerHTML={{
									__html: viewedRecord.notes || "<p>No Notes Provided</p>",
								}}
							/>
							<Divider />
							<Text strong>Dental History:</Text>
							<div
								dangerouslySetInnerHTML={{
									__html: viewedRecord.dental_history || "<p>No Dental History</p>",
								}}
							/>
							<Divider />
							<Text strong>Medical History:</Text>
							<div
								dangerouslySetInnerHTML={{
									__html: viewedRecord.medical_history || "<p>No Medical History</p>",
								}}
							/>
						</Card>

						<Card bordered>
							<Title level={4}>Documents</Title>
							{viewedRecord.case_documents && viewedRecord.case_documents.length > 0 ? (
								<List
									bordered
									dataSource={viewedRecord.case_documents}
									renderItem={(doc, index) => (
										<List.Item key={index}>
											<div>
												{/* <strong>{doc.documentName}</strong> */}
												<div>{renderDocumentPreview(doc)}</div>
											</div>
										</List.Item>
									)}
								/>
							) : (
								<Text>No documents available</Text>
							)}
						</Card>

						<Card bordered style={{ marginTop: 16 }}>
							<Title level={4}>Audit Information</Title>
							<Text strong>Created At:</Text>{" "}
							{viewedRecord.created_at ? new Date(viewedRecord.created_at).toLocaleString() : "N/A"}
							<br />
							<Text strong>Updated At:</Text>{" "}
							{viewedRecord.updated_at ? new Date(viewedRecord.updated_at).toLocaleString() : "N/A"}
						</Card>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default CaseHistory;
