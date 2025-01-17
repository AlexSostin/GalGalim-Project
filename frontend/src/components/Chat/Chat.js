import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Chat.css";

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatInfo, setChatInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const lastMessageId = useRef(null);
  const isSubscribed = useRef(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchNewMessages = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/chats/${chatId}/messages/?after=${
          lastMessageId.current || 0
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch new messages: ${response.status}`);
      }

      const data = await response.json();
      const newMessages = data.filter(
        (newMsg) =>
          !messages.some((existingMsg) => existingMsg.id === newMsg.id)
      );

      if (newMessages.length > 0 && isSubscribed.current) {
        setMessages((prev) => [...prev, ...newMessages]);
        lastMessageId.current = newMessages[newMessages.length - 1].id;
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error fetching new messages:", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate("/login");
      return;
    }

    if (!chatId) {
      setError("Chat not found");
      setLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const chatResponse = await fetch(
          `http://127.0.0.1:8000/api/chats/${chatId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!chatResponse.ok) {
          throw new Error(`Failed to load chat: ${chatResponse.status}`);
        }

        const chatData = await chatResponse.json();
        setChatInfo(chatData);

        const messagesResponse = await fetch(
          `http://127.0.0.1:8000/api/chats/${chatId}/messages/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!messagesResponse.ok) {
          throw new Error(
            `Failed to load messages: ${messagesResponse.status}`
          );
        }

        const messagesData = await messagesResponse.json();
        setMessages(messagesData);
        if (messagesData.length > 0) {
          lastMessageId.current = messagesData[messagesData.length - 1].id;
        }
        scrollToBottom();
      } catch (error) {
        setError(error.message);
        if (error.message.includes("401") || error.message.includes("403")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    let interval;
    const startPolling = () => {
      interval = setInterval(fetchNewMessages, 15000);
    };

    const stopPolling = () => {
      if (interval) clearInterval(interval);
    };

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        fetchNewMessages();
        startPolling();
      } else {
        stopPolling();
      }
    });

    if (document.visibilityState === "visible") {
      startPolling();
    }

    return () => {
      isSubscribed.current = false;
      stopPolling();
    };
  }, [chatId, token, isAuthenticated, navigate]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !token) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/chats/${chatId}/messages/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ content: newMessage.trim() }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data]);
        lastMessageId.current = data.id;
        setNewMessage("");
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  if (loading) return <div className="chat-loading">Loading chat...</div>;
  if (error) return <div className="chat-error">{error}</div>;

  return (
    <div className="chat-container">
      <div className="chat-header">
        {chatInfo && (
          <>
            <h2>Chat about {chatInfo.bike.name}</h2>
            <p>With {chatInfo.other_user.username}</p>
          </>
        )}
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.is_sender ? "sent" : "received"}`}
          >
            <div className="message-avatar">
              {message.is_sender
                ? "You"
                : chatInfo?.other_user.username[0].toUpperCase()}
            </div>
            <div className="message-content">
              <p>{message.content}</p>
              <span className="message-time">
                {formatTime(message.created_at)}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
