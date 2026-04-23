'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi ${user?.full_name || 'there'}! I'm your AI Career Assistant. I can help you with career advice, skill development, job search strategies, and personalized recommendations. What would you like to talk about today?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
  }, [token, loading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('job') || input.includes('career') || input.includes('work')) {
      return "Based on your profile, I'd recommend focusing on data analysis roles. The job market is strong for data analysts with Python and SQL skills. Would you like me to suggest specific job titles or help you prepare for interviews?";
    }

    if (input.includes('skill') || input.includes('learn') || input.includes('course')) {
      return "Great question! For someone in your region, I recommend starting with our Data Analysis Fundamentals course, followed by Python for Data Science. These will give you a solid foundation. Would you like me to create a personalized learning plan?";
    }

    if (input.includes('resume') || input.includes('cv') || input.includes('portfolio')) {
      return "Your portfolio is a great way to showcase your skills! I notice you haven't uploaded a resume yet. I can help you create one using our portfolio builder. Would you like me to guide you through the process?";
    }

    if (input.includes('interview') || input.includes('prepare')) {
      return "Interview preparation is crucial! Common questions for data analyst roles include SQL queries, data visualization techniques, and problem-solving scenarios. I can help you practice with mock interviews or provide specific tips for your target companies.";
    }

    return "That's an interesting point! Could you tell me more about what you're looking to achieve? Whether it's career guidance, skill development, or job search strategies, I'm here to help you navigate your career journey.";
  };

  const suggestedQuestions = [
    "What skills should I learn for a data analyst role?",
    "How can I improve my resume?",
    "What are the best job search strategies?",
    "Can you help me prepare for interviews?",
    "What's the job market like for data professionals?"
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-primary/20 glow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <span className="text-4xl mr-4">🤖</span>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground font-display">AI Career Assistant</h1>
                <p className="text-text-muted">Get personalized career advice and guidance</p>
              </div>
            </div>
            <Link href="/dashboard" className="text-primary hover:text-primary-dark font-medium inline-flex items-center transition-colors whitespace-nowrap">
              <span className="mr-2">←</span> Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-surface/80 backdrop-blur-sm rounded-2xl border border-primary/20 glow h-96 md:h-[500px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary text-background'
                        : 'bg-surface-light text-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-primary-dark' : 'text-text-muted'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-surface-light text-foreground px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-text-muted ml-2">AI is typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-primary/20 p-6">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about your career..."
                className="flex-1 px-4 py-3 bg-surface-light border border-primary/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground placeholder-text-muted transition-all"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-primary hover:bg-primary-dark text-background px-6 py-3 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed glow"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 mt-8 border border-primary/20 glow">
          <h2 className="text-2xl font-bold text-foreground mb-6 font-display">Suggested Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="text-left p-4 bg-surface-light hover:bg-primary/20 text-foreground hover:text-primary rounded-xl transition text-sm border border-primary/20 hover:border-primary/50"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/learning"
              className="block p-4 bg-white rounded-lg hover:shadow-md transition text-center"
            >
              <span className="text-2xl mb-2 block">📚</span>
              <div className="font-medium text-gray-900">Browse Courses</div>
              <div className="text-sm text-gray-600">Find learning resources</div>
            </Link>
            <Link
              href="/portfolio"
              className="block p-4 bg-white rounded-lg hover:shadow-md transition text-center"
            >
              <span className="text-2xl mb-2 block">📄</span>
              <div className="font-medium text-gray-900">Update Portfolio</div>
              <div className="text-sm text-gray-600">Showcase your skills</div>
            </Link>
            <button className="block p-4 bg-white rounded-lg hover:shadow-md transition text-center">
              <span className="text-2xl mb-2 block">🎯</span>
              <div className="font-medium text-gray-900">Career Assessment</div>
              <div className="text-sm text-gray-600">Get personalized insights</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}