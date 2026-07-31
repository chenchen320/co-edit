import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DocumentEditor from "./pages/DocumentEditor";

// 静态跳转逻辑代理器，仅做页面流转展示
const DashboardRouteHelper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Dashboard
      username="飞书体验官"
      onCreateDocument={() => {
        // TODO: 业务逻辑由用户实现 (调用 POST /document 创建并获取新 ID)
        const mockNewId = Math.floor(Math.random() * 1000) + 10;
        alert(`触发新建文档动作，即将静态模拟跳转到 /document/${mockNewId}`);
        navigate(`/document/${mockNewId}`);
      }}
      onSelectDocument={(id) => {
        navigate(`/document/${id}`);
      }}
      onDeleteDocument={(id) => {
        // TODO: 业务逻辑由用户实现 (调用 DELETE /document/:id)
        alert(`触发删除文档 ID: ${id} 动作，请绑定 API 进行更新。`);
      }}
      onLogout={() => {
        // TODO: 业务逻辑由用户实现 (清理 LocalStorage Token)
        alert("已触发退出登录行为！即将静态返回 /login");
        navigate("/login");
      }}
    />
  );
};

const DocumentEditorRouteHelper: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <DocumentEditor
      id={id}
      title={id ? `模拟文档标题 #${id}` : "新文档"}
      saveStatus="saved"
      onBack={() => {
        navigate("/dashboard");
      }}
    />
  );
};

const LoginRouteHelper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Login
      onSubmit={(values) => {
        // TODO: 业务逻辑由用户实现
        alert(`登录提交: ${JSON.stringify(values)}\n接下来请实现令牌存取和 ProtectedRoute 跳转！`);
        navigate("/dashboard");
      }}
    />
  );
};

const RegisterRouteHelper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Register
      onSubmit={(values) => {
        // TODO: 业务逻辑由用户实现
        alert(`注册提交: ${JSON.stringify(values)}\n接下来请实现注册接口调用！`);
        navigate("/login");
      }}
    />
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginRouteHelper />} />
        <Route path="/register" element={<RegisterRouteHelper />} />
        <Route path="/dashboard" element={<DashboardRouteHelper />} />
        <Route path="/document/:id" element={<DocumentEditorRouteHelper />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
