'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

const mockResponses: Record<string, string> = {
  'cloud platform': 'The Cloud Platform is our Kubernetes-based hosting platform on AWS. You can find the full user guide at /docs/cloud-platform. It\'s the recommended default for hosting new services — you\'ll need to containerise your application and deploy via GitHub Actions.',
  'modernisation platform': 'The Modernisation Platform provides AWS accounts for applications that don\'t fit Cloud Platform — typically legacy or non-containerised workloads. Documentation is available at /docs/modernisation-platform.',
  'analytical platform': 'The Analytical Platform is our data analysis environment. It provides tools for data scientists and analysts including RStudio, JupyterHub, and Airflow. See /docs/analytical-platform for details.',
  'api': 'For API documentation, check the Documentation section. We follow the GOV.UK API design standards — RESTful design, sensible versioning, and clear error responses. See our API Design Standards guideline for more.',
  'deploy': 'To deploy to Cloud Platform: 1) Containerise your app (Dockerfile), 2) Set up a namespace in cloud-platform-environments, 3) Create a GitHub Actions pipeline to build, push to ECR, and apply K8s manifests. Full guide at /docs/cloud-platform/deploying-an-app.',
  'help': 'I can help you find information about:\n\n• **Cloud Platform** — Kubernetes hosting\n• **Modernisation Platform** — AWS account hosting\n• **Analytical Platform** — Data analysis tools\n• **API standards** — Design guidelines\n• **Deployment** — How to get your service live\n\nJust ask me a question!',
};

function findResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(mockResponses)) {
    if (lower.includes(key)) {
      return response;
    }
  }
  return 'I\'m not sure about that yet — this is a demo with limited responses. Try asking about Cloud Platform, Modernisation Platform, Analytical Platform, APIs, or deployment. In the full version, I\'ll be powered by an LLM with access to all portal documentation.';
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: 'Hello! I\'m the Developer Portal assistant. I can help you find documentation, products, and guidelines. What are you looking for?',
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: Message = { role: 'user', content: trimmed };
    const botResponse: Message = { role: 'bot', content: findResponse(trimmed) };

    setMessages((prev) => [...prev, userMessage, botResponse]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        className="app-chatbot-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
        title="Chat with the Developer Portal assistant"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className="app-chatbot-panel" role="dialog" aria-label="Chat assistant">
          <div className="app-chatbot-panel__header">
            <span>Developer Portal Assistant</span>
            <button
              className="app-chatbot-panel__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="app-chatbot-panel__messages" aria-live="polite">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`app-chatbot-panel__message app-chatbot-panel__message--${msg.role === 'user' ? 'user' : 'bot'}`}
              >
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="app-chatbot-panel__input">
            <input
              className="app-chatbot-panel__text-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              aria-label="Type your message"
            />
            <button className="app-chatbot-panel__send" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
