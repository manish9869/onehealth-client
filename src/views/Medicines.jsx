import { useState, useEffect } from "react";
import axios from "./../helpers/axiosConfig";
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Table,
  notification,
  Tooltip,
  Modal,
} from "antd";

import {
  EyeOutlined,
  DeleteOutlined,
  FundViewOutlined,
  EditOutlined,
} from "@ant-design/icons";
import API_ENDPOINTS from "../config/apiConfig";
import MESSAGES from "../config/messages";

const Medicines = () => {
  const [rowData, setRowData] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editedMedicineId, setEditedMedicineId] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewedRecord, setViewedRecord] = useState(null);

  const fetchMedicines = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.MEDICINES);
      setRowData(response.data.data);
      setFilteredData(response.data.data);
    } catch (error) {
      notification.error({ message: MESSAGES.FETCH_ERROR });
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleView = (record) => {
    setViewedRecord(record);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      name: record.name,
      description: record.description,
    });
    setIsEdit(true);
    setEditedMedicineId(record.medicine_id);
  };

  const handleDelete = async (medicineId) => {
    try {
      await axios.delete(`${API_ENDPOINTS.MEDICINES}/${medicineId}`);
      notification.success({ message: MESSAGES.DELETE_SUCCESS });
      fetchMedicines();
    } catch (error) {
      notification.error({ message: MESSAGES.DELETE_ERROR });
    }
  };

  const handleSubmit = async (values) => {
    try {
      const userId = 24;
      const data = {
        ...values,
        created_user_id: userId,
        updated_user_id: userId,
      };
      const url = isEdit
        ? `${API_ENDPOINTS.MEDICINES}/${editedMedicineId}`
        : API_ENDPOINTS.MEDICINES;
      const method = isEdit ? "put" : "post";
      const option = isEdit ? values : data;

      await axios({
        method: method,
        url: url,
        data: option,
      });

      notification.success({
        message: isEdit ? MESSAGES.UPDATE_SUCCESS : MESSAGES.ADD_SUCCESS,
      });
      fetchMedicines();
      resetForm();
    } catch (error) {
      console.error(
        "Error details:",
        error.response ? error.response.data : error.message
      );
      notification.error({ message: "Failed to submit medicine data" });
    }
  };

  const resetForm = () => {
    setIsEdit(false);
    setEditedMedicineId(null);
    form.resetFields();
  };

  const handleGlobalSearch = (value) => {
    setSearchText(value);
    const filtered = rowData.filter(
      (item) =>
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.description.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
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
            onChange={(e) => {
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
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
      filterIcon: (filtered) => <span>🔍</span>,
    },
    {
      title: "Description",
      dataIndex: "description",
      sorter: (a, b) => a.description.localeCompare(b.description),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Description"
            value={selectedKeys[0]}
            onChange={(e) => {
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
      onFilter: (value, record) =>
        record.description.toLowerCase().includes(value.toLowerCase()),
      filterIcon: (filtered) => <span>🔍</span>,
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
              onClick={() => handleDelete(record.medicine_id)}
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
        <Card title={isEdit ? "Update Medicine" : "Add Medicine"}>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please enter the name" }]}
            >
              <Input placeholder="Name" maxLength={191} />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please enter a description" },
              ]}
            >
              <Input.TextArea
                placeholder="Description"
                rows={4}
                maxLength={191}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {isEdit ? "Update Medicine" : "Add Medicine"}
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
        <Card title="Medicine List">
          <Input
            placeholder="Search by Name or Description"
            value={searchText}
            onChange={(e) => handleGlobalSearch(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="medicine_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 600 }}
          />
        </Card>
      </Col>

      <Modal
        title="Medicine Details"
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
              <strong>Description:</strong> {viewedRecord.description}
            </p>
          </div>
        )}
      </Modal>
    </Row>
  );
};

export default Medicines;
