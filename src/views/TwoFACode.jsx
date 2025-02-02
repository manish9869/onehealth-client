import { useState } from "react";
import { Input, Button, Typography, Space, notification } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../assets/styles/twofacode.css";
import API_ENDPOINTS from "../config/apiConfig";

const { Title, Text } = Typography;

// Define your success messages here
const MESSAGES = {
  ADD_SUCCESS: "Two-factor authentication enabled successfully!",
  UPDATE_SUCCESS: "Two-factor authentication updated successfully!",
  INVALID_CODE: "Invalid code. Please enter a 6-digit code.",
  VERIFICATION_FAILED: "Verification failed. Please try again.",
  ERROR_OCCURRED: "An error occurred. Please try again later.",
  VERIFY_SUCCESS: "User Verified successfully!",
};

const TwoFACode = ({ secret, email, isEdit }) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      notification.error({ message: MESSAGES.INVALID_CODE });
      return;
    }

    setLoading(true);

    try {
      const verifyResponse = await axios.post(
        `${API_ENDPOINTS.AUTH}/verify-otp`,
        {
          secret,
          token: verificationCode,
          email,
        }
      );

      const { data } = verifyResponse;

      if (data?.status === "success" && data?.data?.data.verified) {
        notification.success({
          message: data?.message || MESSAGES.VERIFY_SUCCESS,
        });

        localStorage.setItem("userData", JSON.stringify(data?.data?.data.user));

        navigate("/admin/dashboard");
      } else {
        notification.error({
          message: data?.message || MESSAGES.VERIFICATION_FAILED,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      notification.error({ message: MESSAGES.ERROR_OCCURRED });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="twofa-code-container">
      <Title level={2} className="twofa-code-title">
        Two Factor Authentication
      </Title>
      <Space direction="vertical" size="middle" align="center">
        <Text className="twofa-code-text">
          Please enter the 6-digit code from your authenticator app.
        </Text>
        <Input
          className="twofa-code-input"
          placeholder="Enter 6-digit code"
          maxLength={6}
          onInput={(e) => {
            // Only allow numbers and max length of 6
            e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
          }}
          type="number"
          onChange={(e) => setVerificationCode(e.target.value)}
          style={{ width: "250px", textAlign: "center" }}
        />
        <Button
          type="primary"
          onClick={handleVerifyCode}
          size="large"
          className="twofa-code-button"
          loading={loading}
        >
          Submit
        </Button>
      </Space>
    </div>
  );
};

export default TwoFACode;
