import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';

export default function Chatbot({ profile }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const name = profile?.full_name;

  useEffect(() => {
    setMessages([
      {
        role: 'bot',
        content: `👋 Hi! I'm an AI assistant. Ask me anything about ${name || 'this developer'} — their skills, projects, experience, or how to get in touch!`,
      },
    ]);
  }, [name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    setOpen((o) => {
      const next = !o;
      if (next) setTimeout(() => inputRef.current?.focus(), 300);
      return next;
    });
  };

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || sending) return;
    setInput('');
    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'bot')
      .map((m) => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }));

    setMessages((m) => [...m, { role: 'user', content: msg }, { role: 'bot', content: '…', typing: true }]);
    setSending(true);

    try {
      const { data } = await api.sendChat({ message: msg, history });
      setMessages((m) => {
        const withoutTyping = m.filter((x) => !x.typing);
        return [...withoutTyping, { role: 'bot', content: data.reply || 'Sorry, something went wrong.' }];
      });
    } catch {
      setMessages((m) => {
        const withoutTyping = m.filter((x) => !x.typing);
        return [...withoutTyping, { role: 'bot', content: 'Connection error. Please try again.' }];
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button
        className="chat-bubble"
        onClick={toggleChat}
        aria-label="Open AI assistant chat"
        aria-expanded={open}
        type="button"
      >
        <i className={`bi ${open ? 'bi-x-lg' : 'bi-chat-dots-fill'}`} />
        {!open && <span className="badge-dot" />}
      </button>

      <div className={`chat-panel ${open ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-avatar"><i className="bi bi-robot" /></div>
          <div className="chat-header-info">
            <div className="chat-header-name">AI Assistant {name && `— ${name}`}</div>
            <div className="chat-header-status">
              <span style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%', display: 'inline-block' }} />
              Online
            </div>
          </div>
          <button className="chat-close" onClick={toggleChat} aria-label="Close chat" type="button">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="chat-messages" role="log" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role} ${m.typing ? 'typing' : ''}`}>
              {m.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-row">
          <label htmlFor="chatInput" className="sr-only">Type your message</label>
          <textarea
            id="chatInput"
            ref={inputRef}
            className="chat-input"
            rows={1}
            placeholder="Ask me anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="chat-send" onClick={sendMessage} disabled={sending} aria-label="Send message" type="button">
            <i className="bi bi-send-fill" />
          </button>
        </div>
      </div>
    </>
  );
}
