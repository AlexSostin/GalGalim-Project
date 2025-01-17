import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Messages.css";

const Messages = () => {
  const [chats, setChats] = useState([]);
  const { token } = useAuth();
  const [loadedImages, setLoadedImages] = useState({});

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchChats = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/chats/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("Chats data:", data);
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const handleImageError = (chatId) => {
    setLoadedImages((prev) => ({
      ...prev,
      [chatId]: false,
    }));
  };

  const handleImageLoad = (chatId) => {
    setLoadedImages((prev) => ({
      ...prev,
      [chatId]: true,
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="messages-container">
      <h2>My Messages</h2>
      {chats.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <div className="chats-list">
          {chats.map((chat) => (
            <Link to={`/chats/${chat.id}`} key={chat.id} className="chat-item">
              <div className="chat-preview">
                <div className="chat-image-container">
                  <img
                    src={chat.bike.image || "/default-bike.png"}
                    alt={chat.bike.name}
                    className={`chat-bike-image ${
                      loadedImages[chat.id] ? "loaded" : ""
                    }`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-bike.png";
                      handleImageError(chat.id);
                    }}
                    onLoad={() => handleImageLoad(chat.id)}
                  />
                </div>
                <div className="chat-info">
                  <div className="chat-header">
                    <h3>{chat.bike.name}</h3>
                    <span className="chat-time">
                      {chat.last_message
                        ? formatDate(chat.last_message.created_at)
                        : ""}
                    </span>
                  </div>
                  <p className="chat-with">
                    Chat with {chat.other_user.username}
                  </p>
                  <p className="last-message">
                    {chat.last_message
                      ? chat.last_message.content
                      : "No messages yet"}
                  </p>
                </div>
                {chat.unread_count > 0 && (
                  <span className="unread-badge">{chat.unread_count}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
