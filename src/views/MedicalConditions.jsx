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
import axios from "./../helpers/axiosConfig";
import API_ENDPOINTS from "./../config/apiConfig";
import MESSAGES from "./../config/messages";

const { Option } = Select;

const MedicalConditions = () => {
  const [form] = Form.useForm();
  const [rowData, setRowData] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editedConditionId, setEditedConditionId] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewedRecord, setViewedRecord] = useState(null);

  const fetchConditions = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.MEDICAL_CONDITIONS);
      setRowData(response.data.data);
      setFilteredData(response.data.data);
    } catch (error) {
      notification.error({ message: MESSAGES.FETCH_ERROR });
    }
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  const handleView = (record) => {
    setViewedRecord(record);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      type: record.type,
      symptoms: record.symptoms.map((symptom) => symptom.symptom),
    });
    setIsEdit(true);
    setEditedConditionId(record.condition_id);
    setSymptoms(record.symptoms.map((symptom) => symptom.symptom));
  };

  const handleDelete = async (conditionId) => {
    try {
      await axios.delete(`${API_ENDPOINTS.MEDICAL_CONDITIONS}/${conditionId}`);
      notification.success({ message: MESSAGES.DELETE_SUCCESS });
      fetchConditions();
    } catch (error) {
      notification.error({ message: MESSAGES.DELETE_ERROR });
    }
  };

  const handleSubmit = async (values) => {
    try {
      const dataToSubmit = {
        ...values,
        symptoms: symptoms,
      };

      const url = isEdit
        ? `${API_ENDPOINTS.MEDICAL_CONDITIONS}/${editedConditionId}`
        : API_ENDPOINTS.MEDICAL_CONDITIONS;

      const method = isEdit ? "put" : "post";
      await axios[method](url, dataToSubmit);
      notification.success({
        message: isEdit ? MESSAGES.UPDATE_SUCCESS : MESSAGES.ADD_SUCCESS,
      });
      fetchConditions();
      resetForm();
    } catch (error) {
      notification.error({ message: MESSAGES.SUBMIT_ERROR });
    }
  };

  const resetForm = () => {
    setIsEdit(false);
    setEditedConditionId(null);
    form.resetFields();
    setSymptoms([]);
  };

  const handleGlobalSearch = (value) => {
    setSearchText(value);

    const filtered = rowData.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(value.toLowerCase());

      const descriptionMatch = item.description
        .toLowerCase()
        .includes(value.toLowerCase());

      const symptomsMatch = item.symptoms.some((symptom) =>
        symptom.symptom.toLowerCase().includes(value.toLowerCase())
      );

      const typeMatch = item.type.toLowerCase().includes(value.toLowerCase());

      return nameMatch || descriptionMatch || symptomsMatch || typeMatch;
    });

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
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Description"
            value={selectedKeys[0]}
            onChange={(e) => {
              setSelectedKeys(e.target.value ? [e.target.value] : []);
            }}
            onPressEnter={() => {
              confirm();
            }}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Button
            onClick={() => {
              setSelectedKeys([]);
              confirm();
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
      title: "Symptoms",
      dataIndex: "symptoms",
      render: (symptoms) =>
        symptoms.map((symptom) => symptom.symptom).join(", "),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Symptoms"
            value={selectedKeys[0]}
            onChange={(e) => {
              setSelectedKeys(e.target.value ? [e.target.value] : []);
            }}
            onPressEnter={() => {
              confirm();
            }}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Button
            onClick={() => {
              setSelectedKeys([]);
              confirm();
            }}
          >
            Reset
          </Button>
        </div>
      ),
      onFilter: (value, record) =>
        record.symptoms.some((symptom) =>
          symptom.symptom.toLowerCase().includes(value.toLowerCase())
        ),
      filterIcon: (filtered) => <span>🔍</span>,
    },
    {
      title: "Type",
      dataIndex: "type",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Type"
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
        record.type.toLowerCase().includes(value.toLowerCase()),
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
        <Card
          title={
            isEdit ? "Update Medical Condition" : "Manage Medical Condition"
          }
        >
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please enter the Name" }]}
            >
              <Input placeholder="Name" />
            </Form.Item>

            <Form.Item
              name="description" // New description field
              label="Description"
              rules={[
                { required: true, message: "Please enter the Description" },
              ]}
            >
              <Input.TextArea placeholder="Description" rows={4} />
            </Form.Item>

            <Form.Item
              name="symptoms"
              label="Symptoms"
              rules={[{ required: true, message: "Please enter the Symptoms" }]}
            >
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Enter symptoms"
                onChange={(value) => setSymptoms(value)}
                value={symptoms}
              >
                {symptoms.map((symptom) => (
                  <Option key={symptom}>{symptom}</Option>
                ))}
              </Select>
            </Form.Item>

            {/* Type */}
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: "Please enter the Type" }]}
            >
              <Input placeholder="Type" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                {isEdit ? "Update Condition" : "Add Condition"}
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
        <Card title="Medical Conditions List">
          <Input
            placeholder="Global Search"
            value={searchText}
            onChange={(e) => handleGlobalSearch(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="condition_id"
            pagination={{ pageSize: 5 }}
            scroll={{ x: 600 }}
          />
        </Card>
      </Col>

      <Modal
        title="Medical Condition Details"
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
            <p>
              <strong>Symptoms:</strong>{" "}
              {viewedRecord.symptoms
                ?.map((symptom) => symptom.symptom)
                .join(", ")}
            </p>
            <p>
              <strong>Type:</strong> {viewedRecord.type}
            </p>
          </div>
        )}
      </Modal>
    </Row>
  );
};

export default MedicalConditions;
