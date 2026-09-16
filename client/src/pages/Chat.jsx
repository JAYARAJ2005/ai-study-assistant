import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import ReactMarkdown from "react-markdown";

import MainLayout from "../layouts/MainLayout/MainLayout";
import ChatHistoryPicker from "../components/ChatHistoryPicker/ChatHistoryPicker";
import AILoader from "../components/AILoader/AILoader";
import { useNotifications } from "../context/NotificationContext";
import usePageTitle from "../hooks/usePageTitle";

import "../pages/Dashboard.css";

function Chat() {
  usePageTitle('AI Chat');

  const { addNotification } = useNotifications();

  const messagesEndRef = useRef(null);
  const plusMenuRef = useRef(null);

  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const [chatLoading, setChatLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [error, setError] = useState("");

  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const [showFileUpload, setShowFileUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showHistoryPicker, setShowHistoryPicker] = useState(false);

  // Inline edit state
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  const editInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) {
      editInputRef.current.focus();
      const len = editInputRef.current.value.length;
      editInputRef.current.setSelectionRange(len, len);
    }
  }, [editingIndex]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadHistory = async (chat) => {
    if (!chat) { setChatMessages([]); return; }
    setHistoryLoading(true);
    try {
      const url = chat.type === "document"
        ? `/api/chat/${chat.id}`
        : `/api/chat/general/${chat.id}`;
      const res = await api.get(url);
      setChatMessages(res.data.messages || []);
    } catch (err) {
      console.error(err);
      setChatMessages([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleUploadAndStartChat = async () => {
    if (!file) { setError("Please choose a file first."); return; }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await api.post("/api/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const chat = { type: "document", id: uploadRes.data.documentId, filename: file.name };
      setActiveChat(chat);
      setChatMessages([]);
      addNotification(`Started chat with "${file.name}"`);
      setShowFileUpload(false);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleSelectSession = (session) => {
    setActiveChat(session);
    setError("");
    setShowFileUpload(false);
    setShowHistoryPicker(false);
    setEditingIndex(null);
    loadHistory(session);
  };

  const handleNewChat = async () => {
    setError("");
    setShowFileUpload(false);
    setShowPlusMenu(false);
    setEditingIndex(null);
    try {
      const res = await api.post("/api/chat/general/new", {});
      const chat = { type: "general", id: res.data.sessionId, filename: "New Chat" };
      setActiveChat(chat);
      setChatMessages([]);
      setHistoryRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError("Failed to start new chat.");
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMessage = chatInput;
    setChatInput("");
    await sendMessage(userMessage, null);
  };

  const sendMessage = async (userMessage, editAtIndex) => {
    setChatLoading(true);
    setError("");
    setEditingIndex(null);

    let chat = activeChat;

    try {
      if (!chat) {
        const createRes = await api.post("/api/chat/general/new", {});
        chat = { type: "general", id: createRes.data.sessionId, filename: "New Chat" };
        setActiveChat(chat);
      }

      if (editAtIndex !== null) {
        setChatMessages((prev) => [
          ...prev.slice(0, editAtIndex),
          { role: "user", content: userMessage },
        ]);
      } else {
        setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);
      }

      const url = chat.type === "document"
        ? `/api/chat/${chat.id}`
        : `/api/chat/general/${chat.id}`;

      const res = await api.post(url, { message: userMessage });

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply },
      ]);

      setHistoryRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleStartEdit = (index, content) => {
    setEditingIndex(index);
    setEditingText(content);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingText("");
  };

  const handleSubmitEdit = () => {
    if (!editingText.trim()) return;
    sendMessage(editingText.trim(), editingIndex);
  };

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      addNotification("Copied to clipboard");
    } catch (err) {
      setError("Could not copy to clipboard.");
    }
  };

  const handleRegenerate = (assistantIndex) => {
    const userIndex = assistantIndex - 1;
    if (userIndex < 0 || chatMessages[userIndex]?.role !== "user") return;
    const question = chatMessages[userIndex].content;
    sendMessage(question, userIndex);
  };

  return (
    <MainLayout>
      <div className="dashboard-container">
        <div className="card">

          <div className="chat-header-bar">
            <div className="chat-header-left">
              <div className="chat-header-avatar">🤖</div>
              <div>
                <div className="chat-header-title">AI Study Assistant</div>
                <div className="chat-header-status">
                  <span className="chat-status-dot"></span>
                  Online
                </div>
              </div>
            </div>
          </div>

          {showFileUpload && (
            <div className="upload-row">
              <div className="file-input-wrapper">
                <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
              </div>
              <button className="btn-primary" disabled={uploading} onClick={handleUploadAndStartChat}>
                {uploading ? "Uploading..." : "Upload & Start Chat"}
              </button>
              <button className="btn-clear" onClick={() => { setShowFileUpload(false); setFile(null); }}>
                Cancel
              </button>
            </div>
          )}

          {showHistoryPicker && (
            <div className="upload-row">
              <ChatHistoryPicker key={historyRefreshKey} onSelectSession={handleSelectSession} />
            </div>
          )}

          {uploading && (
            <AILoader title="📄 Uploading your document..." subtitle="Gemini is preparing your document for conversation." />
          )}

          {!activeChat && !showFileUpload && !showHistoryPicker && (
            <div style={{ marginTop: "20px", color: "var(--gray)" }}>
              Ask any academic question or upload a document to chat with it.
            </div>
          )}

          {activeChat?.type === "document" && (
            <div className="chat-active-doc-banner">
              📄 Currently chatting with: <strong>{activeChat.filename}</strong>
            </div>
          )}

          <div className="chat-card" style={{ marginTop: "25px" }}>
            <div className="chat-messages">

              {historyLoading && <div className="chat-empty">Loading chat history...</div>}

              {!historyLoading && chatMessages.length === 0 && !chatLoading && (
                <div className="chat-empty">Ask anything — I'm here to help</div>
              )}

              {!historyLoading && chatMessages.map((msg, index) => (
                <div key={index} className={`chat-bubble-row ${msg.role === "user" ? "user" : ""}`}>

                  {msg.role === "user" ? (
                    <>
                      {editingIndex === index ? (
                        <div className="chat-inline-edit">
                          <textarea
                            ref={editInputRef}
                            className="chat-inline-textarea"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitEdit();
                              }
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                            rows={3}
                          />
                          <div className="chat-inline-edit-actions">
                            <button className="chat-edit-save-btn" onClick={handleSubmitEdit} disabled={chatLoading}>
                              Send
                            </button>
                            <button className="chat-edit-cancel-btn" onClick={handleCancelEdit}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="chat-user-message-wrapper">
                          <div className="chat-avatar user-avatar">🧑</div>
                          <div className="chat-bubble user">{msg.content}</div>
                          <button
                            className="chat-edit-btn"
                            title="Edit message"
                            onClick={() => handleStartEdit(index, msg.content)}
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="chat-assistant-wrapper">
                      <div className="chat-assistant-row">
                        <div className="chat-avatar assistant-avatar">🤖</div>
                        <div className="chat-bubble assistant">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                      <div className="chat-assistant-actions">
                        <button
                          className="chat-action-btn"
                          title="Copy"
                          onClick={() => handleCopy(msg.content)}
                        >
                          📋
                        </button>
                        <button
                          className="chat-action-btn"
                          title="Regenerate"
                          onClick={() => handleRegenerate(index)}
                          disabled={chatLoading}
                        >
                          🔄
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ))}

              {chatLoading && (
                <div className="thinking-row">
                  <div className="chat-avatar assistant-avatar">🤖</div>
                  <div className="thinking-bubble">
                    <div className="typing-dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef}></div>
            </div>

            <div className="chat-input-row">
              <div className="chat-plus-wrapper" ref={plusMenuRef}>
                <button
                  className="chat-plus-btn"
                  onClick={() => setShowPlusMenu((prev) => !prev)}
                  title="More options"
                >
                  +
                </button>

                {showPlusMenu && (
                  <div className="chat-plus-menu">
                    <div className="chat-plus-menu-item" onClick={handleNewChat}>
                      ➕ New Chat
                    </div>
                    <div
                      className="chat-plus-menu-item"
                      onClick={() => {
                        setShowFileUpload(true);
                        setShowHistoryPicker(false);
                        setFile(null);
                        setError("");
                        setShowPlusMenu(false);
                      }}
                    >
                      📄 Chat with Document
                    </div>
                    <div
                      className="chat-plus-menu-item"
                      onClick={() => {
                        setShowHistoryPicker(true);
                        setShowFileUpload(false);
                        setShowPlusMenu(false);
                      }}
                    >
                      🕘 Chat History
                    </div>
                  </div>
                )}
              </div>

              <input
                type="text"
                value={chatInput}
                placeholder="Ask Gemini anything..."
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
                disabled={chatLoading || editingIndex !== null}
              />
              <button
                className="chat-send-btn"
                onClick={handleSendMessage}
                disabled={chatLoading || editingIndex !== null}
                title="Send"
              >
                ➤
              </button>
            </div>

            {error && <p className="error-text">{error}</p>}
          </div>

        </div>
      </div>
    </MainLayout>
  );
}

export default Chat;