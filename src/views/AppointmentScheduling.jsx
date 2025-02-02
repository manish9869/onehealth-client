import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Table,
  Tooltip,
  notification,
  DatePicker,
  Modal,
} from "antd";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import API_ENDPOINTS from "./../config/apiConfig";
import MESSAGES from "./../config/messages";
import moment from "moment";
import axios from "./../helpers/axiosConfig";
import {
  EyeOutlined,
  DeleteOutlined,
  FundViewOutlined,
  EditOutlined,
  MailOutlined,
} from "@ant-design/icons";
dayjs.extend(customParseFormat);
dayjs.extend(utc);
const { Option } = Select;

const AppointmentScheduling = () => {
  const [form] = Form.useForm();
  const [appointments, setAppointments] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editedAppointmentId, setEditedAppointmentId] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [staffMembers, setStaffMembers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewedRecord, setViewedRecord] = useState(null);

  const fetchDataWithRetry = async (url, retries = 3) => {
    try {
      const response = await axios.get(url);
      return response.data.data;
    } catch (error) {
      if (error.response && error.response.status === 429 && retries > 0) {
        const waitTime = Math.pow(2, 3 - retries) * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return fetchDataWithRetry(url, retries - 1);
      } else {
        throw error;
      }
    }
  };

  const fetchAppointments = async () => {
    try {
      const data = await fetchDataWithRetry(API_ENDPOINTS.APPOINTMENTS);
      setAppointments(data);
      setFilteredData(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      notification.error({ message: MESSAGES.FETCH_ERROR });
    }
  };

  // Fetch Customers and Staff Members from DB
  const fetchDropdownData = async () => {
    try {
      const customersData = await fetchDataWithRetry(API_ENDPOINTS.CUSTOMERS);
      const staffData = await fetchDataWithRetry(API_ENDPOINTS.STAFF_MEMBERS);
      setCustomers(customersData || []);
      setStaffMembers(staffData || []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      notification.error({ message: MESSAGES.FETCH_ERROR });
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (!customers.length) {
      setCustomers([{ customer_id: "1", fullname: "Mock Customer" }]);
    }
    if (!staffMembers.length) {
      setStaffMembers([{ staff_member_id: "1", fullname: "Mock Staff" }]);
    }
  }, [customers, staffMembers]);

  const handleView = (record) => {
    setViewedRecord(record);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    const displayDate = dayjs(record.appointment_date)
      .local()
      .format("YYYY-MM-DD HH:mm");

    form.setFieldsValue({
      customer_id: record.customer.customer_id,
      staff_member_id: record.staff_member.staff_member_id,
      appointment_date: dayjs(displayDate, "YYYY-MM-DD HH:mm"),
      duration: record.duration,
      reason: record.reason,
      status: record.status,
    });

    form.validateFields(["appointment_date"]);

    setIsEdit(true);
    setEditedAppointmentId(record.appointment_id);
  };

  const handleDelete = async (appointmentId) => {
    try {
      await axios.delete(`${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}`);
      notification.success({ message: MESSAGES.DELETE_SUCCESS });
      fetchAppointments();
    } catch (error) {
      notification.error({ message: MESSAGES.DELETE_ERROR });
    }
  };

  const handleSubmit = async (values) => {
    try {
      const dataToSubmit = {
        ...values,
        appointment_date: values.appointment_date.toISOString(),
      };

      const url = isEdit
        ? `${API_ENDPOINTS.APPOINTMENTS}/${editedAppointmentId}`
        : API_ENDPOINTS.APPOINTMENTS;

      const method = isEdit ? "put" : "post";
      await axios[method](url, dataToSubmit);
      notification.success({
        message: isEdit ? MESSAGES.UPDATE_SUCCESS : MESSAGES.ADD_SUCCESS,
      });
      fetchAppointments();
      resetForm();
    } catch (error) {
      console.log(error);
      notification.error({ message: error.response.data.errors.message });
    }
  };

  const resetForm = () => {
    setIsEdit(false);
    setEditedAppointmentId(null);
    form.resetFields();
  };

  const handleGlobalSearch = (value) => {
    setSearchText(value);
    const filtered = appointments.filter((item) => {
      const customerName = item.customer.fullname.toLowerCase();
      const staffName = item.staff_member.fullname.toLowerCase();
      const appointmentDate = moment(item.appointment_date).format(
        "YYYY-MM-DD hh:mm A"
      );
      const duration = item.duration.toString();
      const status = item.status.toLowerCase();

      return (
        customerName.includes(value.toLowerCase()) ||
        staffName.includes(value.toLowerCase()) ||
        appointmentDate.includes(value) ||
        duration.includes(value) ||
        status.includes(value.toLowerCase())
      );
    });
    setFilteredData(filtered);
  };
  const columns = [
    {
      title: "Customer",
      dataIndex: ["customer", "fullname"],
      render: (text) => text || "N/A",
      filters: customers.map((customer) => ({
        text: customer.fullname,
        value: customer.customer_id,
      })),
      onFilter: (value, record) => record.customer.customer_id === value,
      filterIcon: (filtered) => <span>🔍</span>,
      filterMultiple: false,
    },
    {
      title: "Staff Member",
      dataIndex: ["staff_member", "fullname"],
      render: (text) => text || "N/A",
      filters: staffMembers.map((staff) => ({
        text: staff.fullname,
        value: staff.staff_member_id,
      })),
      onFilter: (value, record) =>
        record.staff_member.staff_member_id === value,
      filterIcon: (filtered) => <span>🔍</span>,
      filterMultiple: false,
    },
    {
      title: "Date",
      dataIndex: "appointment_date",
      render: (date) =>
        date ? moment(date).format("YYYY-MM-DD hh:mm A") : "N/A",
      filterIcon: (filtered) => <span>🔍</span>,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      width: 30,
      filters: [
        { text: "Less than 30 mins", value: "30" },
        { text: "30 - 60 mins", value: "60" },
        { text: "More than 60 mins", value: "61" },
      ],
      onFilter: (value, record) => {
        const duration = parseInt(record.duration, 10);
        if (value === "30") return duration < 30;
        if (value === "60") return duration >= 30 && duration <= 60;
        if (value === "61") return duration > 60;
        return false;
      },
      filterIcon: (filtered) => <span>🔍</span>,
      filterMultiple: false,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 70,
      filters: [
        { text: "Scheduled", value: "scheduled" },
        { text: "Completed", value: "completed" },
        { text: "Canceled", value: "canceled" },
      ],
      onFilter: (value, record) => record.status === value,
      filterIcon: (filtered) => <span>🔍</span>,
      filterMultiple: false,
    },
    {
      title: "Actions",
      render: (text, record) => (
        // <span>
        // 	<Tooltip title="Edit">
        // 		<EditOutlined
        // 			onClick={() => handleEdit(record)}
        // 			style={{
        // 				color: "#52c41a",
        // 				fontSize: "16px",
        // 				cursor: "pointer",
        // 				marginRight: "8px",
        // 			}}
        // 		/>
        // 	</Tooltip>
        // 	<Tooltip title="Delete">
        // 		<DeleteOutlined
        // 			onClick={() => handleDelete(record.appointment_id)}
        // 			style={{
        // 				color: "#f5222d",
        // 				fontSize: "16px",
        // 				cursor: "pointer",
        // 				marginRight: "8px",
        // 			}}
        // 		/>
        // 	</Tooltip>
        // </span>

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
              onClick={() => handleDelete(record.condition_id)}
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
        <Card title={isEdit ? "Update Appointment" : "Add Appointment"}>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
              name="customer_id"
              label="Customer"
              rules={[{ required: true, message: "Select a customer" }]}
            >
              <Select
                placeholder="Select customer"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {customers.map((customer) => (
                  <Option
                    key={customer.customer_id}
                    value={customer.customer_id}
                  >
                    {customer.fullname}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="staff_member_id"
              label="Staff Member"
              rules={[{ required: true, message: "Select a staff member" }]}
            >
              <Select
                placeholder="Select staff member"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {staffMembers.map((staff) => (
                  <Option
                    key={staff.staff_member_id}
                    value={staff.staff_member_id}
                  >
                    {staff.fullname}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="appointment_date"
              label="Appointment Date and Time"
              rules={[
                { required: true, message: "Select appointment date and time" },
              ]}
            >
              <DatePicker
                showTime={{ format: "hh:mm A", use12Hours: true }}
                format="YYYY-MM-DD hh:mm A"
                style={{ width: "100%" }}
              />
            </Form.Item>

            {/* <Form.Item
              name="duration"
              label="Duration (minutes)"
              rules={[{ required: true, message: "Enter the duration" }]}
            >
              <Input type="number" placeholder="Duration in minutes" />
            </Form.Item> */}

            <Form.Item
              name="duration"
              label="Duration (minutes)"
              rules={[
                { required: true, message: "Enter the duration" },
                {
                  type: "number",
                  min: 1,
                  message: "Duration must be at least 1 minute",
                },
              ]}
            >
              <Input
                type="number"
                placeholder="Duration in minutes"
                onChange={(e) =>
                  form.setFieldsValue({
                    duration: parseInt(e.target.value, 10),
                  })
                }
              />
            </Form.Item>

            <Form.Item
              name="reason"
              label="Reason"
              rules={[{ required: true, message: "Provide a reason" }]}
            >
              <Input placeholder="Reason for appointment" />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Select status" }]}
            >
              <Select placeholder="Select status">
                <Option value="scheduled">Scheduled</Option>
                <Option value="completed">Completed</Option>
                <Option value="canceled">Canceled</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                {isEdit ? "Update Appointment" : "Add Appointment"}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={resetForm}
                type="primary"
                danger
              >
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>

      <Col lg={16} md={24} sm={24} xs={24}>
        <Card title="Appointment List">
          <Input
            placeholder="Global Search"
            value={searchText}
            onChange={(e) => handleGlobalSearch(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="appointment_id"
            pagination={{ pageSize: 5 }}
            scroll={{ x: 700 }}
          />
        </Card>
      </Col>

      <Modal
        title="Appointment Details"
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
              <strong>Customer:</strong>{" "}
              {viewedRecord.customer?.fullname || "N/A"}
            </p>
            <p>
              <strong>Staff Member:</strong>{" "}
              {viewedRecord.staff_member?.fullname || "N/A"}
            </p>
            <p>
              <strong>Appointment Date and Time:</strong>{" "}
              {viewedRecord.appointment_date
                ? moment(viewedRecord.appointment_date).format(
                    "YYYY-MM-DD hh:mm A"
                  )
                : "N/A"}
            </p>
            <p>
              <strong>Duration (minutes):</strong>{" "}
              {viewedRecord.duration || "N/A"}
            </p>
            <p>
              <strong>Reason:</strong> {viewedRecord.reason || "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {viewedRecord.status || "N/A"}
            </p>
          </div>
        )}
      </Modal>
    </Row>
  );
};

export default AppointmentScheduling;
