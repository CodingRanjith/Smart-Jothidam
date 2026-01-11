import { useState } from 'react';
import InputForm from '../components/InputForm';
import type { BirthDetails } from '../components/InputForm';
import Loader from '../components/Loader';
import PersonCard from '../components/PersonCard';
import { calculateAstrologyDetails } from '../services/astrologyCalculator';
import type { AstrologyDetails } from '../types';
import { askQuestion } from '../services/groqApi';
import type { ChatMessage } from '../types';

const Calculator = () => {
  const [loading, setLoading] = useState(false);
  const [calculationResult, setCalculationResult] = useState<AstrologyDetails | null>(null);
  const [birthDetails, setBirthDetails] = useState<BirthDetails | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [explaining, setExplaining] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleSubmit = async (details: BirthDetails | { person1: BirthDetails; person2: BirthDetails }) => {
    if ('name' in details) {
      setLoading(true);
      setCalculationResult(null);
      setAiExplanation('');
      setChatMessages([]);
      try {
        // Calculate astrology details
        const result = await calculateAstrologyDetails(details);
        setCalculationResult(result);
        setBirthDetails(details);
        
        // Automatically get AI explanation
        setExplaining(true);
        try {
          const explanation = await askQuestion(
            `Please explain these astrology calculations in detail. Rasi: ${result.rasi}, Nakshatra: ${result.nakshatra}, Lagnam: ${result.lagnam}, Dosham: ${result.dosham}, Dasa Balance: ${result.dasaBalance}. Give a comprehensive explanation of what these mean.`,
            'single',
            details,
            {
              basicDetails: result,
              predictions: {}
            },
            []
          );
          setAiExplanation(explanation);
          setChatMessages([
            {
              role: 'assistant',
              content: `Here's a detailed explanation of your astrology calculations:\n\n${explanation}\n\nFeel free to ask me any questions about your calculations!`
            }
          ]);
        } catch (error) {
          console.error('Error getting AI explanation:', error);
          setAiExplanation('Could not generate AI explanation. Please try asking a question in the chat below.');
        } finally {
          setExplaining(false);
        }
      } catch (error) {
        alert(error instanceof Error ? error.message : 'An error occurred during calculation');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || !calculationResult || !birthDetails) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput.trim(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await askQuestion(
        userMessage.content,
        'single',
        birthDetails,
        {
          basicDetails: calculationResult,
          predictions: {}
        },
        chatMessages
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: error instanceof Error 
          ? `Sorry, I encountered an error: ${error.message}` 
          : 'Sorry, I encountered an error. Please try again.',
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow container mx-auto px-4 py-12">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-primary mb-4 text-center">
            Joshiyam Calculator
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Enter birth details to calculate your astrology details instantly. Get AI-powered explanations of your calculations.
          </p>

          {!calculationResult ? (
            <div className="max-w-2xl mx-auto">
              <InputForm onSubmit={handleSubmit} isCouple={false} />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Calculation Results */}
              <div className="bg-secondary border-2 border-primary rounded-xl p-6 shadow-lg">
                <h2 className="text-3xl font-heading font-bold text-primary mb-6 text-center border-b-4 border-accent pb-3">
                  Calculated Astrology Details
                </h2>
                <PersonCard
                  name={birthDetails?.name || 'Person'}
                  details={calculationResult}
                />
                {calculationResult.disclaimer && (
                  <div className="mt-4 bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-semibold mb-2">📊 Calculation Method:</p>
                    <p className="text-xs text-blue-700">{calculationResult.disclaimer}</p>
                    {calculationResult.ayanamsa && (
                      <p className="text-xs text-blue-700 mt-2">
                        <span className="font-semibold">Ayanamsa:</span> {calculationResult.ayanamsa}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* AI Explanation */}
              {(explaining || aiExplanation) && (
                <div className="bg-secondary border-2 border-primary rounded-xl p-6 shadow-lg">
                  <h2 className="text-2xl font-heading font-bold text-primary mb-4 border-b-2 border-accent pb-2">
                    AI Explanation
                  </h2>
                  {explaining ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      <span className="text-gray-600 ml-2">Generating explanation...</span>
                    </div>
                  ) : (
                    <div className="text-gray-700 whitespace-pre-wrap">{aiExplanation}</div>
                  )}
                </div>
              )}

              {/* Chat Interface */}
              <div className="bg-secondary border-2 border-primary rounded-xl shadow-lg overflow-hidden">
                <div className="bg-primary text-white px-6 py-4 border-b-2 border-accent">
                  <h3 className="text-xl font-heading font-bold">Ask Questions About Your Calculations</h3>
                  <p className="text-sm mt-1 opacity-90">Get detailed explanations and clarifications</p>
                </div>

                {/* Messages Area */}
                <div className="p-4 space-y-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {chatMessages.length === 0 && !explaining && (
                    <div className="text-center text-gray-500 py-4">
                      Ask me anything about your astrology calculations!
                    </div>
                  )}
                  {chatMessages.map((message, index) => (
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
                  {chatLoading && (
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
                </div>

                {/* Input Area */}
                <form onSubmit={handleChatSend} className="border-t-2 border-primary/20 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask a question about your calculations..."
                      className="flex-1 px-4 py-2 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      disabled={chatLoading}
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || chatLoading}
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setCalculationResult(null);
                    setAiExplanation('');
                    setChatMessages([]);
                    setBirthDetails(null);
                  }}
                  className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent/90 transition-colors font-semibold"
                >
                  Calculate New
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;

