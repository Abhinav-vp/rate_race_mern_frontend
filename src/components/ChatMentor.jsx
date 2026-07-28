import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Trash2, Sparkles } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "./ChatMentor.css";

const SUGGESTIONS = [
  "Analyze my spending 📊",
  "How to save more? 💰",
  "Am I escaping the rat race?",
  "Budget tips for this month",
  "Investment ideas for beginners",
];

const ChatMentor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const { user } = useContext(AuthContext);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load chat history when panel opens
  useEffect(() => {
    if (isOpen && !historyLoaded && user) {
      loadHistory();
    }
  }, [isOpen, historyLoaded, user]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "20px";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 100) + "px";
    }
  }, [input]);

  const loadHistory = async () => {
    try {
      const res = await axios.get("http://localhost:7001/api/chat/history", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessages(
        res.data.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        }))
      );
      setHistoryLoaded(true);
    } catch {
      // History load failure is non-critical
      setHistoryLoaded(true);
    }
  };

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    setInput("");
    setError("");

    // Add user message optimistically
    const userMsg = { role: "user", content: messageText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:7001/api/chat",
        { message: messageText },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const assistantMsg = {
        role: "assistant",
        content: res.data.reply,
        timestamp: res.data.timestamp,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "Failed to get response. Please try again.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await axios.delete("http://localhost:7001/api/chat/history", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessages([]);
      setError("");
    } catch {
      setError("Failed to clear history.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /**
   * Render markdown-like formatting (bold, bullet points, line breaks)
   */
  const formatContent = (text) => {
    // Split into paragraphs
    const paragraphs = text.split(/\n\n+/);

    return paragraphs.map((para, pIdx) => {
      // Check if paragraph is a list
      const lines = para.split("\n");
      const isList = lines.every(
        (line) => line.trim().startsWith("- ") || line.trim().startsWith("* ") || line.trim() === ""
      );

      if (isList) {
        const items = lines.filter(
          (line) => line.trim().startsWith("- ") || line.trim().startsWith("* ")
        );
        return (
          <ul key={pIdx}>
            {items.map((item, iIdx) => (
              <li key={iIdx}>{formatInline(item.replace(/^[\s]*[-*]\s/, ""))}</li>
            ))}
          </ul>
        );
      }

      // Regular paragraph
      return <p key={pIdx}>{formatInline(para)}</p>;
    });
  };

  const formatInline = (text) => {
    // Bold: **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      // Inline code: `text`
      const codeParts = part.split(/(`.*?`)/g);
      return codeParts.map((cp, j) => {
        if (cp.startsWith("`") && cp.endsWith("`")) {
          return <code key={`${i}-${j}`}>{cp.slice(1, -1)}</code>;
        }
        return cp;
      });
    });
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        id="chat-mentor-toggle"
        className={`chat-toggle-btn ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open AI Mentor"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={26} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={26} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-left">
                <div className="chat-mentor-avatar">
                  <Sparkles size={18} />
                </div>
                <div className="chat-header-info">
                  <h3>Finance Mentor</h3>
                  <span>AI-Powered</span>
                </div>
              </div>
              <button
                className="chat-clear-btn"
                onClick={clearHistory}
                title="Clear chat history"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.length === 0 && !isLoading ? (
                <div className="chat-welcome">
                  <div className="welcome-icon">🧠</div>
                  <h3>Your AI Finance Mentor</h3>
                  <p>
                    I analyze your real spending data to give personalized
                    advice. Ask me anything about budgeting, saving, or escaping
                    the rat race!
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`chat-message ${msg.role}`}>
                    <div className="msg-avatar">
                      {msg.role === "user"
                        ? user.username.charAt(0).toUpperCase()
                        : "🧠"}
                    </div>
                    <div className="msg-bubble">{formatContent(msg.content)}</div>
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {isLoading && (
                <div className="typing-indicator">
                  <div className="msg-avatar" style={{
                    background: "linear-gradient(135deg, #a855f7, #6366f1)",
                    width: 30, height: 30, borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14
                  }}>
                    🧠
                  </div>
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && <div className="chat-error">{error}</div>}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips — show when no messages */}
            {messages.length === 0 && !isLoading && (
              <div className="chat-suggestions">
                {SUGGESTIONS.slice(0, 3).map((suggestion, i) => (
                  <button
                    key={i}
                    className="suggestion-chip"
                    onClick={() => sendMessage(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="chat-input-area">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your finance mentor..."
                rows={1}
                disabled={isLoading}
              />
              <button
                className="chat-send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatMentor;
