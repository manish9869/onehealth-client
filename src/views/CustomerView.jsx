import React, { useContext, useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Collapse, Descriptions, Button, Tabs, Card, Row, Col, Tour, Space, notification, List } from "antd";
import {
	LeftOutlined,
	CheckCircleOutlined,
	PlusCircleOutlined,
	InfoCircleOutlined,
	FilePdfTwoTone,
	SolutionOutlined,
	FolderOpenOutlined,
	QuestionCircleOutlined,
} from "@ant-design/icons";
import { ThemeContext } from "../App";
import axios from "../helpers/axiosConfig";
import API_ENDPOINTS from "../config/apiConfig";
import MESSAGES from "../config/messages";

const { Panel } = Collapse;
const { TabPane } = Tabs;

const CustomerView = () => {
	const { isDarkTheme } = useContext(ThemeContext);
	const navigate = useNavigate();

	const [isTourOpen, setIsTourOpen] = useState(false);
	const [activeKey, setActiveKey] = useState(null);
	const [caseData, setCaseData] = useState([]);
	const [loading, setLoading] = useState(true);

	const backButtonRef = useRef(null);
	const accordionRef = useRef(null);
	const caseOverviewTabRef = useRef(null);

	const fetchCaseHistory = async () => {
		try {
			const response = await axios.get(`${API_ENDPOINTS.CASE_HISTORY}`);
			setCaseData(response.data.data);
		} catch (error) {
			console.error("Error fetching case history:", error);
			notification.error({ message: MESSAGES.FETCH_ERROR });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCaseHistory();
	}, []);

	const steps = [
		{
			title: "Back Button",
			description: "Click here to go back to the Customers page.",
			target: () => backButtonRef.current,
		},
		{
			title: "Case Overview",
			description: "Here you can see all cases. Click to expand and see more details.",
			target: () => accordionRef.current,
			onNext: () => setActiveKey("0"),
		},
		// {
		// 	title: "Case Overview and Documents",
		// 	description:
		// 		"This section shows the general overview of the case. You can also see documents related to the case.",
		// 	target: () => caseOverviewTabRef.current,
		// 	onNext: () => setIsTourOpen(false),
		// },
	];

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<Tour open={isTourOpen} onClose={() => setIsTourOpen(false)} steps={steps} />

			<Space style={{ width: "100%", display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
				<Button
					type="link"
					ref={backButtonRef}
					onClick={() => navigate(-1)}
					icon={<LeftOutlined />}
					style={{ margin: "10px" }}
				></Button>

				<Button
					icon={<QuestionCircleOutlined />}
					onClick={() => setIsTourOpen(true)}
					type="primary"
					shape="circle"
					style={{ marginRight: "10px" }}
				/>
			</Space>

			<Collapse
				accordion
				bordered={false}
				ref={accordionRef}
				activeKey={activeKey}
				onChange={key => setActiveKey(key)}
				style={{
					backgroundColor: isDarkTheme ? "#001529" : "#ffffff",
				}}
			>
				{caseData &&
					caseData.map((singleCase, index) => (
						<Panel
							header={`${singleCase.case_date.split("T")[0]} | ${singleCase.notes}`}
							key={index}
							showArrow={false}
							style={{
								backgroundColor: isDarkTheme ? "#001529" : "#ffffff",
								borderRadius: "5px",
								color: isDarkTheme ? "#e0e0e0" : "#000000",
								transition: "background-color 0.3s, box-shadow 0.3s",
							}}
						>
							<Tabs defaultActiveKey="1">
								<TabPane
									tab={
										<span ref={caseOverviewTabRef}>
											<SolutionOutlined /> Case Overview
										</span>
									}
									key="1"
								>
									<Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
										<Descriptions.Item label="Date">
											{singleCase.case_date.split("T")[0]}
										</Descriptions.Item>
										<Descriptions.Item label="Staff Member">
											{singleCase.staff_member.fullname}
										</Descriptions.Item>
										<Descriptions.Item label="Customer Name">
											{singleCase.customer.fullname}
										</Descriptions.Item>
										<Descriptions.Item label="Medical History">
											{singleCase.medical_history || "No details available"}
										</Descriptions.Item>
										<Descriptions.Item label="Dental History">
											{singleCase.dental_history || "No details available"}
										</Descriptions.Item>
										<Descriptions.Item label="Notes">
											{singleCase.notes || "No notes available"}
										</Descriptions.Item>
									</Descriptions>

									<Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
										<Col xs={24} sm={24} md={12} lg={8}>
											<Card
												title="Treatments"
												bordered
												style={{
													backgroundColor: isDarkTheme ? "#002140" : "#F5F7FF",
													color: isDarkTheme ? "#e0e0e0" : "#000000",
												}}
											>
												<ul>
													{singleCase.case_treatments.length > 0 ? (
														singleCase.case_treatments.map((treatment, idx) => (
															<li key={idx}>
																<CheckCircleOutlined /> {treatment.treatment.name}
															</li>
														))
													) : (
														<li>No treatments available</li>
													)}
												</ul>
											</Card>
										</Col>

										<Col xs={24} sm={24} md={12} lg={8}>
											<Card
												title="Medications"
												bordered
												style={{
													backgroundColor: isDarkTheme ? "#002140" : "#F5F7FF",
													color: isDarkTheme ? "#e0e0e0" : "#000000",
												}}
											>
												<ul>
													{singleCase.case_medicines.length > 0 ? (
														singleCase.case_medicines.map((medicine, idx) => (
															<li key={idx}>
																<PlusCircleOutlined /> {medicine.medicine.name}
															</li>
														))
													) : (
														<li>No medications available</li>
													)}
												</ul>
											</Card>
										</Col>

										<Col xs={24} sm={24} md={12} lg={8}>
											<Card
												title="Conditions"
												bordered
												style={{
													backgroundColor: isDarkTheme ? "#002140" : "#F5F7FF",
													color: isDarkTheme ? "#e0e0e0" : "#000000",
												}}
											>
												<ul>
													{singleCase.case_conditions.length > 0 ? (
														singleCase.case_conditions.map((condition, idx) => (
															<li key={idx}>
																<InfoCircleOutlined />{" "}
																{condition.medical_condition.name}
															</li>
														))
													) : (
														<li>No conditions available</li>
													)}
												</ul>
											</Card>
										</Col>
									</Row>
								</TabPane>
								<TabPane
									tab={
										<span>
											<FolderOpenOutlined /> Documents
										</span>
									}
									key="2"
								>
									<List
										itemLayout="horizontal"
										dataSource={singleCase.case_documents}
										renderItem={item => (
											<List.Item>
												<FilePdfTwoTone style={{ marginRight: "10px", fontSize: "24px" }} />
												<List.Item.Meta
													title={
														<a
															href={item.url}
															target="_blank"
															rel="noopener noreferrer"
														>
															{item.documentName}
														</a>
													}
													description={item.type}
												/>
											</List.Item>
										)}
									/>
								</TabPane>
							</Tabs>
						</Panel>
					))}
			</Collapse>
		</div>
	);
};

export default CustomerView;
