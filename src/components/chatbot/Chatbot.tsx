'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Sparkles,
  User,
  RotateCcw,
  Clock,
  Shield,
  AlertTriangle,
  Home,
  MapPin,
  DollarSign,
  Star,
} from 'lucide-react';
import { CHATBOT_SUGGESTIONS } from '@/lib/constants';
import { chatbotApi } from '@/lib/api';
import { ChatbotResponse } from '@/types';

interface LocalMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  aiMode?: boolean;
  responseTimeMs?: number;
  confidence?: number;
  matchedProperties?: ChatbotResponse['matchedProperties'];
  isTyping?: boolean;
}

const WELCOME_MESSAGE: LocalMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Habari! I'm NyumbaSalama AI, your housing assistant. I can help you find rooms near UDSM, ARU, MUHAS, DIT, and all universities in Dar es Salaam. Just ask me about rooms, prices, locations, or amenities!",
  timestamp: new Date().toISOString(),
  aiMode: true,
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<LocalMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [useFallback, setUseFallback] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const simulateTyping = useCallback((fullText: string, msgId: string) => {
    setStreamingId(msgId);
    setStreamingText('');
    let index = 0;
    const charsPerTick = 3;
    const tickMs = 15;

    const interval = setInterval(() => {
      index += charsPerTick;
      if (index >= fullText.length) {
        setStreamingText(fullText);
        clearInterval(interval);
        setStreamingId(null);
        setStreamingText('');

        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId ? { ...m, content: fullText, isTyping: false } : m,
          ),
        );
      } else {
        setStreamingText(fullText.substring(0, index));
      }
    }, tickMs);

    return () => clearInterval(interval);
  }, []);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMsg: LocalMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const thinkingMsgId = `thinking-${Date.now()}`;
    const thinkingMsg: LocalMessage = {
      id: thinkingMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isTyping: true,
      aiMode: true,
    };
    setMessages((prev) => [...prev, thinkingMsg]);

    try {
      const res = await chatbotApi.ask(messageText);
      const data: ChatbotResponse = res.data;

      const botContent = data?.response || "I couldn't process your question. Please try again.";
      const botMsgId = `bot-${Date.now()}`;

      setMessages((prev) => prev.filter((m) => m.id !== thinkingMsgId));

      const botMsg: LocalMessage = {
        id: botMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        aiMode: data?.aiMode ?? false,
        responseTimeMs: data?.responseTimeMs ?? 0,
        confidence: data?.confidence ?? 0,
        matchedProperties: data?.matchedProperties ?? [],
        isTyping: false,
      };

      setMessages((prev) => [...prev, botMsg]);

      if (data?.aiMode === false && !useFallback) {
        setUseFallback(true);
      }
      if (data?.aiMode === true && useFallback) {
        setUseFallback(false);
      }

      simulateTyping(botContent, botMsgId);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== thinkingMsgId));

      const errorMsg: LocalMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content:
          "Samahani, I'm having trouble connecting right now. Please try asking again or browse properties on the homepage.",
        timestamp: new Date().toISOString(),
        aiMode: false,
      };
      setMessages((prev) => [...prev, errorMsg]);
      setUseFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = (msgId: string) => {
    const msgIndex = messages.findIndex((m) => m.id === msgId);
    if (msgIndex > 0) {
      const userMsg = messages[msgIndex - 1];
      if (userMsg.role === 'user') {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
        handleSend(userMsg.content);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const showSuggestions = messages.length <= 1;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-orange-100 dark:border-gray-700 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center relative">
                    <Bot className="w-5 h-5" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">NyumbaSalama AI</h4>
                    <p className="text-white/70 text-xs flex items-center gap-1">
                      {useFallback ? (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          Basic Assistant
                        </>
                      ) : (
                        <>
                          <Shield className="w-3 h-3" />
                          AI-Powered
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
              {useFallback && messages.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs mx-2">
                  <AlertTriangle className="w-3 h-3" />
                  AI temporarily unavailable. Using basic assistant.
                </div>
              )}

              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  streamingId={streamingId}
                  streamingText={streamingText}
                  formatTime={formatTime}
                  onRetry={handleRetry}
                />
              ))}

              {isLoading && !streamingId && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 rounded-2xl shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                    <span className="text-xs text-gray-400">Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {showSuggestions && (
              <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />Quick suggestions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CHATBOT_SUGGESTIONS.slice(0, 6).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSend(suggestion)}
                      className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-xs hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:text-white dark:placeholder-gray-400 transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-red-500 rotate-90 shadow-red-200'
            : 'bg-gradient-to-r from-orange-500 to-amber-600 shadow-orange-200 hover:scale-110'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </>
  );
}

function MessageBubble({
  message,
  streamingId,
  streamingText,
  formatTime,
  onRetry,
}: {
  message: LocalMessage;
  streamingId: string | null;
  streamingText: string;
  formatTime: (ms: number) => string;
  onRetry: (id: string) => void;
}) {
  const isBot = message.role === 'assistant';
  const isStreaming = streamingId === message.id;
  const isThinking = message.isTyping && !isStreaming;
  const displayContent = isStreaming ? streamingText : message.content;
  const hasMeta = isBot && !isStreaming && !isThinking && (message.aiMode !== undefined || message.responseTimeMs);

  return (
    <div className={`flex gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {/* Bot Avatar */}
      {isBot && (
        <div className="w-7 h-7 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className="flex flex-col gap-1 max-w-[82%]">
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm ${
            isBot
              ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-tl-sm border border-gray-100 dark:border-gray-600 shadow-sm'
              : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-tr-sm'
          }`}
        >
          {/* Streaming cursor */}
          {(isStreaming || isThinking) && !displayContent && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          )}

          {/* Content */}
          {displayContent && (
            <div className="leading-relaxed whitespace-pre-wrap">
              {renderContent(displayContent)}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-orange-500 ml-0.5 animate-pulse rounded-sm" />
              )}
            </div>
          )}
        </div>

        {/* Metadata */}
        {hasMeta && displayContent && !isStreaming && (
          <div className="flex items-center gap-2 px-1">
            {message.confidence !== undefined && message.confidence > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                <Shield className={`w-2.5 h-2.5 ${message.confidence > 0.6 ? 'text-green-500' : message.confidence > 0.4 ? 'text-amber-500' : 'text-gray-400'}`} />
                {Math.round(message.confidence * 100)}%
              </span>
            )}
            {message.responseTimeMs !== undefined && message.responseTimeMs > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                <Clock className="w-2.5 h-2.5" />
                {formatTime(message.responseTimeMs)}
              </span>
            )}
            {!message.aiMode && message.role === 'assistant' && (
              <button
                onClick={() => onRetry(message.id)}
                className="inline-flex items-center gap-0.5 text-[10px] text-orange-500 hover:text-orange-600 transition-colors"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Retry
              </button>
            )}
          </div>
        )}

        {/* Property Cards */}
        {isBot && !isStreaming && !isThinking && message.matchedProperties && message.matchedProperties.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mt-1">
            {message.matchedProperties.slice(0, 3).map((prop, idx) => (
              <div
                key={prop.propertyId || idx}
                className="flex-shrink-0 w-44 bg-white dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 p-2.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = `/property/${prop.propertyId}`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-1">
                    <Home className="w-3 h-3 text-orange-500" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate max-w-[120px]">
                      {prop.title || 'Property'}
                    </span>
                  </div>
                  {prop.score !== undefined && (
                    <span className="text-[10px] bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded-full font-medium">
                      {Math.round(prop.score * 100)}%
                    </span>
                  )}
                </div>
                {prop.price !== undefined && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                    <DollarSign className="w-3 h-3" />
                    TSh {prop.price.toLocaleString()}/mo
                  </div>
                )}
                {prop.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                    <MapPin className="w-3 h-3" />
                    {prop.location}
                  </div>
                )}
                {prop.rating !== undefined && prop.rating > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {prop.rating}/5
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isBot && (
        <div className="w-7 h-7 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-gray-500 dark:text-gray-300" />
        </div>
      )}
    </div>
  );
}

function renderContent(text: string): React.ReactNode {
  if (!text) return text;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  let inList = false;
  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // Bold headers
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push(
        <p key={i} className="font-semibold mt-2 mb-1">
          {trimmed.replace(/\*\*/g, '')}
        </p>,
      );
      return;
    }

    // Numbered list items
    if (/^\d+[.)]\s/.test(trimmed)) {
      if (!inList) {
        inList = true;
      }
      elements.push(
        <div key={i} className="flex gap-2 py-0.5">
          <span className="font-medium text-orange-500 min-w-[20px]">
            {trimmed.match(/^(\d+)/)?.[1]}.
          </span>
          <span>{trimmed.replace(/^\d+[.)]\s*/, '')}</span>
        </div>,
      );
      return;
    }

    // Dash list items
    if (trimmed.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex gap-2 py-0.5 ml-1">
          <span className="text-orange-400">-</span>
          <span>{trimmed.substring(2)}</span>
        </div>,
      );
      return;
    }

    // Price highlight
    if (/TSh\s*[\d,]+/.test(trimmed)) {
      elements.push(
        <p key={i} className="py-0.5">
          {trimmed.replace(
            /(TSh\s*[\d,]+(?:\/month)?)/g,
            '<span class="font-bold text-orange-600">$1</span>',
          ).split(/<span class="font-bold text-orange-600">|<\/span>/).map((part, idx) =>
            idx % 2 === 1 ? (
              <span key={idx} className="font-bold text-orange-600 dark:text-orange-400">{part}</span>
            ) : (
              <span key={idx}>{part}</span>
            )
          )}
        </p>,
      );
      return;
    }

    // Empty lines
    if (!trimmed) {
      elements.push(<div key={i} className="h-1.5" />);
      return;
    }

    // Normal text
    elements.push(<p key={i} className="py-0.5">{trimmed}</p>);
  });

  return <>{elements}</>;
}
