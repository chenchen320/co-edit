import React, { useState ,useEffect } from "react";
import { Button, Layout, Space } from "antd";
import { ChevronLeft, CloudLightning, CloudCheck } from "lucide-react"; // 使用替代云同步图标
import { useEditor,EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useParams } from "react-router-dom";
import apiClient from "../utils/apiClient";
import useDebounce from "../utils/useDebounce";
const { Header, Content } = Layout;


export interface DocumentEditorProps {
  /**
   * 文档 ID
   */
  id?: string | number;
  /**
   * 文档标题，默认 "未命名文档"
   */
  title?: string;
  /**
   * 文档同步/保存状态：'saved'（已保存），'saving'（保存中...），'error'（保存失败）
   */
  saveStatus?: "saved" | "saving" | "error";
  /**
   * 点击返回列表按钮时的回调
   */
  onBack?: () => void;
  /**
   * 预留给 Tiptap 编辑器内核的自定义渲染区域。
   * 用户可以直接通过此插槽将实例化后的 Tiptap <EditorContent /> 传进来。
   */
  editorContainer?: React.ReactNode;
}

/**
 * CoEdit 文档编辑页静态页面组件 (飞书云文档纯享风格)
 */
import { io } from "socket.io-client";
import * as Y from "yjs";
import Collaboration from "@tiptap/extension-collaboration";

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  id: _id,
  title: initialTitle = "未命名文档",
  saveStatus: _saveStatus = "saved",
  onBack,
  editorContainer,
}) => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState(initialTitle);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>("saved");

  // 1. 初始化 Yjs 文档和共享字段
  const [ydoc] = useState(() => new Y.Doc());

  // 状态点样式与描述
  const getStatusConfig = () => {
    switch (saveStatus) {
      case "saving":
        return {
          status: "processing" as const,
          color: "#3370FF",
          text: "保存中...",
          icon: <CloudLightning size={14} style={{ color: "#3370FF" }} />,
        };
      case "error":
        return {
          status: "error" as const,
          color: "#FF4D4F",
          text: "保存失败",
          icon: <CloudLightning size={14} style={{ color: "#FF4D4F" }} />,
        };
      case "saved":
      default:
        return {
          status: "success" as const,
          color: "#52C41A",
          text: "已保存到云端",
          icon: <CloudCheck size={14} style={{ color: "#52C41A" }} />,
        };
    }
  };

  // 2. 数据库落库自动保存（作为离线和最终数据库持久化的兜底）
  const saveContentToDatabase = async (htmlContent: string) => {
    setSaveStatus('saving');
    try {
      await apiClient.patch(`document/${id}`, { content: htmlContent });
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  const debounceSave = useDebounce(saveContentToDatabase, 1500);

  // 3. 配置 Tiptap 编辑器内核（绑定 Yjs 的 ydoc）
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // 💡 必须关闭自带历史，改用 Yjs 的历史记录管理
      }),
      Collaboration.configure({
        document: ydoc,
        field: "codewrite",
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      // 触发数据库自动保存防抖
      debounceSave(editor.getHTML());
    },
  });

  // 4. 处理 WebSocket 二进制协同同步
  useEffect(() => {
    if (!id || !editor) return;

    // 连接 Socket 服务器
    const socket = io("http://localhost:3000");

    // 监听连接事件并加入房间
    socket.on("connect", () => {
      socket.emit("join-document", { documentId: id });
    });

    // 接收后端的第一次同步消息（Sync Step 1 / 2）
    socket.on("sync", (buffer: ArrayBuffer) => {
      Y.applyUpdate(ydoc, new Uint8Array(buffer));
    });

    // 接收其他人的编辑数据
    socket.on("document-updated", (data: { content: ArrayBuffer }) => {
      Y.applyUpdate(ydoc, new Uint8Array(data.content));
    });

    // 当本地 Ydoc 被用户修改时，向外推送二进制增量数据
    const handleYDocUpdate = (update: Uint8Array) => {
      socket.emit("document-update", {
        documentId: id,
        content: update,
      });
    };

    ydoc.on("update", handleYDocUpdate);

    // 从数据库获取文档的初始标题并渲染
    const loadInitialDoc = async () => {
      try {
        const res = await apiClient.get(`/document/${id}`);
        setTitle(res.data.title);
        // 如果数据库有旧数据，且本地 Ydoc 为空，则初始化 Ydoc
        if (res.data.content && ydoc.getText("codewrite").length === 0) {
          // 初始化同步
          ydoc.transact(() => {
            const ytext = ydoc.getText("codewrite");
            ytext.insert(0, res.data.content);
          });
        }
      } catch (err) {
        console.error("加载文档数据失败", err);
      }
    };
    loadInitialDoc();

    // 销毁生命周期，断开连接
    return () => {
      ydoc.off("update", handleYDocUpdate);
      socket.disconnect();
    };
  }, [id, editor, ydoc]);

  const statusConfig = getStatusConfig();


  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#F5F6F7" }}>
      {/* 顶部标题与状态栏 */}
      <Header
        style={{
          background: "#FFFFFF",
          padding: "0 20px",
          height: "56px",
          lineHeight: "56px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #DEE0E3",
        }}
      >
        <Space size={16}>
          <Button
            type="text"
            icon={<ChevronLeft size={18} />}
            onClick={onBack}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
              color: "#646A73",
            }}
          />
          <span style={{ fontSize: "16px", fontWeight: 600, color: "#1F2329" }}>
            {title}
          </span>
        </Space>

        <Space size={8} style={{ color: "#8F959E", fontSize: "13px" }}>
          {statusConfig.icon}
          <span style={{ color: "#8F959E" }}>{statusConfig.text}</span>
        </Space>
      </Header>

      {/* 白色纸张编辑器容器 */}
      <Content
        style={{
          padding: "40px 20px",
          display: "flex",
          justifyContent: "center",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "800px",
            backgroundColor: "#FFFFFF",
            minHeight: "80vh",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(31, 35, 41, 0.06)",
            border: "1px solid #DEE0E3",
            padding: "40px 60px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 文档静态标题区域 */}
          <div
            style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#1F2329",
              borderBottom: "1px solid #E4E5E7",
              paddingBottom: "16px",
              marginBottom: "24px",
              outline: "none",
            }}
          >
            {title}
          </div>

          {/* Tiptap 编辑器骨架占位区 */}
          <div style={{ flex: 1, minHeight: "300px" }}>
            {editorContainer ? (
              editorContainer
            ) : (
              <div
                style={{
                  color: "#8F959E",
                  padding: "40px 0",
                  textAlign: "center",
                  fontSize: "15px",
                  border: "1px dashed #DEE0E3",
                  borderRadius: "4px",
                  backgroundColor: "#FAFAFA",
                }}
              >
               <EditorContent editor={editor} />
              </div>
            )}
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default DocumentEditor;
