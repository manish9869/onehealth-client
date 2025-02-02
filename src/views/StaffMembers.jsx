import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Table,
  Card,
  Row,
  Col,
  Tooltip,
  notification,
  Modal,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "./../helpers/axiosConfig";
import API_ENDPOINTS from "../config/apiConfig";
import MESSAGES from "../config/messages";
import moment from "moment";

const StaffMembers = () => {
  const [staff, setStaff] = useState([]);
  const [form] = Form.useForm();
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [viewedRecord, setViewedRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.STAFF_MEMBERS);
      const staffData = Array.isArray(response.data.data) ? response.data.data : [];
      setStaff(staffData);
      setFilteredData(staffData);
    } catch (error) {
      console.error("Error fetching staff members:", error);
      notification.error({ message: MESSAGES.FETCH_ERROR });
    }
  };

  const handleView = (record) => {
    setViewedRecord(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this staff member?",
      onOk: async () => {
        try {
          await axios.delete(`${API_ENDPOINTS.STAFF_MEMBERS}/${id}`);
          notification.success({ message: MESSAGES.DELETE_SUCCESS });
          fetchStaff();
          form.resetFields(); 
          setEditingStaff(null);
        } catch (error) {
          console.error("Error deleting staff member:", error);
          notification.error({ message: MESSAGES.DELETE_ERROR });
        }
      },
    });
  };

  const handleEdit = (record) => {
    setEditingStaff(record);
    form.setFieldsValue({ ...record, DOB: record.DOB ? moment.utc(record.DOB) : null });
  };

  const handleAdd = () => {
    setEditingStaff(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        DOB: values.DOB ? values.DOB.utc().format("YYYY-MM-DD") : null,
      };
      if (editingStaff) {
        await axios.put(`${API_ENDPOINTS.STAFF_MEMBERS}/${editingStaff.staff_member_id}`, payload);
        notification.success({ message: MESSAGES.UPDATE_SUCCESS });
      } else {
        await axios.post(API_ENDPOINTS.STAFF_MEMBERS, payload);
        notification.success({ message: MESSAGES.ADD_SUCCESS });
      }
      fetchStaff();
      form.resetFields(); 
      setEditingStaff(null);
    } catch (error) {
      console.error("Error saving staff member:", error);
      notification.error({ message: MESSAGES.ADD_ERROR });
    }
  };

  const handleGlobalSearch = (value) => {
    setSearchText(value);
    const filtered = staff.filter((item) => {
      return Object.keys(item).some((key) =>
        item[key] && item[key].toString().toLowerCase().includes(value.toLowerCase())
      );
    });
    setFilteredData(filtered);
  };

  const handleNumberInput = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    e.target.value = value.slice(0, 10);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "fullname",
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Search Name`}
            value={selectedKeys[0]}
            
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Button
            onClick={() => confirm()}
            size="small"
            style={{ width: "100%" }}
          >
            Search
          </Button>
        </div>
      ),
      onFilter: (value, record) =>
        record.fullname.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Position",
      dataIndex: "position",
      sorter: (a, b) => a.position.localeCompare(b.position),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Search Position`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Button
            
            onClick={() => confirm()}
            size="small"
            style={{ width: "100%" }}
          >
            Search
          </Button>
        </div>
      ),
      onFilter: (value, record) =>
        record.position.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Fee",
      dataIndex: "consultation_fee",
      sorter: (a, b) => a.consultation_fee - b.consultation_fee,
      render: (fee) => `$${fee}`,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Search Fee`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Button
            
            onClick={() => confirm()}
            size="small"
            style={{ width: "100%" }}
          >
            Search
          </Button>
        </div>
      ),
      onFilter: (value, record) =>
        record.consultation_fee.toString().includes(value),
    },
    {
      title: "Actions",
      key: "actions",
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
              onClick={() => handleDelete(record.staff_member_id)}
              style={{ color: "#f5222d", fontSize: "16px", cursor: "pointer" }}
            />
          </Tooltip>
        </span>
      ),
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={8}>
        <Card title={editingStaff ? "Edit Staff Member" : "Add Staff Member"}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="fullname"
              label="Full Name"
              rules={[{ required: true, message: "Please enter the full name" }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>
            <Form.Item
              name="position"
              label="Position"
              rules={[{ required: true, message: "Please enter the position" }]}
            >
              <Input placeholder="Enter position" />
            </Form.Item>
            <Form.Item
              name="qualification"
              label="Qualification"
              rules={[{ required: true, message: "Please enter the qualification" }]}
            >
              <Input placeholder="Enter qualification" />
            </Form.Item>
            <Form.Item
              name="specialization"
              label="Specialization"
              rules={[{ required: true, message: "Please enter the specialization" }]}
            >
              <Input placeholder="Enter specialization" />
            </Form.Item>
            <Form.Item
              name="consultation_fee"
              label="Consultation Fee"
              rules={[{ required: true, message: "Please enter the consultation fee" }]}
            >
              <Input placeholder="Enter consultation fee" type="number" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>
            <Form.Item
              name="mobile"
              label="Mobile"
              rules={[
                { required: true, message: "Please enter the mobile number" },
                { max: 10, message: "Mobile number cannot exceed 10 digits" },
              ]}
            >
              <Input placeholder="Enter mobile number" onInput={handleNumberInput} />
            </Form.Item>
            <Form.Item
              name="alt_mobile"
              label="Alt Mobile"
              rules={[{ max: 10, message: "Alternate mobile number cannot exceed 10 digits" }]}
            >
              <Input placeholder="Enter alternate mobile number" onInput={handleNumberInput} />
            </Form.Item>
            <Form.Item
              name="DOB"
              label="Date of Birth"
            >
              <DatePicker
                placeholder="Select Date of Birth (Optional)"
                format="YYYY-MM-DD"
                allowClear
                inputReadOnly
                disabledDate={(current) => current && current > moment().endOf('day')}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editingStaff ? "Update Staff Member" : "Add Staff"}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={handleAdd}
                type="default"
              >
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col xs={24} lg={16}>
        <Card title="Staff Members">
          <Input
            placeholder="Search Staff Members"
            value={searchText}
            onChange={(e) => handleGlobalSearch(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ marginBottom: 16 }}
          />
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey={(record) => record.staff_member_id || Math.random()}
            pagination={{ pageSize: 5 }}
          />
        </Card>
      </Col>

      <Modal
        title="Staff Member Details"
        visible={isModalVisible}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
      >
        {viewedRecord && (
          <div>
            <p><strong>Full Name:</strong> {viewedRecord.fullname}</p>
            <p><strong>Position:</strong> {viewedRecord.position}</p>
            <p><strong>Qualification:</strong> {viewedRecord.qualification}</p>
            <p><strong>Specialization:</strong> {viewedRecord.specialization}</p>
            <p><strong>Consultation Fee:</strong> ${viewedRecord.consultation_fee}</p>
            <p><strong>Email:</strong> {viewedRecord.email}</p>
            <p><strong>Mobile:</strong> {viewedRecord.mobile}</p>
            <p><strong>Alt Mobile:</strong> {viewedRecord.alt_mobile}</p>
            <p><strong>Date of Birth:</strong> {viewedRecord.DOB ? moment(viewedRecord.DOB).format('YYYY-MM-DD') : "N/A"}</p>
          </div>
        )}
      </Modal>
    </Row>
  );
};

export default StaffMembers;
