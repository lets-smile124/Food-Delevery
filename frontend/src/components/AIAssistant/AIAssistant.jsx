import React, { useContext, useState } from "react";
import axios from "axios";
import "./AIAssistant.css";
import { StoreContext } from "../../context/StoreContext";

const AIAssistant = ({ isOpen, setIsOpen }) => {
  const { url } = useContext(StoreContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hey! 👋 I'm your personal food assistant.",
    },
    {
      sender: "ai",
      text: "Tell me what you're craving and I'll help you find something delicious! 🍕",
    },
  ]);

  const suggestions = [
    {
      icon: "🌶️",
      title: "Something spicy",
      text: "Suggest something spicy",
    },
    {
      icon: "💰",
      title: "Under ₹200",
      text: "Show me food under ₹200",
    },
    {
      icon: "🌱",
      title: "Vegetarian",
      text: "Show me vegetarian food",
    },
    {
      icon: "🍕",
      title: "Pizza",
      text: "Suggest a pizza",
    },
  ];

  const sendMessage = async (text = message) => {
    if (!text.trim()) return;

    const userMessage = text.trim();

    // Add user's message
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage,
      },
    ]);

    setMessage("");

    // Show loading message
    setMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: "Thinking... 🤔",
        loading: true,
      },
    ]);

    try {
      const response = await axios.post(`${url}/api/ai/chat`, {
        message: userMessage,
      });

      console.log("FULL AI RESPONSE:", response);
console.log("AI DATA:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const aiReply = response.data.reply;

      // Replace "Thinking..." with actual response
      setMessages((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          sender: "ai",
          text: aiReply,
        };

        return updated;
      });
    } catch (error) {
      console.log("AI chat error:", error.response?.data || error.message);

      setMessages((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          sender: "ai",
          text: "Sorry, I'm having trouble connecting right now. Please try again.",
        };

        return updated;
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      {!isOpen && (
        <button
          className="ai-floating-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI food assistant"
        >
          <div className="ai-button-glow"></div>

          <div className="ai-button-icon">✨</div>

          <span className="ai-online-dot"></span>

          <div className="ai-button-tooltip">Ask Food AI</div>
        </button>
      )}

      {/* AI Chat */}
      {isOpen && (
        <div className="ai-chat-container">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-header-left">
              <div className="ai-header-avatar">
                <span>✨</span>
              </div>

              <div className="ai-header-text">
                <h3>Foodie AI</h3>

                <div className="ai-status">
                  <span></span>
                  Online • Ready to help
                </div>
              </div>
            </div>

            <button
              className="ai-close-button"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {/* Chat Content */}
          <div className="ai-chat-messages">
            <div className="ai-welcome">
              <div className="ai-welcome-icon">🍔</div>

              <h2>What are you craving?</h2>

              <p>I can help you discover the perfect food from our menu.</p>
            </div>

            {/* Messages */}
            <div className="ai-messages-list">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={
                    msg.sender === "user"
                      ? "ai-message-row user-row"
                      : "ai-message-row"
                  }
                >
                  {msg.sender === "ai" && (
                    <div className="small-ai-avatar">✨</div>
                  )}

                  <div
                    className={
                      msg.sender === "user"
                        ? "ai-message user-message"
                        : "ai-message ai-message-bubble"
                    }
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && (
              <div className="ai-suggestions">
                <p className="suggestion-title">Quick suggestions</p>

                <div className="suggestion-grid">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="suggestion-card"
                      onClick={() => sendMessage(suggestion.text)}
                    >
                      <span className="suggestion-icon">{suggestion.icon}</span>

                      <span>{suggestion.title}</span>

                      <span className="suggestion-arrow">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="ai-input-section">
            <div className="ai-input-container">
              <input
                type="text"
                placeholder="Ask me anything about food..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <button
                className={
                  message.trim() ? "ai-send-button active" : "ai-send-button"
                }
                onClick={() => sendMessage()}
              >
                ↑
              </button>
            </div>

            <div className="ai-powered-text">✨ Powered by AI</div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
