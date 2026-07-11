import { Bot, User } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.role === 'assistant';

  return (
    <div className={`flex gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-7 h-7 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
          isBot
            ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-tl-sm border border-gray-100 dark:border-gray-600 shadow-sm'
            : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-tr-sm'
        }`}
      >
        <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>

      {!isBot && (
        <div className="w-7 h-7 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-gray-500 dark:text-gray-300" />
        </div>
      )}
    </div>
  );
}
