import React from "react";
import { Form, Input, Button, Card, Typography } from "antd";
import { Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

export interface LoginProps {
  /**
   * 当用户点击登录按钮且表单验证通过时触发的回调
   * @param values 包含 email 和 password 的表单值
   */
  onSubmit?: (values: any) => void;
  /**
   * 页面是否处于加载/提交中状态
   */
  isLoading?: boolean;
}

/**
 * CoEdit 静态登录页面组件 (飞书极简风格)
 */
export const Login: React.FC<LoginProps> = ({ onSubmit, isLoading = false }) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    if (onSubmit) {
      onSubmit(values);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#F8F9FA",
        padding: "20px",
      }}
    >
      <Card
        bordered={false}
        style={{
          width: "100%",
          maxWidth: "400px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(31, 35, 41, 0.05)",
          padding: "16px 8px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          {/* 飞书蓝品牌色 #3370FF */}
          <Title level={3} style={{ color: "#3370FF", margin: "0 0 8px 0", fontWeight: 600 }}>
            CoEdit 协同空间
          </Title>
          <Text type="secondary" style={{ color: "#646A73", fontSize: "14px" }}>
            欢迎回来，请登录您的账号
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "请输入邮箱地址" },
              { type: "email", message: "请输入有效的邮箱格式" },
            ]}
          >
            <Input
              prefix={<Mail size={16} style={{ color: "#8F959E", marginRight: "4px" }} />}
              placeholder="邮箱地址"
              size="large"
              style={{
                borderRadius: "4px",
                borderColor: "#DEE0E3",
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
            style={{ marginBottom: "24px" }}
          >
            <Input.Password
              prefix={<Lock size={16} style={{ color: "#8F959E", marginRight: "4px" }} />}
              placeholder="密码"
              size="large"
              style={{
                borderRadius: "4px",
                borderColor: "#DEE0E3",
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: "16px" }}>
            {/* 飞书蓝实心按钮 */}
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={isLoading}
              style={{
                backgroundColor: "#3370FF",
                borderColor: "#3370FF",
                height: "40px",
                borderRadius: "4px",
                fontWeight: 500,
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            还没有账号？{" "}
            <Link to="/register" style={{ color: "#3370FF", textDecoration: "none" }}>
              立即创建账号
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
