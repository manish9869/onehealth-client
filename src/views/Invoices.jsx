import React, { useState, useEffect } from "react";
import {
  Select,
  DatePicker,
  Button,
  Form,
  Card,
  Table,
  Badge,
  Typography,
  Space,
  Tooltip,
  Row,
  Col,
  Input,
  notification,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  FundViewOutlined,
  EditOutlined,
  DownloadOutlined,
  MailOutlined,
} from "@ant-design/icons";
import moment from "moment";
import axios from "./../helpers/axiosConfig";
import API_ENDPOINTS from "./../config/apiConfig"; // Adjust the path to your API_ENDPOINTS
import "./../assets/css/invoice.css";
import MESSAGES from "./../config/messages";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
const { Title } = Typography;
const { Option } = Select;
const Invoices = () => {
  const [form] = Form.useForm(); // Using Form API for better control
  const [customerList, setCustomerList] = useState([]);
  const [invoiceList, setInvoiceList] = useState([]);
  const [caseHistoryList, setCaseHistoryList] = useState([]);
  const [treatmentData, setTreatmentData] = useState([]);
  const [conditionData, setConditionData] = useState([]); // For medical conditions
  const [medicineData, setMedicineData] = useState([]); // For medicines
  const [pastPaymentsCustomer, setPastPaymentsCustomer] = useState([]);
  const [invoiceSubTotal, setInvoiceSubTotal] = useState(0);
  const [invoiceDiscount, setInvoiceDiscount] = useState(0);
  const [discountTotal, setDiscountTotal] = useState(0);
  const [calculatedTax, setCalculatedTax] = useState(0);
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [pendingTotalAmount, setPendingTotalAmount] = useState(0);
  const [invoiceStatus, setInvoiceStatus] = useState("");
  const [editedInvoiceId, setEditedInvoiceId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [currentTotalAmount, setCurrentTotalAmount] = useState(0);
  const [isPaid, setIsPaid] = useState(0);
  // Load customers from API
  const loadPaidInvoiceList = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.INVOICE);

      setInvoiceList(response.data.data);
    } catch (error) {
      notification.error({ message: "Error loading customer list." });
    }
  };

  // Load customers from API
  const loadCustomerList = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CUSTOMERS);

      setCustomerList(response.data.data);
    } catch (error) {
      notification.error({ message: "Error loading customer list." });
    }
  };

  // Load case histories based on selected customer
  const loadCaseHistoryList = async (customerId) => {
    try {
      //setCustomerId(customerId);
      const response = await axios.get(
        `${API_ENDPOINTS.CASE_HISTORY}/customer/${customerId}`
      );
      const formattedData = response.data.data.map((caseHistory) => ({
        value: caseHistory.id,
        label: caseHistory.case_date,
      }));
      setCaseHistoryList(formattedData);
    } catch (error) {
      console.log("error", error);
      notification.error({ message: "Error loading case history list." });
    }
  };

  const loadPaymentHistoryCustomerList = async (caseId) => {
    try {
      //setCustomerId(customerId);
      const response = await axios.get(
        `${API_ENDPOINTS.INVOICE}/past-payments/${caseId}`
      );

      setPastPaymentsCustomer(response.data.data);

      const totalPaid = response.data.data.reduce((total, payment) => {
        return total + Number(payment.amountPaid);
      }, 0);

      const discountValue = response.data.data.some(
        (payment) => payment.discount
      )
        ? response.data.data[0].discount // Assuming discount is present in the first payment
        : 0;

      setInvoiceDiscount(discountValue);

      // Update the paidAmount state
      setPaidAmount(totalPaid);
    } catch (error) {
      console.log("error", error);
      notification.error({ message: "Error loading case history list." });
    }
  };

  // Load treatment data and medical conditions based on selected case history
  const loadTreatmentData = async (caseHistoryId) => {
    try {
      setIsPaid(0);
      const response = await axios.get(
        `${API_ENDPOINTS.CASE_HISTORY}/${caseHistoryId}`
      );

      const conditionData = response.data.data.case_conditions.map((item) => ({
        id: item.medical_condition.condition_id,
        name: item.medical_condition.name,
      }));

      const treatmentData = response.data.data.case_treatments.map((item) => ({
        id: item.treatment.treatment_id,
        name: item.treatment.name,
        cost: item.treatment.cost,
      }));

      const medicineData = response.data.data.case_medicines.map((item) => ({
        id: item.medicine.medicine_id,
        name: item.medicine.name,
      }));

      setTreatmentData(treatmentData || []);
      setConditionData(conditionData || []); // Assuming conditions come from the same API
      setMedicineData(medicineData || []); // Assuming medicines come from the same API
    } catch (error) {
      notification.error({ message: "Error loading treatment data." });
    }
  };

  const calculateInvoice = () => {
    let subTotal = 0.0;
    let discountTotal = 0.0;
    let invoiceTotal = 0.0;
    let calculatedTax = 0.0;

    treatmentData.forEach((treatment) => {
      const cost = parseFloat(treatment.cost); // Convert to number if it's a string
      if (!isNaN(cost)) {
        // Only add valid numbers
        subTotal += cost;
      }
    });

    const discountPercentage =
      invoiceDiscount > 0
        ? invoiceDiscount
        : form.getFieldValue("discount") || 0;

    if (discountPercentage > 0) {
      discountTotal = (subTotal * discountPercentage) / 100;
    }
    invoiceTotal = subTotal - discountTotal;

    const taxRate = 13.0;
    calculatedTax = (invoiceTotal * taxRate) / 100;
    invoiceTotal += calculatedTax;
    const currentBalanceAmount = invoiceTotal - paidAmount;
    const finalBalanceAmount = invoiceTotal - paidAmount - totalPaidAmount;

    // Update states`
    setInvoiceSubTotal(subTotal);
    setDiscountTotal(discountTotal);
    setCalculatedTax(calculatedTax);
    setInvoiceTotal(invoiceTotal);
    setCurrentTotalAmount(currentBalanceAmount);
    setPendingTotalAmount(finalBalanceAmount);
  };

  useEffect(() => {
    loadCustomerList();
    loadPaidInvoiceList();
  }, []);

  useEffect(() => {
    calculateInvoice();
  }, [treatmentData, totalPaidAmount, form]);

  const handleCustomerChange = (value) => {
    form.setFieldsValue({ caseHistoryId: undefined }); // Reset case history on customer change
    loadCaseHistoryList(value);
  };

  const handleCaseChange = (value) => {
    form.setFieldsValue({ treatmentData: [] }); // Reset treatments on case change
    loadTreatmentData(value);
    loadPaymentHistoryCustomerList(value);
  };

  const handleEdit = (record) => {
    setIsEdit(true);
    setEditedInvoiceId(record.invoice_id); // Assuming record has an invoice_id

    // Set form fields with the values from the record
    form.setFieldsValue({
      customer_id: record.customer_id,
      caseHistoryId: record.case_id,
      paymentMode: record.paymentMode,
      discount: record.discount,
      amountPaid: record.amountPaid,
      issueDate: dayjs(record.issueDate, "YYYY-MM-DD"),
      dueDate: dayjs(record.dueDate, "YYYY-MM-DD"),
      status: record.status,
    });
    setPendingTotalAmount(record.pendingAmount);
    setDiscountTotal(record.totalDiscountAmount);
    setCalculatedTax(record.totaltaxAmount);
    setInvoiceTotal(record.totalAmount);
    setPaidAmount(record.amountPaid);
    // Optionally load case history and treatment data based on the selected customer and case
    loadCaseHistoryList(record.customer_id);
    loadTreatmentData(record.case_id);
  };

  const handleDownload = async (invoiceId) => {
    try {
      // Make the GET request to the download API
      const response = await axios.get(
        `${API_ENDPOINTS.INVOICE}/download/${invoiceId}`,
        { responseType: "blob" } // Set responseType to 'blob' for binary data
      );

      // Create a link element to trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${invoiceId}.pdf`); // Change the filename as needed
      document.body.appendChild(link);
      link.click();

      // Cleanup the URL object and remove the link
      URL.revokeObjectURL(url);
      link.remove();

      notification.success({ message: MESSAGES.DOWNLOAD_INVOICE });
    } catch (error) {
      console.error("Error downloading invoice:", error); // Log the error for debugging
      notification.error({ message: "Error downloading invoice." });
    }
  };
  const handleSendEmail = async (invoiceId) => {
    const response = await axios.get(
      `${API_ENDPOINTS.INVOICE}/send-email/${invoiceId}`
    );

    notification.success({ message: response.data.message });
  };

  const handleDelete = async (invoiceId) => {
    try {
      await axios.delete(`${API_ENDPOINTS.INVOICE}/${invoiceId}`);
      notification.success({ message: MESSAGES.DELETE_SUCCESS });
      resetForm();
      loadCustomerList(); // Reload customers or invoices, depending on your data structure
      loadPaidInvoiceList();
    } catch (error) {
      notification.error({ message: MESSAGES.DELETE_ERROR });
    }
  };

  const resetForm = () => {
    setIsEdit(false); // Reset edit state
    setEditedInvoiceId(null); // Reset edited invoice ID
    setInvoiceDiscount(0); // Reset discount
    setInvoiceSubTotal(0); // Reset subtotal
    setDiscountTotal(0); // Reset discount total
    setCalculatedTax(0); // Reset calculated tax
    setInvoiceTotal(0); // Reset total invoice amount
    setTotalPaidAmount(0); // Reset total paid amount
    setPaidAmount(0); // Reset paid amount
    setPendingTotalAmount(0); // Reset pending amount
    setCurrentTotalAmount(0); // Reset current total amount
    setTreatmentData([]);
    setConditionData([]); // Assuming conditions come from the same API
    setMedicineData([]);
    setPastPaymentsCustomer([]);
    loadCustomerList();
    loadPaidInvoiceList();
    form.resetFields(); // Reset all form fields
  };

  const handleSubmit = async (values) => {
    let tax = 13.0;

    const dataToSubmit = {
      paymentMode: values.paymentMode,
      discount: values.discount
        ? Number(parseFloat(values.discount).toFixed(2))
        : 0.0,
      totalDiscountAmount: Number(parseFloat(discountTotal).toFixed(2)),
      tax: Number(parseFloat(tax).toFixed(2)),
      totaltaxAmount: Number(parseFloat(calculatedTax).toFixed(2)),
      totalAmount: Number(parseFloat(invoiceTotal).toFixed(2)),
      amountPaid: Number(parseFloat(values.amountPaid).toFixed(2)),
      pendingAmount: Number(parseFloat(pendingTotalAmount).toFixed(2)),
      issueDate: values.issueDate.toISOString(),
      dueDate: values.dueDate ? values.dueDate.toISOString() : null,
      status: values.status,
      customer_id: values.customer_id,
      case_id: values.caseHistoryId,
    };
    const url = isEdit
      ? `${API_ENDPOINTS.INVOICE}/${editedInvoiceId}`
      : API_ENDPOINTS.INVOICE;
    const method = isEdit ? "put" : "post";
    await axios[method](url, dataToSubmit);
    notification.success({
      message: isEdit ? MESSAGES.UPDATE_SUCCESS : MESSAGES.ADD_SUCCESS,
    });
    setIsPaid(1);
    loadCustomerList();

    resetForm();
  };
  const handlePaymentModeChange = (value) => {
    setInvoiceStatus(value);
    if (value === "full") {
      form.setFieldsValue({ dueDate: null }); // Reset due date if switching to full payment
    }
  };
  const handleDiscountChange = (e) => {
    const discountValue = e.target.value;
    form.setFieldsValue({ discount: discountValue });
    calculateInvoice();
  };

  const handleAmountPaidChange = (e) => {
    const amountPaidValue = e.target.value;

    setTotalPaidAmount(Number(amountPaidValue)); // Update total paid amount
    calculateInvoice();
  };
  const paymentModeOptions = [
    { value: "credit_card", label: "Credit Card" },
    { value: "debit_card", label: "Debit Card" },
    { value: "cash", label: "Cash" },
    { value: "bank_transfer", label: "Bank Transfer" },
  ];

  const statusOptions = [
    { value: "paid", label: "Paid" },
    { value: "unpaid", label: "Unpaid" },
    { value: "partial", label: "Partial Payment" },
    { value: "pending", label: "Pending" },
    { value: "overdue", label: "Overdue" },
  ];
  const columns = [
    {
      title: "Customer Name",
      dataIndex: ["customer", "fullname"],
      key: "customerName",
    },
    {
      title: "Amount Paid",
      dataIndex: "amountPaid",
      key: "amountPaid",
      render: (text) => `$ ${text}/-`,
    },
    {
      title: "Pending Amount",
      dataIndex: "pendingAmount",
      key: "pendingAmount",
      render: (text) => `$ ${text}/-`,
    },
    {
      title: "Paid Date",
      dataIndex: "issueDate",
      key: "paidDate",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <span style={{ display: "flex", gap: "8px" }}>
          {/* <Tooltip title="Edit">
            <EditOutlined
              onClick={() => handleEdit(record)}
              style={{
                color: "#52c41a",
                fontSize: "16px",
                cursor: "pointer",
                marginRight: "8px",
              }}
            />
          </Tooltip> */}
          <Tooltip title="Delete">
            <DeleteOutlined
              onClick={() => handleDelete(record.invoice_id)}
              style={{
                color: "#f5222d",
                fontSize: "16px",
                cursor: "pointer",
                marginRight: "8px",
              }}
            />
          </Tooltip>
          <Tooltip title="Download">
            <DownloadOutlined
              onClick={() => handleDownload(record.invoice_id)}
              style={{
                color: "#1890ff",
                fontSize: "16px",
                cursor: "pointer",
                marginRight: "8px",
              }}
            />
          </Tooltip>
          <Tooltip title="Send Email">
            <MailOutlined
              onClick={() => handleSendEmail(record.invoice_id)}
              style={{
                color: "#faad14",
                fontSize: "16px",
                cursor: "pointer",
              }}
            />
          </Tooltip>
        </span>
      ),
    },
  ];

  const customerPastPay = [
    {
      title: "Invoice Number",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Payment Date",
      dataIndex: "issueDate",
      key: "issueDate",
      render: (date) =>
        new Date(date).toLocaleDateString("en-GB", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      title: "Amount Paid",
      dataIndex: "amountPaid",
      key: "amountPaid",
      render: (amount) => `$ ${amount}/-`,
    },
    {
      title: "Download",
      key: "actions",
      render: (text, record) => (
        <span>
          <Tooltip title="Download">
            <DownloadOutlined
              onClick={() => handleDownload(record.invoice_id)}
              style={{
                color: "#1890ff",
                fontSize: "16px",
                cursor: "pointer",
                marginRight: "8px",
              }}
            />
          </Tooltip>
        </span>
      ),
    },
  ];
  return (
    <div className="container custom-top">
      {" "}
      <Col lg={24} md={24} sm={24} xs={24}>
        <Card
          title={<Title level={3}>Manage Invoice</Title>}
          style={{ marginBottom: "20px" }}
        >
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Row gutter={16}>
              <Col lg={8} md={8} sm={24} xs={24}>
                <Form.Item
                  name="customer_id"
                  label="Customer"
                  rules={[{ required: true, message: "Select a customer" }]}
                >
                  <Select
                    placeholder="Select customer"
                    showSearch
                    optionFilterProp="children"
                    onChange={handleCustomerChange}
                    filterOption={(input, option) =>
                      option?.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {customerList.map((customer) => (
                      <Option
                        key={customer.customer_id}
                        value={customer.customer_id}
                      >
                        {customer.fullname}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={8} md={8} sm={24} xs={24}>
                <Form.Item
                  label="Select Case"
                  name="caseHistoryId"
                  rules={[{ required: true, message: "Please select a case!" }]}
                >
                  <Select
                    options={caseHistoryList}
                    onChange={handleCaseChange}
                    placeholder="Select Case"
                    allowClear
                  />
                </Form.Item>
              </Col>
            </Row>
            {treatmentData?.length > 0 && (
              <Form.Item label="Treatment">
                <Row gutter={16}>
                  {/* Medical Condition */}
                  <Col lg={8} md={8} sm={24} xs={24}>
                    <Card className="bg-secondary">
                      <h5 className="card-title">Medical Condition</h5>
                      <div>
                        {conditionData.map((caseItem) => (
                          <Badge
                            key={caseItem.id}
                            className="badge-custom"
                            style={{ margin: "4px" }}
                          >
                            {caseItem.name}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </Col>

                  {/* Treatment */}
                  <Col lg={8} md={8} sm={24} xs={24}>
                    <Card className="bg-secondary">
                      <h5 className="card-title">Treatment</h5>
                      <div>
                        {treatmentData.map((caseItem) => (
                          <Badge
                            key={caseItem.id}
                            className="badge-custom"
                            style={{ margin: "4px" }}
                          >
                            {caseItem.name}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </Col>

                  {/* Medicine */}
                  <Col lg={8} md={8} sm={24} xs={24}>
                    <Card className="bg-secondary">
                      <h5 className="card-title">Medicine</h5>
                      <div>
                        {medicineData.map((caseItem) => (
                          <Badge
                            key={caseItem.id}
                            className="badge-custom"
                            style={{ margin: "4px" }}
                          >
                            {caseItem.name}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Form.Item>
            )}
            {treatmentData?.length > 0 && (
              <Row justify="center" className="mt-4 mb-4">
                <Col md={12}>
                  <Card className="bg-secondary text-center">
                    <div className="card-header">
                      <strong>Treatment Summary</strong>
                    </div>
                    <div className="card-body">
                      <table className="table table-bordered">
                        <thead className="bg-secondary">
                          <tr>
                            <th style={{ width: "70%" }}>Treatments</th>
                            <th style={{ width: "30%" }}>Treatment Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {treatmentData.map((treatment) => (
                            <tr key={treatment.id}>
                              <td>{treatment.name}</td>
                              <td>
                                CAD {treatment.cost}
                                /-
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <td className="text-right">Sub Total</td>
                            <td>CAD {Number(invoiceSubTotal).toFixed(2)}/-</td>
                          </tr>
                          <tr>
                            <td
                              className="text-right"
                              style={{ color: "green" }}
                            >
                              Discount
                            </td>
                            <td>- CAD {Number(discountTotal).toFixed(2)}/-</td>
                          </tr>
                          <tr>
                            <td className="text-right">Tax 13%</td>
                            <td>+ CAD {Number(calculatedTax).toFixed(2)}/-</td>
                          </tr>
                          <tr className="font-weight-bold">
                            <td className="text-right">Total</td>
                            <td>CAD {Number(invoiceTotal).toFixed(2)}/-</td>
                          </tr>
                          {(totalPaidAmount > 0 || paidAmount > 0) && (
                            <>
                              <tr>
                                <td
                                  className="text-right"
                                  style={{ color: "red" }}
                                >
                                  Total Paid Amount
                                </td>
                                <td>
                                  - CAD {Number(totalPaidAmount).toFixed(2)}/-
                                </td>
                              </tr>

                              <tr>
                                <td className="text-right">Amount Paid</td>
                                <td>CAD {Number(paidAmount).toFixed(2)}/-</td>
                              </tr>

                              <tr>
                                <td className="text-right">Amount Due</td>
                                <td>
                                  CAD {Number(pendingTotalAmount).toFixed(2)}/-
                                </td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </Col>
              </Row>
            )}

            {/* {pendingTotalAmount > 0 && (
            <> */}
            <Row gutter={16}>
              <Col lg={8} md={8} sm={24} xs={24}>
                <Form.Item
                  label="Invoice Date"
                  name="issueDate"
                  rules={[
                    {
                      required: true,
                      message: "Please select an invoice date!",
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    disabledDate={(current) =>
                      current && current.isBefore(moment().startOf("day"))
                    }
                  />
                </Form.Item>
              </Col>
              <Col lg={8} md={8} sm={24} xs={24}>
                <Form.Item
                  label="Payment Mode"
                  name="paymentMode"
                  rules={[
                    {
                      required: true,
                      message: "Please select a payment mode!",
                    },
                  ]}
                >
                  <Select
                    options={paymentModeOptions}
                    placeholder="Select Payment Mode"
                  />
                </Form.Item>
              </Col>
              <Col lg={8} md={8} sm={24} xs={24}>
                <Form.Item
                  label="Discount"
                  name="discount"
                  rules={[
                    { required: false, message: "Please enter a discount!" },
                    {
                      max: 2,
                      message:
                        "Please enter a valid discount with up to two digits!",
                    },
                  ]}
                >
                  <Input
                    type="number"
                    onChange={handleDiscountChange}
                    placeholder="Enter Discount"
                    disabled={pastPaymentsCustomer?.length > 0}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col lg={8} md={8} sm={24} xs={24}>
                <Form.Item
                  label="Amount Paid"
                  name="amountPaid"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the amount paid!",
                    },
                    {
                      validator: (_, value) => {
                        if (value < 0) {
                          return Promise.reject(
                            new Error("Amount paid cannot be negative!")
                          );
                        }

                        if (value > currentTotalAmount) {
                          return Promise.reject(
                            new Error(
                              "Amount paid cannot exceed the due amount!"
                            )
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    type="number"
                    onChange={handleAmountPaidChange}
                    placeholder="Enter Amount"
                    max={currentTotalAmount} // Limit to pending amount
                  />
                </Form.Item>
              </Col>
              <Col lg={8} md={8} sm={24} xs={24}>
                <Form.Item
                  label="Invoice Status"
                  name="status"
                  rules={[
                    {
                      required: true,
                      message: "Please select an invoice status!",
                    },
                  ]}
                >
                  <Select
                    options={statusOptions}
                    placeholder="Select Invoice Status"
                    onChange={handlePaymentModeChange}
                  />
                </Form.Item>
              </Col>
              <Col lg={8} md={8} sm={24} xs={24}>
                {invoiceStatus === "partial" && (
                  <Form.Item
                    label="Due Date"
                    name="dueDate"
                    rules={[
                      {
                        required: true,
                        message: "Please select a due date!",
                      },
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                )}
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    {isEdit ? "Update Invoice" : "Create Invoice"}
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
              </Col>
            </Row>
            {/* </>
          )} */}
            {pastPaymentsCustomer?.length > 0 && (
              <Row justify="center" className="mt-4 mb-4">
                <Col md={16}>
                  <Card className="bg-secondary text-center">
                    <div className="card-header text-center">
                      <strong>Past Payments</strong>
                    </div>
                    <div className="card-body">
                      <Table
                        columns={customerPastPay}
                        dataSource={pastPaymentsCustomer.map((payment) => ({
                          ...payment,
                          key: payment.invoice_id,
                        }))}
                        pagination={false}
                        bordered
                      />
                    </div>
                  </Card>
                </Col>
              </Row>
            )}
          </Form>
        </Card>{" "}
      </Col>
      <Col lg={24} md={24} sm={24} xs={24}>
        <Card
          title={<Title level={3}>Past Payments</Title>}
          style={{ marginTop: "20px" }}
        >
          <Table
            dataSource={invoiceList}
            columns={columns}
            rowKey="invoice_id"
            pagination={{ pageSize: 5 }}
            scroll={{ x: 700 }}
          />
        </Card>
      </Col>
    </div>
  );
};

export default Invoices;
