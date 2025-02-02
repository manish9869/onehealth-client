import React, { useState, useEffect } from "react";
import axios from "./../helpers/axiosConfig";
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Tooltip,
  Button,
  Table,
  notification,
  Upload,
  Checkbox,
  Select,
  Modal,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  FundViewOutlined,
  EditOutlined,
  MailOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import API_ENDPOINTS from "./../config/apiConfig";
import MESSAGES from "./../config/messages";

const { Option } = Select;
const User = () => {
  const [rowData, setRowData] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    user_name: "",
    profile_img: "",
    password: "",
    user_email: "",
    role_id: null,
    status: null,
    twofa_auth_code: "",
    is_twofa_enabled: false,
  });
  const [fileList, setFileList] = useState([]);
  const [editedUserId, setEditedUserId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [columnSearchText, setColumnSearchText] = useState({
    user_name: "",
    user_email: "",
    role_id: "",
    status: "",
  });
  const [filteredData, setFilteredData] = useState([]);
  const [form] = Form.useForm();
  const roles = [
    { id: 1, name: "Admin" },
    { id: 2, name: "User" },
    { id: 3, name: "Guest" },
  ];

  const statuses = [
    { id: 0, name: "Inactive" },
    { id: 1, name: "Active" },
  ];
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewedRecord, setViewedRecord] = useState(null);

  const handleView = (record) => {
    setViewedRecord(record);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setFormData({
      user_name: record.user_name,
      profile_img: record.profile_img,
      password: "",
      user_email: record.user_email,
      role_id: record.role_id,
      status: record.status,
      twofa_auth_code: record.twofa_auth_code,
      is_twofa_enabled: record.is_twofa_enabled,
    });
    setIsEdit(true);
    setEditedUserId(record.user_id);

    form.setFieldsValue({
      user_name: record.user_name,
      profile_img: record.profile_img,
      user_email: record.user_email,
      role_id: record.role_id,
      status: record.status,
      twofa_auth_code: record.twofa_auth_code,
      is_twofa_enabled: record.is_twofa_enabled,
    });
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`${API_ENDPOINTS.USERS}/${userId}`);
      notification.success({ message: MESSAGES.DELETE_SUCCESS });
      fetchUsers();
    } catch (error) {
      notification.error({ message: "Failed to delete user" });
    }
  };

  const handleEmail = async (userId) => {
    try {
      await axios.post(`${API_ENDPOINTS.USERS}/${userId}/send-email`);
      notification.success({ message: MESSAGES.EMAIL_SENT });
    } catch (error) {
      notification.error({ message: "Failed to send email" });
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS);
      setRowData(response.data.data);
      setFilteredData(response.data.data);
    } catch (error) {
      notification.error({ message: "Failed to fetch user data" });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  const handleSubmit = async (values) => {
    try {
      let profileImgFileName = "";

      if (fileList.length > 0) {
        const formData = new FormData();
        formData.append("file", fileList[0]);

        const uploadResponse = await axios.post(
          `${API_ENDPOINTS.MEDIA_UPLOAD}/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (uploadResponse.data.status === "success") {
          profileImgFileName = uploadResponse.data.data[0].filename;
        } else {
          notification.error({ message: "Failed to upload image" });
          return;
        }
      }

      const submitValues = {
        ...values,
        profile_img: profileImgFileName || formData.profile_img,
      };

      const url = isEdit
        ? `${API_ENDPOINTS.USERS}/${editedUserId}`
        : `${API_ENDPOINTS.USERS}`;
      const method = isEdit ? "put" : "post";
      await axios[method](url, submitValues);

      notification.success({
        message: isEdit ? MESSAGES.UPDATE_SUCCESS : MESSAGES.ADD_SUCCESS,
      });
      setFileList([]);
      fetchUsers();
      resetForm();
    } catch (error) {
      notification.error({ message: MESSAGES.ADD_ERROR });
    }
  };

  const resetForm = () => {
    setIsEdit(false);
    setEditedUserId(null);
    setFormData({
      user_name: "",
      profile_img: "",
      password: "",
      user_email: "",
      role_id: null,
      status: null,
      twofa_auth_code: "",
      is_twofa_enabled: false,
    });
    form.resetFields();
  };

  const handleGlobalSearch = (value) => {
    setSearchText(value);
    const filtered = rowData.filter((item) => {
      return (
        item.user_name.toLowerCase().includes(value.toLowerCase()) ||
        item.user_email.toLowerCase().includes(value.toLowerCase())
      );
    });
    setFilteredData(filtered);
  };

  const handleColumnSearch = (value, dataIndex) => {
    const filtered = rowData.filter((item) =>
      item[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleColumnSearchInputChange = (e, dataIndex) => {
    const value = e.target.value;
    setColumnSearchText({ ...columnSearchText, [dataIndex]: value });
    handleColumnSearch(value, dataIndex);
  };

  const resetColumnSearch = (dataIndex) => {
    setColumnSearchText({ ...columnSearchText, [dataIndex]: "" });
    setFilteredData(rowData);
  };

  const columns = [
    {
      title: "User Name",
      dataIndex: "user_name",
      sorter: (a, b) => a.user_name.localeCompare(b.user_name),
      ellipsis: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search User Name"
            value={columnSearchText.user_name}
            onChange={(e) => handleColumnSearchInputChange(e, "user_name")}
            onPressEnter={() => {
              handleColumnSearch(columnSearchText.user_name, "user_name");
              confirm();
            }}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Button onClick={() => resetColumnSearch("user_name")}>Reset</Button>
        </div>
      ),

      filterIcon: (filtered) => <span>🔍</span>,
    },
    {
      title: "Email",
      dataIndex: "user_email",
      sorter: (a, b) => a.user_email.localeCompare(b.user_email),
      ellipsis: true,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={"Search Email"}
            value={columnSearchText.user_email}
            onChange={(e) => handleColumnSearchInputChange(e, "user_email")}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Button onClick={() => resetColumnSearch("user_email")}>Reset</Button>
        </div>
      ),

      filterIcon: (filtered) => <span>🔍</span>,
    },
    {
      title: "Role",
      dataIndex: "role_id",
      sorter: (a, b) => a.role_id - b.role_id,
      render: (roleId) =>
        roles.find((role) => role.id === roleId)?.name || "Unknown", // Display role name
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      sorter: (a, b) => a.status - b.status,
      render: (status) =>
        statuses.find((stat) => stat.id === status)?.name || "Unknown", // Display status name
      ellipsis: true,
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
              onClick={() => handleDelete(record.user_id)}
              style={{ color: "#f5222d", fontSize: "16px", cursor: "pointer" }}
            />
          </Tooltip>

          <Tooltip title="Send Email">
            <MailOutlined
              onClick={() => handleEmail(record.user_id)}
              style={{ color: "#ffcc00", fontSize: "16px", cursor: "pointer" }}
            />
          </Tooltip>
        </span>
      ),
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col lg={8} md={24} sm={24} xs={24}>
        <Card title={isEdit ? "Update User" : "Add User"}>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
              name="user_name"
              label="User Name"
              rules={[
                {
                  required: true,
                  message: "User name is required",
                },
              ]}
            >
              <Input
                placeholder="User Name"
                onInput={
                  // Allow max 50 length
                  (e) => (e.target.value = e.target.value.slice(0, 50))
                }
              />
            </Form.Item>

            <Form.Item name="profile_img" label="Profile Image">
              <Upload
                fileList={fileList}
                beforeUpload={(file) => {
                  setFileList([file]);
                  return false;
                }}
                onRemove={() => {
                  setFileList([]);
                }}
              >
                <Button icon={<UploadOutlined />}>Upload Profile Image</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: !isEdit, message: "Password is required" }]}
            >
              <Input.Password
                placeholder="Password"
                //  Allow max 50 length
                onInput={(e) => (e.target.value = e.target.value.slice(0, 50))}
              />
            </Form.Item>

            <Form.Item
              name="user_email"
              label="Email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Valid email is required",
                },
              ]}
            >
              <Input
                placeholder="Email"
                // Check email format and max 100 chars
                onInput={(e) => {
                  e.target.value = e.target.value.slice(0, 100);
                }}
              />
            </Form.Item>

            <Form.Item
              name="role_id"
              label="Role"
              rules={[{ required: true, message: "Please select a role!" }]}
            >
              <Select
                value={formData.role_id}
                onChange={(value) =>
                  setFormData({ ...formData, role_id: value })
                }
              >
                {roles.map((role) => (
                  <Option key={role.id} value={role.id}>
                    {role.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select a status!" }]}
            >
              <Select
                value={formData.status}
                onChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                {statuses.map((stat) => (
                  <Option key={stat.id} value={stat.id}>
                    {stat.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="is_twofa_enabled"
              valuePropName="checked"
              label="Two-Factor Authentication Enabled"
            >
              <Checkbox>Enable Two-Factor Authentication</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                {isEdit ? "Update User" : "Add User"}
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
        <Card title="User List">
          <Input
            placeholder="Search..."
            value={searchText}
            onChange={(e) => handleGlobalSearch(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="user_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 700 }}
          />
        </Card>
      </Col>

      <Modal
        title="User Details"
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
              <strong>User Name:</strong> {viewedRecord.user_name || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {viewedRecord.user_email || "N/A"}
            </p>
            <p>
              <strong>Role:</strong>{" "}
              {roles.find((role) => role.id === viewedRecord.role_id)?.name ||
                "N/A"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {statuses.find((status) => status.id === viewedRecord.status)
                ?.name || "N/A"}
            </p>
            <p>
              <strong>Two-Factor Authentication Enabled:</strong>{" "}
              {viewedRecord.is_twofa_enabled ? "Yes" : "No"}
            </p>
          </div>
        )}
      </Modal>
    </Row>
  );
};

export default User;
