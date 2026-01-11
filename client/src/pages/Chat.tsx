import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import Groq from 'groq-sdk';

// API Key for Groq (should be moved to environment variable in production)
const apiKey = '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';

const groq = new Groq({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = `You are a highly experienced traditional Tamil astrologer (Josiyar) with deep knowledge of:
- Tamil Rasi system interpretation
- Nakshatra meanings and influences
- Dasa & Bhukti concepts
- Traditional remedies (Pariharam)
- Astrological predictions and interpretations
- General astrology questions and explanations

You help users understand Tamil astrology concepts, answer questions, and provide guidance.
Be respectful, accurate, and clear. Use traditional Tamil astrology terminology when appropriate.
Keep responses conversational and easy to understand.`;

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Tamil astrology assistant. Feel free to ask me any questions about astrology, Rasi, Nakshatra, Dasa, remedies, or any other astrology-related topics. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      // For general chat, we'll use a simplified approach
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: userMessage.content }
        ] as any,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
      });

      const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: error instanceof Error 
          ? `Sorry, I encountered an error: ${error.message}` 
          : 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    'What is Rasi in Tamil astrology?',
    'Explain Nakshatra and its importance',
    'What is Dasa Balance?',
    'Tell me about Mangal Dosha',
    'What are some common remedies (Pariharam)?',
    'Explain the importance of Lagnam',
  ];

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat cleared. How can I help you with astrology questions?',
      },
    ]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-heading font-bold text-primary mb-4">
              Astrology Chat Assistant
            </h1>
            <p className="text-gray-600">
              Ask any questions about Tamil astrology. I'm here to help!
            </p>
          </div>

          <div className="bg-secondary border-2 border-primary rounded-xl shadow-lg overflow-hidden flex flex-col" style={{ height: '700px' }}>
            <div className="bg-primary text-white px-6 py-4 border-b-2 border-accent flex justify-between items-center">
              <div>
                <h3 className="text-xl font-heading font-bold">Chat with Astrology AI</h3>
                <p className="text-sm mt-1 opacity-90">Ask questions about Tamil astrology</p>
              </div>
              <button
                onClick={handleClearChat}
                className="bg-accent/80 hover:bg-accent px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Clear Chat
              </button>
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
                <p className="text-xs text-gray-600 mb-2 font-semibold">Suggested questions:</p>
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
                  placeholder="Ask a question about Tamil astrology..."
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
        </div>
      </div>
    </div>
  );
};

export default Chat;

