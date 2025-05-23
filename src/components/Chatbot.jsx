import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, UserCircle2, Loader2, AlertCircle, Send } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import trainData from './trainData.json';

const Chatbot = () => {
    const [chatMessages, setChatMessages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const textareaRef = React.useRef(null);

    useEffect(() => {
        AOS.init({
            once: false,
            duration: 1000,
        });
    }, []);

    const formatDate = useCallback((timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    }, []);

    const handleTextareaChange = (e) => {
        setNewMessage(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const createContextPrompt = (userMessage) => {
        let context = "Jawab:";
        for (const [key, value] of Object.entries(trainData)) {
            context += `${key}: ${value}\n`;
        }
        context += `\n"Informasi(jika perlu):${userMessage}"\n`;
        context += "Buat jawaban atau tanggapi pertanyaan pengguna,gunakan informasi hanya jika dibutuhkan, jika tidak, jawab dengan jawaban yang tepat dan akurat sesuai pertanyaan pengguna.\n";
        return encodeURIComponent(context);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setError('');
        setIsSubmitting(true);

        const userMessage = {
            id: Date.now().toString(),
            content: newMessage,
            isBot: false,
            createdAt: new Date().getTime(),
        };

        setChatMessages((prev) => [...prev, userMessage]);

        try {
            const contextPrompt = createContextPrompt(newMessage);
            let sessionId = sessionStorage.getItem('sessionId');
            if (!sessionId) {
                sessionId = crypto.randomUUID();
                sessionStorage.setItem('sessionId', sessionId);
            }

            const response = await fetch(
                `https://fastrestapis.fasturl.cloud/aillm/gpt-4o-mini?ask=${encodeURIComponent(
                    newMessage
                )}&style=${contextPrompt}&sessionId=${sessionId}`
            );
            console.log(response);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            const botResponse = data.result || 'Maaf, tidak ada respons dari AI.';

            const botMessage = {
                id: Date.now().toString() + '-bot',
                content: botResponse,
                isBot: true,
                createdAt: new Date().getTime(),
            };

            setChatMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Error fetching response:', error);
            const errorMsg = error.message.includes('404')
                ? 'API endpoint not found. Please check the API configuration.'
                : error.message.includes('CORS')
                    ? 'CORS error: API does not allow direct browser requests.'
                    : 'Terjadi kesalahan{ERR 156}.';
            setError(errorMsg);

            setChatMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    content: 'Maaf, terjadi kesalahan. Coba lagi.',
                    isBot: true,
                    createdAt: new Date().getTime(),
                },
            ]);
        } finally {
            setIsSubmitting(false);
            setNewMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const Message = ({ message, isBot }) => (
        <div
            className={`px-4 pt-4 pb-2 rounded-xl ${
                isBot ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/5 border-white/10'
            } hover:bg-opacity-20 transition-all group hover:shadow-lg hover:-translate-y-0.5`}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`p-2 rounded-full ${
                        isBot ? 'bg-black text-indigo-300' : 'bg-white/10 text-white/60'
                    } group-hover:bg-opacity-80 transition-colors`}
                >
                    <UserCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <h4 className="font-medium text-white">{isBot ? 'ChatBot AI' : 'You'}</h4>
                        <span className="text-xs text-white/50 whitespace-nowrap">
                            {formatDate(message.createdAt)}
                        </span>
                    </div>
                    <p className="text-white/80 text-sm break-words leading-relaxed relative bottom-2">
                        {message.content}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        //for Background
        <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
            <div
                className="max-w-7xl w-full bg-gradient-to-b from-white/10 to-white/5 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl"
                data-aos="fade-up"
                data-aos-duration="1000"
            >
                <div className="p-6 border-b border-white/10" data-aos="fade-down" data-aos-duration="800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-500/20">
                            <MessageCircle className="w-6 h-6 text-indigo-300" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                            Chat with Gatot Koco AI <span className="text-xl text-indigo-300">({chatMessages.length})</span>
                        </h3>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {error && (
                        <div className="flex items-center gap-2 p-4 text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-white">
                                Message <span className="text-red-300">*</span>
                            </label>
                            <textarea
                                ref={textareaRef}
                                value={newMessage}
                                onChange={handleTextareaChange}
                                placeholder="Ask about anything..."
                                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none min-h-[120px]"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="relative w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-medium text-white overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-12 group-hover:translate-y-0 transition-transform duration-300" />
                            <div className="relative flex items-center justify-center gap-2">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>Send Message</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="space-y-4 h-[300px] overflow-y-auto custom-scrollbar" id="chat-history">
                        {chatMessages.length === 0 ? (
                            <div className="text-center py-8">
                                <UserCircle2 className="w-12 h-12 text-indigo-300 mx-auto mb-3 opacity-50" />
                                <p className="text-white/40">No messages yet. Ask about GatotKaca</p>
                            </div>
                        ) : (
                            chatMessages.map((message) => (
                                <Message key={message.id} message={message} isBot={message.isBot} />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(99, 102, 241, 0.5);
                    border-radius: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(99, 102, 241, 0.7);
                }
            `}</style>
        </div>
    );
};

export default Chatbot;