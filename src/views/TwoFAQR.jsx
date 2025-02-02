import { useState } from "react";
import { Button, Typography, Space } from "antd";
import "../assets/styles/twofaqr.css";
import TwoFACode from "./TwoFACode";
const { Title, Text } = Typography;

const TwoFAQR = ({ qrUrl, secret }) => {
  const [showTwoFACode, setShowTwoFACode] = useState(false);

  const qrUrlString = typeof qrUrl === "object" ? qrUrl.url : qrUrl;

  const handleContinue = () => {
    setShowTwoFACode(true);
  };

  return (
    <div className="twofa-container">
      {qrUrlString && !showTwoFACode ? (
        <div className="twofa-content">
          <Title level={2} className="twofa-title">
            Enable 2 Factor Authentication
          </Title>
          <img className="twofa-qr" src={qrUrlString} alt="2FA QR Code" />
          <Space direction="vertical" size="large">
            <Text className="twofa-text">
              Use an authenticator app to scan this QR code.
            </Text>
            <Button
              type="primary"
              size="large"
              onClick={handleContinue}
              className="twofa-button"
            >
              Continue
            </Button>
          </Space>
        </div>
      ) : showTwoFACode ? (
        <TwoFACode secret={secret} />
      ) : (
        <Text className="twofa-error">QR Code is not available</Text>
      )}
    </div>
  );
};

export default TwoFAQR;
