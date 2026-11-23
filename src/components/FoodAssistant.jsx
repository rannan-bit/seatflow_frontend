import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Bot, Send, X, RotateCcw, Utensils } from "lucide-react";
import { chatWithAIAPI } from "../services/allAPI.js";
import { initialFoods } from "../data/initialData.js";
import "./FoodAssistant.css";

const QUICK_PROMPTS = [
    "What are the house favourites?",
    "Recommend vegetarian starters",
    "What drinks do you serve?",
    "Are there any spicy dishes?"
];

function formatMessageTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Client-side menu intelligence fallback in case backend server is unreachable
function getLocalMenuAdvice(userText) {
    const query = (userText || "").toLowerCase();

    if (query.includes("veg") && !query.includes("non-veg") && !query.includes("non veg")) {
        const vegList = initialFoods.filter((f) => f.isVeg !== false);
        return (
            "Here are our vegetarian specialities at The Olive Room:\n\n" +
            vegList.map((f) => `• **${f.name}** (₹${f.price}) — ${f.description}`).join("\n") +
            "\n\nWould you like recommendations for starters or mains?"
        );
    }

    if (query.includes("non-veg") || query.includes("non veg") || query.includes("chicken") || query.includes("meat") || query.includes("pepperoni")) {
        const nonVegList = initialFoods.filter((f) => f.isVeg === false);
        return (
            "Here are our non-vegetarian selections:\n\n" +
            nonVegList.map((f) => `• **${f.name}** (₹${f.price}) — ${f.description}`).join("\n") +
            "\n\nBoth are hearty house favourites!"
        );
    }

    if (query.includes("starter") || query.includes("appetizer") || query.includes("fries") || query.includes("salad")) {
        const starters = initialFoods.filter((f) => f.category === "Starters");
        return (
            "For starters, we highly recommend:\n\n" +
            starters.map((f) => `• **${f.name}** (₹${f.price}) — ${f.description}`).join("\n") +
            "\n\nWould you like to pair this with a main course?"
        );
    }

    if (query.includes("drink") || query.includes("dessert") || query.includes("cake") || query.includes("sweet")) {
        const drinks = initialFoods.filter((f) => f.category === "Drinks");
        return (
            "For drinks and sweet finishes, try our:\n\n" +
            drinks.map((f) => `• **${f.name}** (₹${f.price}) — ${f.description}`).join("\n")
        );
    }

    if (query.includes("spicy") || query.includes("kick") || query.includes("chili")) {
        return (
            "Looking for something flavorful with a kick? We recommend:\n\n" +
            "• **Crispy Pepperoni Flatbread** (₹429) — spiced pepperoni with mozzarella & chili honey\n" +
            "• **Truffle Parmesan Fries** (₹199) — ask our server to add extra chili pepper flakes\n\n" +
            "Our kitchen can always tailor spice levels to your preference!"
        );
    }

    if (query.includes("popular") || query.includes("favourite") || query.includes("recommend") || query.includes("best") || query.includes("special")) {
        const popular = initialFoods.filter((f) => f.category === "Popular" || f.price > 300);
        return (
            "Here are our top recommended house favourites:\n\n" +
            popular.map((f) => `• **${f.name}** (₹${f.price}) — ${f.description}`).join("\n") +
            "\n\nFeel free to ask for vegetarian or non-vegetarian options!"
        );
    }

    // Default overview
    return (
        "Welcome to The Olive Room! Here are a few guest favourites you can try:\n\n" +
        initialFoods.slice(0, 3).map((f) => `• **${f.name}** (₹${f.price}) — ${f.description}`).join("\n") +
        "\n\nAsk me about vegetarian options, starters, drinks, or specific cravings!"
    );
}

export default function FoodAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: "Hello! I’m your SeatFlow dining assistant. Ask me anything about our menu, ingredients, dietary options, or recommendations.",
            time: formatMessageTime()
        }
    ]);
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            inputRef.current?.focus();
        }
    }, [messages, loading, isOpen]);

    const handleSend = async (textToSend) => {
        const query = (textToSend || message).trim();

        if (!query || loading) return;

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                text: query,
                time: formatMessageTime()
            }
        ]);

        setMessage("");
        setLoading(true);

        try {
            let replyText = "";

            // 1. Try local or configured backend API
            try {
                const response = await chatWithAIAPI(query);
                if (response?.data?.response) {
                    replyText = response.data.response;
                }
            } catch (apiErr) {
                console.warn("API chat attempt failed, using menu knowledge:", apiErr);
            }

            // 2. If API was unreachable or returned empty, use intelligent menu knowledge
            if (!replyText) {
                replyText = getLocalMenuAdvice(query);
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text: replyText,
                    time: formatMessageTime()
                }
            ]);

        } catch (error) {
            console.error("Chat error:", error);

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text: getLocalMenuAdvice(query),
                    time: formatMessageTime()
                }
            ]);

        } finally {
            setLoading(false);
        }
    };

    const resetChat = () => {
        setMessages([
            {
                role: "assistant",
                text: "Chat cleared. What can I help you find on the menu today?",
                time: formatMessageTime()
            }
        ]);
    };

    return (
        <div className="food-assistant-container">
            {/* Floating Trigger Button */}
            {!isOpen && (
                <button
                    type="button"
                    className="chat-toggle-button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open AI Food Assistant"
                    title="Ask AI Food Assistant"
                >
                    <span className="chat-toggle-icon">
                        <Sparkles size={20} />
                    </span>
                    <span className="chat-toggle-label">Ask Chef AI</span>
                    <span className="chat-toggle-ping"></span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <span className="chat-header-avatar">
                                <Bot size={18} />
                            </span>
                            <div>
                                <div className="chat-header-title-row">
                                    <h3>SeatFlow Assistant</h3>
                                    <span className="chat-status-indicator"></span>
                                </div>
                                <p>The Olive Room · Menu Guide</p>
                            </div>
                        </div>

                        <div className="chat-header-actions">
                            <button
                                type="button"
                                className="chat-action-btn"
                                onClick={resetChat}
                                title="Reset conversation"
                                aria-label="Reset conversation"
                            >
                                <RotateCcw size={14} />
                            </button>
                            <button
                                type="button"
                                className="chat-action-btn"
                                onClick={() => setIsOpen(false)}
                                title="Close chat"
                                aria-label="Close chat"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`chat-bubble-row ${msg.role === "user" ? "user-row" : "assistant-row"}`}
                            >
                                {msg.role === "assistant" && (
                                    <span className="chat-message-avatar">
                                        <Utensils size={13} />
                                    </span>
                                )}
                                <div className={`chat-bubble ${msg.role}`}>
                                    <p className="chat-bubble-text">{msg.text}</p>
                                    <span className="chat-bubble-time">{msg.time}</span>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {loading && (
                            <div className="chat-bubble-row assistant-row">
                                <span className="chat-message-avatar">
                                    <Utensils size={13} />
                                </span>
                                <div className="chat-bubble assistant typing-bubble">
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Prompt Suggestions */}
                    {messages.length <= 2 && !loading && (
                        <div className="chat-suggestions">
                            <span className="chat-suggestions-title">Suggestions</span>
                            <div className="chat-suggestions-list">
                                {QUICK_PROMPTS.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className="suggestion-chip"
                                        onClick={() => handleSend(prompt)}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <form
                        className="chat-input-bar"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Ask about ingredients, diet, dishes…"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={loading}
                            maxLength={250}
                        />
                        <button
                            type="submit"
                            className="chat-send-btn"
                            disabled={!message.trim() || loading}
                            aria-label="Send message"
                        >
                            <Send size={15} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
