import { useState, useRef, useEffect } from 'react';
import { askQuestion } from '../services/groqApi';
import type { ChatMessage } from '../types';
import type { BirthDetails } from './InputForm';
import type { PredictionResult } from '../types';

interface ChatProps {
  type: 'single' | 'couple';
  birthDetails: BirthDetails | { person1: BirthDetails; person2: BirthDetails };
  result: PredictionResult;
}

const Chat = ({ type, birthDetails, result }: ChatProps) => {
  // Get language preference from birthDetails
  const getLanguage = (): string => {
    if ('name' in birthDetails) {
      return birthDetails.language || 'English';
    } else if ('person1' in birthDetails) {
      return birthDetails.person1.language || birthDetails.person2.language || 'English';
    }
    return 'English';
  };

  const language = getLanguage();

  // Initial welcome message based on language
  const getWelcomeMessage = (): string => {
    if (language === 'Tamil') {
      return 'வணக்கம்! நான் உங்கள் ஜோதிட உதவியாளர். உங்கள் ஜோசியம் முடிவுகள் பற்றி ஏதேனும் கேள்விகளை கேட்கலாம். உதாரணமாக, உங்கள் தொழில், திருமணம், உடல்நிலை, பரிகாரங்கள் அல்லது உங்கள் கணிப்புகளில் எந்தவொரு வகையைப் பற்றியும் கேட்கலாம்.';
    } else if (language === 'Tamil + English') {
      return 'வணக்கம்! (Hello!) நான் உங்கள் ஜோதிட உதவியாளர் (I am your astrology assistant). உங்கள் ஜோசியம் முடிவுகள் பற்றி ஏதேனும் கேள்விகளை கேட்கலாம் (Feel free to ask questions about your Josiyam results). உதாரணமாக, உங்கள் தொழில், திருமணம், உடல்நிலை, பரிகாரங்கள் பற்றி கேட்கலாம் (For example, you can ask about career, marriage, health, remedies).';
    } else {
      return 'Hello! I\'m your astrology assistant. Feel free to ask me any questions about your Josiyam results. For example, you can ask about your career, marriage, health, remedies, or any specific category from your predictions.';
    }
  };

  // Suggested questions based on language
  const getSuggestedQuestions = (): string[] => {
    if (language === 'Tamil') {
      return [
        'எனது தொழில் வாய்ப்புகளைப் பற்றி மேலும் சொல்லுங்கள்',
        'நீங்கள் பரிகாரங்கள் பரிந்துரைக்கிறீர்களா?',
        'எனது ராசி மற்றும் நட்சத்திரத்தை விளக்குங்கள்',
        'எனது தாசா இருப்பு என்ன அர்த்தம்?',
        'எனது ஆரோக்கிய கணிப்பு எப்படி?',
      ];
    } else if (language === 'Tamil + English') {
      return [
        'எனது தொழில் வாய்ப்புகளைப் பற்றி மேலும் சொல்லுங்கள் (Tell me more about my career prospects)',
        'நீங்கள் பரிகாரங்கள் பரிந்துரைக்கிறீர்களா? (What remedies do you recommend?)',
        'எனது ராசி மற்றும் நட்சத்திரத்தை விளக்குங்கள் (Explain my Rasi and Nakshatra)',
        'எனது தாசா இருப்பு என்ன அர்த்தம்? (What does my Dasa Balance mean?)',
        'எனது ஆரோக்கிய கணிப்பு எப்படி? (How is my health prediction?)',
      ];
    } else {
      return [
        'Tell me more about my career prospects',
        'What remedies do you recommend?',
        'Explain my Rasi and Nakshatra',
        'What does my Dasa Balance mean?',
        'How is my health prediction?',
      ];
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: getWelcomeMessage(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestedQuestions = getSuggestedQuestions();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await askQuestion(
        userMessage.content,
        type,
        birthDetails,
        result,
        messages
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      let errorContent: string;
      if (language === 'Tamil') {
        errorContent = error instanceof Error 
          ? `மன்னிக்கவும், பிழை ஏற்பட்டது: ${error.message}`
          : 'மன்னிக்கவும், பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.';
      } else if (language === 'Tamil + English') {
        errorContent = error instanceof Error 
          ? `மன்னிக்கவும், பிழை ஏற்பட்டது (Sorry, I encountered an error): ${error.message}`
          : 'மன்னிக்கவும், பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும். (Sorry, I encountered an error. Please try again.)';
      } else {
        errorContent = error instanceof Error 
          ? `Sorry, I encountered an error: ${error.message}` 
          : 'Sorry, I encountered an error. Please try again.';
      }
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: errorContent,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-secondary border-2 border-primary rounded-xl shadow-lg overflow-hidden flex flex-col" style={{ height: '600px' }}>
      <div className="bg-primary text-white px-6 py-4 border-b-2 border-accent">
        <h3 className="text-xl font-heading font-bold">
          {language === 'Tamil' 
            ? 'உங்கள் ஜோசியம் பற்றி கேள்விகளை கேட்கவும்'
            : language === 'Tamil + English'
            ? 'உங்கள் ஜோசியம் பற்றி கேள்விகளை கேட்கவும் (Ask Questions About Your Josiyam)'
            : 'Ask Questions About Your Josiyam'}
        </h3>
        <p className="text-sm mt-1 opacity-90">
          {language === 'Tamil' 
            ? 'விளக்கங்கள் மற்றும் தெளிவுபடுத்தல்களைப் பெறுங்கள்'
            : language === 'Tamil + English'
            ? 'விளக்கங்கள் மற்றும் தெளிவுபடுத்தல்களைப் பெறுங்கள் (Get detailed explanations and clarifications)'
            : 'Get detailed explanations and clarifications'}
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-800 border-2 border-primary/20'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 border-2 border-primary/20 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-primary/20">
          <p className="text-xs text-gray-600 mb-2 font-semibold">
            {language === 'Tamil' 
              ? 'பரிந்துரைக்கப்பட்ட கேள்விகள்:'
              : language === 'Tamil + English'
              ? 'பரிந்துரைக்கப்பட்ட கேள்விகள் (Suggested questions):'
              : 'Suggested questions:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInput(question)}
                className="text-xs bg-white border border-primary/30 text-primary px-3 py-1 rounded-full hover:bg-primary/10 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSend} className="border-t-2 border-primary/20 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === 'Tamil' 
                ? 'உங்கள் ஜோசியம் பற்றி கேள்வி கேட்கவும்...'
                : language === 'Tamil + English'
                ? 'உங்கள் ஜோசியம் பற்றி கேள்வி கேட்கவும் (Ask a question about your Josiyam)...'
                : 'Ask a question about your Josiyam...'
            }
            className="flex-1 px-4 py-2 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
