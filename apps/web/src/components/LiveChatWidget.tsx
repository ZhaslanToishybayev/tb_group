'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Phone, Mail } from 'lucide-react';

type ChatMessage = {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
};

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: 'Здравствуйте! Чем можем помочь?',
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: messages.length + 2,
        text: 'Спасибо за ваше сообщение! Наш менеджер свяжется с вами в ближайшее время.',
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96"
          >
            <div className="rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-lg shadow-2xl shadow-blue-500/10 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-400 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        <MessageCircle size={20} />
                      </div>
                      <motion.div
                        className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-blue-500"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">TB Group Support</h3>
                      <p className="text-xs text-blue-100">Обычно отвечает мгновенно</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleChat}
                    className="rounded-lg bg-white/10 p-2 hover:bg-white/20 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.isBot
                          ? 'bg-white/10 text-white'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="px-4 pb-2">
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 transition-colors">
                    <Phone size={12} />
                    <span>Заказать звонок</span>
                  </button>
                  <button className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 transition-colors">
                    <Mail size={12} />
                    <span>Написать email</span>
                  </button>
                </div>
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="border-t border-white/10 p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Введите сообщение..."
                    className="flex-1 rounded-lg border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isOpen
            ? 'bg-red-500 hover:bg-red-400 shadow-red-500/30'
            : 'bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-300 shadow-blue-500/30'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <>
            <MessageCircle size={24} className="text-white" />
            <motion.div
              className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full opacity-75"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
          </>
        )}
      </motion.button>

      {/* Notification Badge */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed bottom-20 right-6 z-40"
          >
            <div className="rounded-full bg-white text-slate-900 px-3 py-1 text-xs font-medium shadow-lg">
              Новые сообщения
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
