import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Bot, User, Wrench, DollarSign, Zap, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { API_BASE_URL } from '../config/api';

const VehicleChat = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchVehicle();
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchVehicle = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/vehicles/${id}`);
            const data = await response.json();
            setVehicle(data.vehicle);

            // Add initial greeting
            setMessages([{
                role: 'assistant',
                content: `Hi! I'm your AI mechanic for the **${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}**. What seems to be the problem today?`
            }]);
        } catch (error) {
            console.error('Error fetching vehicle:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const sendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    vehicleContext: vehicle,
                    history: messages
                }),
            });

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (action) => {
        let message = "";
        switch(action) {
            case 'maintenance':
                message = "What is the recommended maintenance schedule for this vehicle? Please check oil, brakes, tires, and coolant.";
                break;
            case 'cost':
                message = "I have a problem. Can you estimate the repair cost, time, and severity for common issues with this car?";
                break;
            case 'fuel':
                message = "How can I improve the fuel efficiency of this vehicle? Analyze my potential driving habits.";
                break;
            case 'emergency':
                message = "EMERGENCY: My car broke down. What are the immediate safety steps and temporary fixes?";
                break;
            default:
                return;
        }
        setInput(message);
    };

    if (!vehicle) return <div className="loading-container"><div className="loading-spinner"></div></div>;

    return (
        <div className="chat-page">
            <div className="chat-header">
                <button onClick={() => navigate('/')} className="back-icon-btn">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2>{vehicle.year} {vehicle.make} {vehicle.model}</h2>
                    <p className="subtitle">AI Diagnostic Assistant</p>
                </div>
            </div>

            <div className="chat-container">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role}`}>
                        <div className="message-avatar">
                            {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                        </div>
                        <div className="message-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="message assistant">
                        <div className="message-avatar"><Bot size={20} /></div>
                        <div className="message-content typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
                <div className="quick-actions">
                    <button onClick={() => handleQuickAction('maintenance')} title="Maintenance Schedule">
                        <Wrench size={16} /> Maintenance
                    </button>
                    <button onClick={() => handleQuickAction('cost')} title="Cost Estimator">
                        <DollarSign size={16} /> Costs
                    </button>
                    <button onClick={() => handleQuickAction('fuel')} title="Fuel Efficiency">
                        <Zap size={16} /> Efficiency
                    </button>
                    <button onClick={() => handleQuickAction('emergency')} className="emergency-btn" title="Emergency Guide">
                        <AlertTriangle size={16} /> Emergency
                    </button>
                </div>

                <form onSubmit={sendMessage} className="chat-input-form">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe the problem..."
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !input.trim()}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VehicleChat;
