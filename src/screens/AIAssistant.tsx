import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, Loader2, Mic, Trash2, Menu, MessageSquare, Plus, Navigation, Pencil, X } from 'lucide-react';
import { cn } from '../layouts/MobileLayout';
import { type ChatMessage, generateDriveRecommendation, generateThreadTitle } from '../services/ai';
import { voiceService } from '../services/voice';

interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
}

const DEFAULT_WELCOME_MSG = {
  id: 'msg_welcome',
  role: 'assistant' as const,
  text: '안녕하세요! MOODRIVE AI 비서 HK입니다. 오늘 달리실 기분이나 목적지를 알려주세요. 최고의 코스를 추천해 드릴게요!'
};

const getThreadIcon = (title: string) => {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  const match = title.match(emojiRegex);
  if (match) {
    return <span className="text-lg leading-none">{match[0]}</span>;
  }
  return <MessageSquare size={18} />;
};

export const AIAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Sidebar hover & pin states (overlay drawer style)
  const [isHovered, setIsHovered] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(() => {
    return localStorage.getItem('moodrive_chat_sidebar_pinned') === 'true';
  });

  // Hover preview states
  const [hoveredThreadId, setHoveredThreadId] = useState<string | null>(null);
  const [hoveredY, setHoveredY] = useState(0);

  // Rename states
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load threads from localStorage or initialize with a default thread
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    const saved = localStorage.getItem('moodrive_chat_threads');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'thread_default',
        title: '새로운 대화',
        messages: [DEFAULT_WELCOME_MSG]
      }
    ];
  });

  // Track the active thread ID
  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    const savedId = localStorage.getItem('moodrive_active_thread_id');
    const savedThreads = localStorage.getItem('moodrive_chat_threads');
    if (savedId && savedThreads) {
      try {
        const parsed = JSON.parse(savedThreads) as ChatThread[];
        if (parsed.some(t => t.id === savedId)) return savedId;
      } catch (e) {}
    }
    return 'thread_default';
  });

  // Save to localStorage whenever threads change
  useEffect(() => {
    localStorage.setItem('moodrive_chat_threads', JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    localStorage.setItem('moodrive_active_thread_id', activeThreadId);
    scrollToBottom();
  }, [activeThreadId]);

  useEffect(() => {
    localStorage.setItem('moodrive_chat_sidebar_pinned', String(isSidebarPinned));
  }, [isSidebarPinned]);

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0] || { id: '', title: '', messages: [] };
  const messages = activeThread.messages;

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startNewChat = () => {
    const newId = `thread_${Date.now()}`;
    const newThread: ChatThread = {
      id: newId,
      title: '새로운 대화',
      messages: [DEFAULT_WELCOME_MSG]
    };
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newId);
  };

  const deleteChat = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const updatedThreads = threads.filter(t => t.id !== threadId);
    
    if (updatedThreads.length === 0) {
      const defaultId = 'thread_default';
      const defaultThread = {
        id: defaultId,
        title: '새로운 대화',
        messages: [DEFAULT_WELCOME_MSG]
      };
      setThreads([defaultThread]);
      setActiveThreadId(defaultId);
      return;
    }

    setThreads(updatedThreads);

    if (activeThreadId === threadId) {
      setActiveThreadId(updatedThreads[0].id);
    }
  };

  const handleRenameSave = (threadId: string) => {
    if (editingTitle.trim()) {
      setThreads(prev => prev.map(t => {
        if (t.id === threadId) {
          return { ...t, title: editingTitle.trim() };
        }
        return t;
      }));
    }
    setEditingThreadId(null);
  };

  const getRecommendedCourse = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('북악') || t.includes('스카이웨이')) return '서울 북악스카이웨이 야간 드라이브';
    if (t.includes('신창') || t.includes('풍차') || t.includes('제주')) return '제주 신창 풍차 해안도로';
    if (t.includes('새천년') || t.includes('삼척') || t.includes('강원')) return '강원 삼척 새천년 해안도로';
    if (t.includes('광안대교') || t.includes('마린시티') || t.includes('부산')) return '부산 광안대교 & 마린시티';
    if (t.includes('동서대') || t.includes('동서대학교')) return '동서대학교';
    return null;
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend.trim()
    };

    const hasOnlyWelcome = messages.length === 1 && messages[0].id === 'msg_welcome';
    const targetThreadId = activeThreadId;

    if (hasOnlyWelcome) {
      // Set temporary title immediately
      const tempTitle = userMessage.text.slice(0, 12) + (userMessage.text.length > 12 ? '...' : '');
      setThreads(prev => prev.map(t => {
        if (t.id === targetThreadId) {
          return {
            ...t,
            title: tempTitle,
            messages: [...t.messages, userMessage]
          };
        }
        return t;
      }));

      // Summarize in background using Gemini
      generateThreadTitle(userMessage.text).then(aiTitle => {
        setThreads(prev => prev.map(t => {
          if (t.id === targetThreadId) {
            return { ...t, title: aiTitle };
          }
          return t;
        }));
      }).catch(err => {
        console.warn("AI Title summary failed:", err);
      });

    } else {
      setThreads(prev => prev.map(t => {
        if (t.id === targetThreadId) {
          return {
            ...t,
            messages: [...t.messages, userMessage]
          };
        }
        return t;
      }));
    }

    setInput('');
    setIsLoading(true);

    try {
      const responseText = await generateDriveRecommendation(userMessage.text, messages);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: responseText
      };

      setThreads(prev => prev.map(t => {
        if (t.id === targetThreadId) {
          return {
            ...t,
            messages: [...t.messages, aiMessage]
          };
        }
        return t;
      }));

      voiceService.speak(responseText);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: `오류가 발생했습니다. 다시 시도해 주세요.`
      };
      setThreads(prev => prev.map(t => {
        if (t.id === targetThreadId) {
          return { ...t, messages: [...t.messages, errorMessage] };
        }
        return t;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      return;
    }
    setIsListening(true);
    voiceService.listen((text) => {
      setIsListening(false);
      handleSend(text);
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const isSidebarExpanded = isHovered || isSidebarPinned;
  const hoveredThread = threads.find(t => t.id === hoveredThreadId);
  const previewMessages = hoveredThread 
    ? hoveredThread.messages.filter(m => m.id !== 'msg_welcome').slice(-3)
    : [];

  return (
    <div className="w-full h-full bg-[var(--bg-app)] relative font-sans overflow-hidden flex flex-col">
      
      {/* Left Edge Hover Trigger (Invisible layer to auto-open drawer when mouse moves to left) */}
      {!isSidebarExpanded && (
        <div 
          onMouseEnter={() => setIsHovered(true)}
          className="absolute left-0 top-0 bottom-0 w-3 z-[80] bg-transparent"
        />
      )}

      {/* Backdrop overlay when sidebar is open */}
      {isSidebarExpanded && (
        <div 
          onClick={() => {
            setIsHovered(false);
            setIsSidebarPinned(false);
          }}
          className="absolute inset-0 bg-black/60 z-[110] transition-opacity duration-300 animate-in fade-in"
        />
      )}

      {/* Main Chat Area (Stays full-width, preventing icon squeeze) */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden w-full">
        {/* Header */}
        <div className="flex px-5 py-8 items-center justify-between bg-[var(--bg-app)] border-b border-white/5 z-10 sticky top-0 shrink-0">
          <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setIsSidebarPinned(!isSidebarPinned)}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mr-4 active:scale-95 transition-all text-white",
                  isSidebarPinned ? "bg-nike-volt text-black" : "bg-white/5"
                )}
              >
                <Menu size={24} />
              </button>
              <div className="text-left">
                <h2 className="text-xl font-black italic tracking-tighter uppercase text-[var(--text-main)] leading-none truncate max-w-[150px]">
                  {activeThread.title}
                </h2>
                <p className="text-[9px] text-nike-volt font-black tracking-widest uppercase mt-1">
                  MOODRIVE AI
                </p>
              </div>
            </div>

            <button 
              onClick={startNewChat}
              className="w-12 h-12 bg-nike-volt rounded-xl flex items-center justify-center active:scale-95 transition-all text-black shadow-lg shadow-nike-volt/20 shrink-0"
            >
              <Plus size={22} />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-6 space-y-6 pb-44 max-w-3xl mx-auto w-full">
          {messages.map((msg) => {
            const isAi = msg.role === 'assistant';
            const courseMatch = isAi ? getRecommendedCourse(msg.text) : null;
            return (
              <div key={msg.id} className={cn("flex", isAi ? "justify-start" : "justify-end")}>
                {isAi && (
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex items-center justify-center mr-3 shrink-0 box-content">
                    <Bot size={20} className="text-nike-volt" />
                  </div>
                )}
                <div 
                  className={cn(
                    "px-5 py-4 max-w-[80%] rounded-3xl text-[13px] font-bold leading-tight tracking-tight flex flex-col items-stretch text-left",
                    isAi 
                      ? "bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-main)]" 
                      : "bg-nike-volt text-black"
                  )}
                >
                  <span className="whitespace-pre-line">{msg.text}</span>
                  {courseMatch && (
                    <button 
                      onClick={() => navigate(`/app/map?search=${encodeURIComponent(courseMatch)}`)}
                      className="mt-3 w-full py-3 bg-nike-volt hover:bg-nike-volt/95 active:scale-95 rounded-xl text-black font-black uppercase text-[10px] italic flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(204,255,0,0.3)]"
                    >
                      <Navigation size={12} fill="black" />
                      Go Cruise (안내 시작)
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex items-center justify-center mr-3 shrink-0">
                <Bot size={20} className="text-nike-volt" />
              </div>
              <div className="px-5 py-4 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-3xl text-[11px] font-mono text-nike-volt flex items-center gap-2 italic uppercase">
                <Loader2 size={14} className="animate-spin" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Field */}
        <div className="absolute bottom-[90px] left-0 right-0 p-4 bg-transparent z-50 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2 bg-[#111111]/95 backdrop-blur-xl border border-white/10 rounded-[28px] px-3 py-2">
            <div className="flex-1 flex items-center bg-white/5 rounded-[20px] px-2 py-1">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="TALK TO HK..."
                disabled={isLoading}
                className="flex-1 bg-transparent border-none outline-none px-4 h-12 text-[13px] font-bold text-white placeholder:text-white/20 uppercase"
              />
              <button 
                onClick={handleVoiceInput}
                disabled={isLoading}
                className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", isListening ? "bg-red-500 text-white animate-pulse" : "text-white/40")}
              >
                <Mic size={20} />
              </button>
            </div>
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 rounded-[20px] bg-nike-volt flex items-center justify-center transition-transform active:scale-95 shrink-0"
            >
              <Send size={20} className="text-black ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ABSOLUTE SLIDE-OVER DRAWER SIDEBAR */}
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { 
          setIsHovered(false); 
          setHoveredThreadId(null); 
          setEditingThreadId(null);
        }}
        className={cn(
          "absolute left-0 top-0 bottom-0 w-72 bg-[#111111]/98 border-r border-white/10 flex flex-col p-5 z-[120] select-none text-left transition-transform duration-300 ease-out shadow-2xl",
          isSidebarExpanded ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-nike-volt" size={18} />
            <span className="text-[10px] font-black italic tracking-widest text-white/50 uppercase">대화 기록</span>
          </div>
          <button 
            onClick={() => {
              setIsHovered(false);
              setIsSidebarPinned(false);
            }}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* New Session Button */}
        <button 
          onClick={() => {
            startNewChat();
            setIsHovered(false);
            setIsSidebarPinned(false);
          }}
          className="w-full h-12 bg-white/5 border border-white/10 hover:border-nike-volt/40 text-nike-volt rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all mb-6 shrink-0 active:scale-95"
        >
          <Plus size={16} />
          <span>새 대화 시작</span>
        </button>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
          {threads.map(t => {
            const isActive = t.id === activeThreadId;
            return (
              <div 
                key={t.id}
                onClick={() => { 
                  setActiveThreadId(t.id);
                  setIsHovered(false);
                  setIsSidebarPinned(false);
                }}
                onMouseEnter={(e) => {
                  setHoveredThreadId(t.id);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredY(rect.top);
                }}
                className={cn(
                  "w-full rounded-xl flex items-center cursor-pointer group transition-all border p-3 gap-3 justify-start",
                  isActive 
                    ? "bg-nike-volt/10 border-nike-volt/30 text-nike-volt" 
                    : "bg-black/20 border-transparent text-white/40 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="shrink-0">{getThreadIcon(t.title)}</div>
                
                {editingThreadId === t.id ? (
                  <input 
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => handleRenameSave(t.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSave(t.id)}
                    className="flex-1 bg-white/5 border border-nike-volt/40 rounded px-2 py-0.5 text-xs text-white outline-none font-bold"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-xs font-black uppercase italic tracking-tight truncate max-w-[140px]">
                    {t.title}
                  </span>
                )}

                {editingThreadId !== t.id && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingThreadId(t.id);
                        setEditingTitle(t.title);
                      }}
                      className="text-white/40 hover:text-nike-volt p-1 rounded hover:bg-white/5 transition-all"
                    >
                      <Pencil size={11} />
                    </button>
                    <button 
                      onClick={(e) => deleteChat(t.id, e)}
                      className="text-white/40 hover:text-red-500 p-1 rounded hover:bg-white/5 transition-all"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FLOATING HOVER PREVIEW TOOLTIP */}
      {hoveredThreadId && previewMessages.length > 0 && (
        <div 
          className="absolute z-[130] w-64 bg-[#161616]/95 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 pointer-events-none text-left"
          style={{
            right: '12px',
            top: `${Math.min(hoveredY, window.innerHeight - 220)}px`
          }}
        >
          <h4 className="text-[9px] font-black tracking-widest text-nike-volt uppercase mb-2">대화 미리보기</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto no-scrollbar">
            {previewMessages.map((msg, idx) => (
              <div key={idx} className="text-[11px] leading-tight font-bold border-b border-white/5 pb-2 last:border-0 last:pb-0">
                <div className={cn("text-[8px] uppercase tracking-wider mb-1", msg.role === 'assistant' ? "text-nike-volt" : "text-white/40")}>
                  {msg.role === 'assistant' ? "HK (AI)" : "YOU"}
                </div>
                <div className="text-white/80 line-clamp-3">{msg.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
