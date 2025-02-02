import React, { useEffect, useState } from 'react';
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  notification,
  Row,
  Col,
  Card,
  Tooltip,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import axios from '../helpers/axiosConfig';
import API_ENDPOINTS from '../config/apiConfig';
import moment from 'moment';

const { Option } = Select;

const ExpensesTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      console.log('Fetching expenses from:', API_ENDPOINTS.EXPENSES);
      const response = await axios.get(API_ENDPOINTS.EXPENSES);
      console.log('Fetched expenses:', response.data);
      const expensesData = Array.isArray(response.data.data) ? response.data.data : [];
      setExpenses(expensesData);
      setFilteredExpenses(expensesData);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      notification.error({
        message: 'Fetch Error',
        description: 'Failed to fetch expenses.',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = expenses.filter((item) => {
      return Object.keys(item).some((key) =>
        item[key] && item[key].toString().toLowerCase().includes(value.toLowerCase())
      );
    });
    setFilteredExpenses(filtered);
  };

  const handleAddOrUpdate = async (values) => {
    try {
      const payload = {
        ...values,
        expense_date: values.expense_date.format('YYYY-MM-DD'),
        amount: parseFloat(values.amount),
      };

      console.log('Payload to send:', payload);

      const apiCall = selectedExpense
        ? axios.put(`${API_ENDPOINTS.EXPENSES}/${selectedExpense.expense_id}`, payload)
        : axios.post(API_ENDPOINTS.EXPENSES, payload);

      console.log('API Call Method:', selectedExpense ? 'PUT' : 'POST');
      console.log('API Endpoint:', selectedExpense
        ? `${API_ENDPOINTS.EXPENSES}/${selectedExpense.expense_id}`
        : API_ENDPOINTS.EXPENSES);

      const response = await apiCall;
      console.log('API Response:', response);

      notification.success({
        message: selectedExpense ? 'Expense Updated' : 'Expense Added',
        description: `The expense was successfully ${selectedExpense ? 'updated' : 'added'}.`,
        placement: 'topRight',
      });
      fetchExpenses();
      form.resetFields();
      setModalVisible(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error('Error saving expense:', error);
      if (error.response) {
        console.error('Server Response:', error.response.data);
      }
      notification.error({
        message: 'Save Error',
        description: 'Failed to save expense.',
        placement: 'topRight',
      });
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this expense?',
      onOk: async () => {
        try {
          console.log('Deleting expense with ID:', id);
          const response = await axios.delete(`${API_ENDPOINTS.EXPENSES}/${id}`);
          console.log('Delete response:', response);
          notification.success({
            message: 'Expense Deleted',
            description: 'The expense was successfully deleted.',
            placement: 'topRight',
          });
          fetchExpenses();
          form.resetFields();
        } catch (error) {
          console.error('Error deleting expense:', error);
          notification.error({
            message: 'Delete Error',
            description: 'Failed to delete expense.',
            placement: 'topRight',
          });
        }
      },
    });
  };

  const disabledFutureDates = (current) => {
    return current && current > moment().endOf('day');
  };

  const columns = [
    {
      title: 'Category',
      dataIndex: 'category',
      sorter: (a, b) => a.category.localeCompare(b.category),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Category"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Button onClick={confirm} size="small" style={{ width: '100%' }}>
            Search
          </Button>
        </div>
      ),
      onFilter: (value, record) => record.category.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (amount) => `$${parseFloat(amount).toFixed(2)}`,
      sorter: (a, b) => parseFloat(a.amount) - parseFloat(b.amount),
    },
    {
      title: 'Date',
      dataIndex: 'expense_date',
      render: (date) => moment(date).format('YYYY-MM-DD'),
      sorter: (a, b) => new Date(a.expense_date) - new Date(b.expense_date),
    },
    {
      title: 'Actions',
      render: (text, record) => (
        <span style={{ display: 'flex', gap: '8px' }}>
          <Tooltip title="View">
            <EyeOutlined
              onClick={() => {
                setSelectedExpense(record);
                setModalVisible(true);
              }}
              style={{ color: '#52c41a', fontSize: '16px', cursor: 'pointer' }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <EditOutlined
              onClick={() => {
                setSelectedExpense(record);
                form.setFieldsValue({
                  ...record,
                  expense_date: moment(record.expense_date),
                });
              }}
              style={{ color: '#1890ff', fontSize: '16px', cursor: 'pointer' }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteOutlined
              onClick={() => handleDelete(record.expense_id)}
              style={{ color: '#f5222d', fontSize: '16px', cursor: 'pointer' }}
            />
          </Tooltip>
        </span>
      ),
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={8}>
        <Card title={selectedExpense ? 'Edit Expense' : 'Add Expense'}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddOrUpdate}
          >
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select a category.' }]}
            >
              <Select placeholder="Select category">
                <Option value="Food">Food</Option>
                <Option value="Travel">Travel</Option>
                <Option value="Utilities">Utilities</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true, message: 'Please enter a valid amount.' }]}
            >
              <Input type="number" step="0.01" placeholder="Enter amount" />
            </Form.Item>
            <Form.Item
              name="expense_date"
              label="Date"
              rules={[{ required: true, message: 'Please select a date.' }]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                disabledDate={disabledFutureDates}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ max: 200, message: 'Description cannot exceed 200 characters.' }]}
            >
              <Input.TextArea rows={3} placeholder="Enter description (optional)" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {selectedExpense ? 'Update Expense' : 'Add Expense'}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => {
                  setSelectedExpense(null);
                  form.resetFields();
                }}
                type="default"
              >
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col xs={24} lg={16}>
        <Card title="Expenses Tracker">
          <Input
            placeholder="Search Expenses"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ marginBottom: 16 }}
          />
          <Table
            columns={columns}
            dataSource={filteredExpenses}
            rowKey={(record) => record.expense_id || Math.random()}
            pagination={{ pageSize: 5 }}
            loading={loading}
          />
        </Card>
      </Col>

      <Modal
        title="Expense Details"
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
      >
        {selectedExpense && (
          <div>
            <p><strong>Category:</strong> {selectedExpense.category}</p>
            <p><strong>Amount:</strong> ${parseFloat(selectedExpense.amount).toFixed(2)}</p>
            <p><strong>Date:</strong> {moment(selectedExpense.expense_date).format('YYYY-MM-DD')}</p>
            <p><strong>Description:</strong> {selectedExpense.description || 'N/A'}</p>
          </div>
        )}
      </Modal>
    </Row>
  );
};

export default ExpensesTracker;
