import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  MoreHorizontal, 
  Users, 
  MapPin, 
  Plus,
  Send,
  X,
  ChevronRight,
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  ArrowLeft
} from 'lucide-react';
import { 
  fetchPosts, 
  createPost, 
  likePost, 
  addPostComment, 
  fetchChatRooms, 
  createChatRoom, 
  fetchChatMessages, 
  sendChatMessage, 
  type Post, 
  type AttachedCourse, 
  type ChatRoom, 
  type ChatMessage 
} from '../services/db';

const SELECTABLE_RECOMMENDED = [
  { title: '서울 북악스카이웨이 야간 드라이브', distance: '24km', duration: '1h 20m' },
  { title: '제주 신창 풍차 해안도로', distance: '18km', duration: '45m' },
  { title: '강원 삼척 새천년 해안도로', distance: '32km', duration: '1h 5m' },
  { title: '부산 광안대교 & 마린시티', distance: '15km', duration: '30m' }
];

const SELECTABLE_LOGS = [
  { title: 'Urban Night Escape', distance: '42.5km', duration: '1h 12m' },
  { title: 'Coastal Breeze Course', distance: '128.2km', duration: '2h 45m' },
  { title: 'Mountain Peak Vibe', distance: '35.1km', duration: '55m' }
];

export const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'FEED' | 'CHANNELS'>('FEED');
  const [posts, setPosts] = useState<Post[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Modals & Panels Visibility
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [commentPost, setCommentPost] = useState<Post | null>(null);

  // New Post Creation State
  const [nickname, setNickname] = useState(() => {
    const savedUser = localStorage.getItem('moodrive_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.displayName) return parsed.displayName;
      } catch (e) {}
    }
    return localStorage.getItem('moodrive_pilot_name') || 'PILOT_01';
  });
  const [location, setLocation] = useState('SEOUL');
  const [postContent, setPostContent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<AttachedCourse | null>(null);
  const [showCourseSelector, setShowCourseSelector] = useState(false);

  // Post Media Upload Mock State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedMediaUrl, setAttachedMediaUrl] = useState<string>('');
  const [attachedMediaType, setAttachedMediaType] = useState<'image' | 'video' | null>(null);

  // Comments Sub-panel State
  const [newCommentText, setNewCommentText] = useState('');

  // Live Chat Room State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // New Chat Room Creator State
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomCategory, setNewRoomCategory] = useState<'REGION' | 'VIBE' | 'PEOPLE' | 'GEAR'>('REGION');
  const [newRoomTags, setNewRoomTags] = useState('');

  // Load Main Feed Posts
  const loadPosts = async () => {
    // 1. Instantly load from localStorage cache if available
    const cachedData = localStorage.getItem('moodrive_posts');
    let hasCache = false;
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (parsed && parsed.length > 0) {
          setPosts(parsed);
          hasCache = true;
        }
      } catch (e) {}
    }

    // 2. Only show loading spinner if no cache is present
    if (!hasCache) {
      setLoading(true);
    }

    try {
      // 3. Fetch from Firestore/DB in the background
      const data = await fetchPosts();
      setPosts(data);
    } catch (e) {
      console.error("Failed to load community feed:", e);
    } finally {
      setLoading(false);
    }
  };

  // Load Channels
  const loadRooms = async () => {
    try {
      const data = await fetchChatRooms();
      setRooms(data);
    } catch (e) {
      console.error("Failed to load chat rooms:", e);
    }
  };

  useEffect(() => {
    loadPosts();
    loadRooms();
  }, []);

  // Save Pilot Name on change
  useEffect(() => {
    localStorage.setItem('moodrive_pilot_name', nickname);
  }, [nickname]);

  // Scroll to bottom of chat whenever messages load or update
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, selectedRoom]);

  // Load messages when a room is opened
  useEffect(() => {
    if (selectedRoom) {
      const loadMsgs = async () => {
        try {
          const msgs = await fetchChatMessages(selectedRoom.id);
          setChatMessages(msgs);
        } catch (e) {
          console.error("Error loading chat messages:", e);
        }
      };
      loadMsgs();
      
      // Auto-poll messages locally every 4s for simulated updates
      const interval = setInterval(async () => {
        try {
          const msgs = await fetchChatMessages(selectedRoom.id);
          setChatMessages(msgs);
        } catch (e) {
          console.error("Error polling chat messages:", e);
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  // Handle Post Likes Toggling
  const handleLike = async (postId: string) => {
    try {
      const updated = await likePost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? updated : p));
      if (commentPost && commentPost.id === postId) {
        setCommentPost(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Commenting on Posts
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !commentPost || !commentPost.id) return;
    try {
      const updated = await addPostComment(commentPost.id, nickname, newCommentText.trim());
      setNewCommentText('');
      setCommentPost(updated);
      setPosts(prev => prev.map(p => p.id === commentPost.id ? updated : p));
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Posting
  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    try {
      await createPost({
        authorName: nickname.trim().toUpperCase() || 'GUEST_PILOT',
        authorLocation: location.trim().toUpperCase() || 'SEOUL',
        content: postContent,
        likes: 0,
        comments: 0,
        attachedCourse: selectedCourse || undefined,
        image: attachedMediaType === 'image' ? attachedMediaUrl : undefined,
        video: attachedMediaType === 'video' ? attachedMediaUrl : undefined
      });
      setPostContent('');
      setSelectedCourse(null);
      setAttachedMediaUrl('');
      setAttachedMediaType(null);
      setShowCreatePostModal(false);
      await loadPosts();
    } catch (e) {
      console.error(e);
    }
  };

  // Handle File Input Selection
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setAttachedMediaUrl(fileUrl);
      if (file.type.startsWith('video/')) {
        setAttachedMediaType('video');
      } else {
        setAttachedMediaType('image');
      }
    }
  };

  // Handle Creating Chat Room
  const handleCreateRoomSubmit = async () => {
    if (!newRoomTitle.trim()) return;
    try {
      const tagsArray = newRoomTags
        .split(',')
        .map(t => t.trim().toUpperCase())
        .filter(t => t.length > 0);
      await createChatRoom(newRoomTitle.trim(), newRoomCategory, tagsArray);
      setNewRoomTitle('');
      setNewRoomTags('');
      setNewRoomCategory('REGION');
      setShowCreateRoomModal(false);
      await loadRooms();
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Sending Chat Messages with Auto Bot Response Simulation
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedRoom) return;
    const msgText = chatInput.trim();
    setChatInput('');

    try {
      await sendChatMessage(selectedRoom.id, nickname, msgText);
      const updatedMsgs = await fetchChatMessages(selectedRoom.id);
      setChatMessages(updatedMsgs);
      await loadRooms();

      // Trigger delayed simulated response from community driver
      setTimeout(async () => {
        try {
          const drivers = ['NIGHT_HUNTER', 'M3_COMPETITION', 'VOLT_RACER', 'JEJU_COOPER', 'HIGHWAY_HUD_FAN'];
          const comments = [
            '대박이네요! 이번 주말 저녁에 다들 모이시나요? 🚙🔥',
            '완전 동감합니다 ㅎㅎ 저도 어제 갔다가 심야 드라이브 뽕 취했네요',
            '안전 운전이 제일 중요합니다! 신호 과속 카메라 다들 조심하세요~ 👮‍♂️',
            '거기 도로 노면 상태 어떤가요? 저 평평한 차인데 하체 긁힐까 걱정이네요',
            '다들 드라이브 코스 도착하시면 카페 어디 가시는지 추천해주세요! ☕️',
            '크 멋집니다! 배기음 들어보고 싶네요.',
            '오늘 달리기 딱 좋은 시원한 밤바람입니다. 다들 윈도우 오픈하셨죠? 😎'
          ];
          const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
          const randomComment = comments[Math.floor(Math.random() * comments.length)];
          
          await sendChatMessage(selectedRoom.id, randomDriver, randomComment);
          
          // Refresh only if still inside the same chat room
          setSelectedRoom(current => {
            if (current && current.id === selectedRoom.id) {
              fetchChatMessages(selectedRoom.id).then(msgs => setChatMessages(msgs)).catch(console.error);
            }
            return current;
          });
          await loadRooms();
        } catch (e) {
          console.error("Error in chat simulation bot:", e);
        }
      }, 1200);

    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-app)] text-white font-sans relative select-none">
      
      {/* HEADER SECTION */}
      <div className="px-6 pt-10 pb-6 bg-[var(--bg-app)] border-b border-white/5 sticky top-0 z-30 flex flex-col">
        <div className="max-w-2xl mx-auto w-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-white">COMMUNITY</h2>
              <p className="text-nike-volt font-mono text-[9px] mt-1.5 uppercase tracking-widest font-black">Share the thrill, run the road</p>
            </div>
            <button 
               onClick={() => activeTab === 'FEED' ? setShowCreatePostModal(true) : setShowCreateRoomModal(true)}
               className="w-12 h-12 bg-nike-volt rounded-2xl flex items-center justify-center text-black shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>
          </div>

          {/* TAB SWITCHER */}
          <div className="flex bg-[#111111] p-1 rounded-2xl border border-white/5">
            <button 
              onClick={() => setActiveTab('FEED')}
              className={`flex-1 py-3.5 rounded-xl text-[11px] font-black italic uppercase tracking-widest transition-all duration-300 ${
                activeTab === 'FEED' ? 'bg-[#1e1e1e] text-nike-volt shadow-lg border border-white/5' : 'text-white/40 hover:text-white'
              }`}
            >
              Road Feed
            </button>
            <button 
              onClick={() => setActiveTab('CHANNELS')}
              className={`flex-1 py-3.5 rounded-xl text-[11px] font-black italic uppercase tracking-widest transition-all duration-300 ${
                activeTab === 'CHANNELS' ? 'bg-[#1e1e1e] text-nike-volt shadow-lg border border-white/5' : 'text-white/40 hover:text-white'
              }`}
            >
              Live Channels
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 px-5 py-6 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <div className="w-12 h-12 rounded-full border-4 border-nike-volt/20 border-t-nike-volt animate-spin"></div>
             <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">Synchronizing Road Log...</p>
          </div>
        ) : activeTab === 'FEED' ? (
          /* ROAD FEED VIEW */
          <div className="space-y-6">
             {posts.map(post => (
                <div key={post.id} className="p-6 bg-[#111111] border border-white/5 rounded-[36px] shadow-2xl flex flex-col relative">
                  
                  {/* Post Author Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-nike-volt to-lime-500 flex items-center justify-center text-black font-black uppercase text-xs italic shadow-md">
                        {post.authorName.charAt(0)}
                      </div>
                      <div className="ml-3 text-left">
                        <h4 className="text-[13px] font-black uppercase italic tracking-tight text-white leading-none">{post.authorName}</h4>
                        <p className="text-[9px] text-nike-volt font-black tracking-widest uppercase mt-1.5">{post.authorLocation}</p>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <MoreHorizontal size={18} className="text-white/40 hover:text-white" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <p className="text-[13px] font-bold leading-relaxed text-white/80 mb-5 text-left whitespace-pre-wrap">{post.content}</p>
                  
                  {/* Post Image Banner */}
                  {post.image && (
                    <div className="w-full h-56 rounded-3xl overflow-hidden mb-5 border border-white/5 bg-black">
                      <img src={post.image} alt="driving-log" className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}

                  {/* Post Video Player */}
                  {post.video && (
                    <div className="w-full h-56 rounded-3xl overflow-hidden mb-5 border border-white/5 bg-black relative flex items-center justify-center">
                      <video 
                        src={post.video} 
                        controls 
                        loop 
                        muted 
                        playsInline
                        className="w-full h-full object-cover opacity-90" 
                      />
                    </div>
                  )}

                  {/* Attached Course Card */}
                  {post.attachedCourse && (
                    <div className="mb-5 bg-[#080808]/80 border border-white/5 rounded-3xl p-5 flex items-center justify-between group hover:border-nike-volt/30 transition-all duration-300">
                       <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-11 h-11 bg-nike-volt/10 rounded-2xl flex items-center justify-center shrink-0 border border-nike-volt/20">
                             <MapPin size={18} className="text-nike-volt animate-bounce" />
                          </div>
                          <div className="min-w-0 text-left">
                             <div className="text-[8px] font-black text-nike-volt uppercase tracking-widest mb-1">{post.attachedCourse.type === 'RECOMMENDED' ? 'PRO CURATED COURSE' : 'MY CRUISE LOG'}</div>
                             <h4 className="text-xs font-black italic text-white uppercase truncate tracking-tight">{post.attachedCourse.title}</h4>
                             <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mt-1">{post.attachedCourse.distance} • {post.attachedCourse.duration}</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => navigate(`/app/map?search=${encodeURIComponent(post.attachedCourse!.title)}`)}
                         className="h-11 px-5 bg-nike-volt rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 transition-all text-black font-black uppercase text-[10px] italic shrink-0 shadow-lg shadow-nike-volt/10"
                       >
                          <Send size={12} fill="black" />
                          Cruise
                       </button>
                    </div>
                  )}

                  {/* Interactions Footer */}
                  <div className="flex items-center gap-6 border-t border-white/5 pt-4">
                    <button 
                      onClick={() => handleLike(post.id!)}
                      className={`flex items-center font-black italic tracking-wide text-xs transition-colors ${
                        post.likedByMe ? 'text-red-500' : 'text-white/40 hover:text-white'
                      }`}
                    >
                      <Heart size={18} className="mr-2" fill={post.likedByMe ? 'currentColor' : 'none'} />
                      {post.likes}
                    </button>
                    <button 
                      onClick={() => setCommentPost(post)}
                      className="flex items-center text-white/40 hover:text-white font-black italic tracking-wide text-xs transition-colors"
                    >
                      <MessageCircle size={18} className="mr-2" />
                      {post.comments}
                    </button>
                  </div>

                </div>
             ))}
          </div>
        ) : (
          /* ACTIVE LIVE CHANNELS VIEW */
          <div className="space-y-4">
            <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30 mb-3 px-2 text-left">Live Drive Channels</h3>
            
            {rooms.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-white/10 rounded-[32px] text-white/30 font-bold text-xs uppercase tracking-widest">
                No active channels. Create one!
              </div>
            ) : (
              rooms.map(room => (
                <button 
                  key={room.id} 
                  onClick={() => setSelectedRoom(room)}
                  className="w-full bg-[#111111] border border-white/5 p-6 rounded-[32px] transition-all duration-300 hover:border-nike-volt/30 active:scale-[0.98] text-left flex flex-col"
                >
                  <div className="flex justify-between items-start mb-3 w-full">
                    <div className="flex items-center gap-3">
                      <div className="bg-nike-volt/10 p-2.5 rounded-2xl border border-nike-volt/20">
                        {room.category === 'REGION' ? (
                          <MapPin size={16} className="text-nike-volt" />
                        ) : (
                          <Sparkles size={16} className="text-nike-volt" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-[14px] font-black italic uppercase tracking-tighter text-white leading-none">{room.title}</h4>
                        <span className="text-[8px] font-mono font-bold bg-nike-volt/10 text-nike-volt px-2 py-0.5 rounded-md mt-1.5 inline-block">{room.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/40 px-3.5 py-1.5 rounded-full border border-white/5">
                      <Users size={12} className="text-nike-volt" />
                      <span className="text-[10px] font-mono text-nike-volt font-black leading-none">{room.participants}</span>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-white/50 uppercase mb-4 truncate italic max-w-full text-left">"{room.lastMsg}"</p>
                  <div className="flex flex-wrap gap-2">
                     {room.tags.map(tag => (
                       <span key={tag} className="text-[8px] font-black bg-black/40 border border-white/5 px-3 py-1 rounded-xl text-white/40 tracking-wider">#{tag}</span>
                     ))}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          CREATE NEW CHANNEL MODAL 
      ======================================================== */}
      {showCreateRoomModal && (
        <div className="absolute inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-[#111111] border border-white/10 w-full rounded-[40px] p-8 max-w-md shadow-2xl relative">
              <button 
                onClick={() => setShowCreateRoomModal(false)} 
                className="absolute top-6 right-6 w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
              <div className="mb-8 text-left">
                 <h3 className="text-2xl font-black italic tracking-tighter text-nike-volt uppercase">New Channel</h3>
                 <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-1">Initiate a live drive channel</p>
              </div>
              <div className="space-y-5 text-left mb-8">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Channel Title</label>
                    <input 
                      type="text" 
                      value={newRoomTitle}
                      onChange={(e) => setNewRoomTitle(e.target.value)}
                      placeholder="E.G. MIDNIGHT SEOUL" 
                      className="w-full h-14 bg-black border border-white/10 rounded-2xl px-5 text-xs font-bold text-white uppercase placeholder:opacity-20 outline-none focus:border-nike-volt/50 transition-colors" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Category</label>
                    <div className="grid grid-cols-4 gap-2">
                       {['REGION', 'VIBE', 'PEOPLE', 'GEAR'].map(cat => (
                         <button 
                           key={cat} 
                           type="button"
                           onClick={() => setNewRoomCategory(cat as any)}
                           className={`h-11 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                             newRoomCategory === cat 
                               ? 'bg-nike-volt text-black font-black' 
                               : 'bg-white/5 border border-white/5 text-white/40 hover:border-white/10'
                           }`}
                         >
                           {cat}
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Hash Tags (Comma separated)</label>
                    <input 
                      type="text" 
                      value={newRoomTags}
                      onChange={(e) => setNewRoomTags(e.target.value)}
                      placeholder="E.G. SEOUL, MIDNIGHT, TUNING" 
                      className="w-full h-14 bg-black border border-white/10 rounded-2xl px-5 text-xs font-bold text-white uppercase placeholder:opacity-20 outline-none focus:border-nike-volt/50 transition-colors" 
                    />
                 </div>
              </div>
              <button 
                onClick={handleCreateRoomSubmit}
                disabled={!newRoomTitle.trim()}
                className="w-full h-15 bg-nike-volt rounded-2xl text-black font-black italic uppercase tracking-widest shadow-xl shadow-nike-volt/10 disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-transform"
              >
                Launch Channel
              </button>
           </div>
        </div>
      )}

      {/* ========================================================
          LIVE CHAT ROOM PANEL (INSTAGRAM STYLE DRAWER)
      ======================================================== */}
      {selectedRoom && (
        <div className="absolute inset-0 bg-[var(--bg-app)] z-[100] flex flex-col animate-in slide-in-from-right duration-300">
           
           {/* Chat Header */}
           <div className="px-6 pt-10 pb-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[var(--bg-app)]">
              <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedRoom(null)} 
                      className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-white/60 hover:text-white active:scale-90 transition-transform"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div className="text-left">
                       <h3 className="text-base font-black italic uppercase tracking-tighter text-white leading-none">{selectedRoom.title}</h3>
                       <p className="text-[9px] font-black text-nike-volt uppercase tracking-widest mt-1.5">Live • {selectedRoom.participants} Riders Online</p>
                    </div>
                 </div>
                 <MoreHorizontal size={20} className="text-white/40" />
              </div>
           </div>
           
           {/* Messages Scroll Area */}
           <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5 bg-[#080808]">
              <div className="max-w-2xl mx-auto w-full flex flex-col space-y-5">
                 {chatMessages.map((msg, i) => {
                    const isMe = msg.authorName === nickname.trim().toUpperCase();
                    const isSystem = msg.authorName === 'SYSTEM';

                    if (isSystem) {
                      return (
                        <div key={msg.id || i} className="text-center py-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-white/20 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">{msg.text}</span>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id || i} className={`flex gap-3 items-end ${isMe ? 'flex-row-reverse text-right' : 'text-left'}`}>
                         {/* Avatar */}
                         {!isMe && (
                           <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 font-black text-[9px] shrink-0 border border-white/5 shadow-md">
                             {msg.authorName.charAt(0)}
                           </div>
                         )}
                         
                         <div className="flex flex-col max-w-[70%]">
                            {!isMe && <span className="text-[9px] font-black text-white/40 uppercase mb-1.5 ml-1 tracking-wider">{msg.authorName}</span>}
                            <div className={`p-4 rounded-3xl border text-xs font-bold leading-normal ${
                              isMe 
                                ? 'bg-nike-volt border-nike-volt text-black rounded-tr-none shadow-lg shadow-nike-volt/5' 
                                : 'bg-[#111111] border-white/5 text-white/90 rounded-tl-none'
                            }`}>
                               <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            <span className="text-[8px] font-mono text-white/20 mt-1 px-1.5">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                         </div>
                      </div>
                    );
                 })}
                 <div ref={chatEndRef} />
              </div>
           </div>

           {/* Chat Input Footer */}
           <form 
             onSubmit={handleSendChatMessage}
             className="p-5 border-t border-white/5 bg-[var(--bg-app)] pb-10 shrink-0"
           >
              <div className="max-w-2xl mx-auto w-full flex gap-2.5 items-center bg-[#111111] p-2 rounded-2xl border border-white/5 focus-within:border-nike-volt/30 transition-colors">
                 <input 
                   type="text" 
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   placeholder="Post message to channel..." 
                   className="flex-1 bg-transparent px-3 text-xs font-bold text-white outline-none placeholder:text-white/20" 
                 />
                 <button 
                   type="submit"
                   disabled={!chatInput.trim()}
                   className="w-11 h-11 bg-nike-volt rounded-xl flex items-center justify-center text-black disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-transform"
                 >
                    <Send size={16} fill="black" />
                 </button>
              </div>
           </form>
         </div>
      )}

      {/* ========================================================
          CREATE NEW FEED POST MODAL 
      ======================================================== */}
      {showCreatePostModal && (
        <div className="absolute inset-0 bg-black/95 z-[100] flex items-center justify-center p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-300">
           <div className="bg-[#111111] border border-white/10 w-full max-h-[90vh] rounded-[40px] p-8 flex flex-col overflow-y-auto no-scrollbar relative max-w-md shadow-2xl">
              <button 
                onClick={() => { 
                  setShowCreatePostModal(false); 
                  setSelectedCourse(null); 
                  setPostContent(''); 
                  setAttachedMediaUrl(''); 
                  setAttachedMediaType(null);
                }} 
                className="absolute top-6 right-6 w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
              
              <div className="mb-8 text-left shrink-0">
                 <h3 className="text-2xl font-black italic tracking-tighter text-nike-volt uppercase">New Post</h3>
                 <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-1">Publish a driving logs feed post</p>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pr-1 text-left">
                 
                 {/* Author Profiles Inputs */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Pilot Nickname</label>
                       <input 
                         type="text" 
                         value={nickname} 
                         onChange={(e) => setNickname(e.target.value)}
                         placeholder="E.G. PILOT_01" 
                         className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-xs font-bold text-white uppercase outline-none focus:border-nike-volt/50 transition-colors" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-white/40">City Location</label>
                       <input 
                         type="text" 
                         value={location} 
                         onChange={(e) => setLocation(e.target.value)}
                         placeholder="E.G. SEOUL" 
                         className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-xs font-bold text-white uppercase outline-none focus:border-nike-volt/50 transition-colors" 
                       />
                    </div>
                 </div>

                 {/* Text Content */}
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Log Story</label>
                    <textarea 
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share your driving adrenaline tonight..." 
                      className="w-full h-28 bg-black border border-white/10 rounded-2xl p-4 text-xs font-bold text-white uppercase placeholder:opacity-20 outline-none resize-none focus:border-nike-volt/50 transition-colors" 
                    />
                 </div>

                 {/* File Media Preview/Uploader */}
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Attach Photo / Video</label>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*,video/*"
                      className="hidden" 
                    />
                    
                    {attachedMediaUrl ? (
                      <div className="relative w-full h-44 rounded-2xl border border-white/10 bg-black overflow-hidden group">
                         {attachedMediaType === 'video' ? (
                           <video src={attachedMediaUrl} muted loop className="w-full h-full object-cover opacity-60" />
                         ) : (
                           <img src={attachedMediaUrl} alt="preview" className="w-full h-full object-cover opacity-60" />
                         )}
                         <button 
                           onClick={() => { setAttachedMediaUrl(''); setAttachedMediaType(null); }}
                           className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-xl flex items-center justify-center text-white/80 hover:text-white"
                         >
                            <X size={16} />
                         </button>
                         <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              type="button"
                              onClick={triggerFileInput}
                              className="px-4 py-2 bg-nike-volt text-black rounded-lg text-[9px] font-black uppercase tracking-wider"
                            >
                              Replace File
                            </button>
                         </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                         <button 
                           type="button"
                           onClick={triggerFileInput}
                           className="py-5 bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-nike-volt/40 text-white/40 hover:text-nike-volt transition-colors"
                         >
                            <ImageIcon size={20} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Upload Photo</span>
                         </button>
                         <button 
                           type="button"
                           onClick={triggerFileInput}
                           className="py-5 bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-nike-volt/40 text-white/40 hover:text-nike-volt transition-colors"
                         >
                            <VideoIcon size={20} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Upload Video</span>
                         </button>
                      </div>
                    )}
                 </div>

                 {/* Selected Course Preview */}
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Driving Course</label>
                    {selectedCourse ? (
                       <div className="bg-black border border-nike-volt/30 p-4 rounded-2xl relative flex flex-col text-left">
                          <button 
                            onClick={() => setSelectedCourse(null)}
                            className="absolute top-3.5 right-3.5 w-6 h-6 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-white"
                          >
                             <X size={12} />
                          </button>
                          <div className="flex items-center gap-2 mb-1.5">
                             <MapPin size={14} className="text-nike-volt" />
                             <span className="text-[9px] font-black tracking-widest text-nike-volt uppercase">Attached ({selectedCourse.type === 'RECOMMENDED' ? 'Curated' : 'My Log'})</span>
                          </div>
                          <h4 className="text-xs font-black italic text-white uppercase tracking-tight truncate pr-8">{selectedCourse.title}</h4>
                          <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mt-0.5">{selectedCourse.distance} • {selectedCourse.duration}</p>
                       </div>
                    ) : (
                       <button 
                         type="button"
                         onClick={() => setShowCourseSelector(true)}
                         className="w-full py-4 bg-white/5 border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:border-nike-volt/40 text-white/40 hover:text-nike-volt transition-colors"
                       >
                          <MapPin size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Attach Driving Course</span>
                       </button>
                    )}
                 </div>
              </div>

              <button 
                onClick={handleCreatePost}
                disabled={!postContent.trim()}
                className="w-full h-15 bg-nike-volt rounded-2xl text-black font-black italic uppercase tracking-widest shadow-xl shadow-nike-volt/10 mt-8 shrink-0 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] transition-all duration-300"
              >
                 Post to Feed
              </button>
           </div>
        </div>
      )}

      {/* ========================================================
          COMMENTS BOTTOM DRAWER/MODAL 
      ======================================================== */}
      {commentPost && (
        <div className="absolute inset-0 bg-black/90 z-[100] flex items-end justify-center p-0 animate-in fade-in duration-300">
           <div className="bg-[#111111] border-t border-white/10 w-full rounded-t-[40px] max-h-[85vh] flex flex-col overflow-hidden relative shadow-2xl animate-in slide-in-from-bottom duration-300">
              
              {/* Comments Header */}
              <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between shrink-0">
                 <div className="text-left">
                    <h3 className="text-lg font-black italic uppercase tracking-tighter text-nike-volt leading-none">Comments</h3>
                    <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-1.5">Rider feedbacks ({commentPost.comments})</p>
                 </div>
                 <button 
                   onClick={() => { setCommentPost(null); setNewCommentText(''); }} 
                   className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-white/60 hover:text-white"
                 >
                    <X size={20} />
                 </button>
              </div>

              {/* Comments Scrollable Log */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 bg-[#0d0d0d]">
                 {!commentPost.commentList || commentPost.commentList.length === 0 ? (
                    <div className="py-12 text-center text-white/20 font-black uppercase text-[10px] tracking-widest">
                       No comments yet. Write one first!
                    </div>
                 ) : (
                    commentPost.commentList.map((c) => (
                       <div key={c.id} className="flex gap-3 items-start text-left bg-white/2 px-4 py-3.5 rounded-2xl border border-white/5">
                          <div className="w-8 h-8 rounded-full bg-nike-volt/10 text-nike-volt font-black flex items-center justify-center text-[10px] shrink-0 border border-nike-volt/10">
                             {c.authorName.charAt(0)}
                          </div>
                          <div>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-white uppercase italic">{c.authorName}</span>
                                <span className="text-[8px] font-mono text-white/20">
                                  {new Date(c.createdAt).toLocaleDateString()}
                                </span>
                             </div>
                             <p className="text-xs font-semibold text-white/70 mt-1 leading-relaxed">{c.content}</p>
                          </div>
                       </div>
                    ))
                 )}
              </div>

              {/* Write Comment Form */}
              <form 
                onSubmit={handleAddComment}
                className="p-5 border-t border-white/5 bg-[#111111] pb-10 shrink-0"
              >
                 <div className="flex gap-2.5 items-center bg-black p-2 rounded-2xl border border-white/5 focus-within:border-nike-volt/30 transition-colors">
                    <input 
                      type="text" 
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Add comment..." 
                      className="flex-1 bg-transparent px-3 text-xs font-bold text-white outline-none placeholder:text-white/20" 
                    />
                    <button 
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="w-11 h-11 bg-nike-volt rounded-xl flex items-center justify-center text-black disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-transform"
                    >
                       <Send size={16} fill="black" />
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* ========================================================
          COURSE SELECTOR SUB-MODAL 
      ======================================================== */}
      {showCreatePostModal && showCourseSelector && (
         <div className="absolute inset-0 bg-black/95 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-[#111111] border border-white/10 w-full max-h-[85vh] rounded-[40px] p-8 flex flex-col max-w-md shadow-2xl">
               <div className="flex justify-between items-center mb-6 shrink-0">
                  <div className="text-left">
                     <h4 className="text-lg font-black italic tracking-tighter text-nike-volt uppercase">Attach Course</h4>
                     <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-1">Select from curated or personal logs</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowCourseSelector(false)} 
                    className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-white/60 hover:text-white"
                  >
                    <X size={18} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                  {/* Curated Recommendations */}
                  <div className="text-left">
                     <h5 className="text-[9px] font-black tracking-widest text-white/40 uppercase mb-3 px-1">Curated Recommendations</h5>
                     <div className="space-y-2">
                        {SELECTABLE_RECOMMENDED.map((c) => (
                           <button 
                             key={c.title}
                             type="button"
                             onClick={() => {
                               setSelectedCourse({ title: c.title, distance: c.distance, duration: c.duration, type: 'RECOMMENDED' });
                               setShowCourseSelector(false);
                             }}
                             className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl hover:border-nike-volt/30 transition-all text-left flex justify-between items-center group"
                           >
                              <div>
                                 <p className="text-xs font-black uppercase text-white group-hover:text-nike-volt transition-colors">{c.title}</p>
                                 <p className="text-[9px] text-white/40 mt-1 uppercase font-bold">{c.distance} • {c.duration}</p>
                              </div>
                              <ChevronRight size={16} className="text-white/20 group-hover:text-nike-volt transition-colors" />
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Personal Drive Logs */}
                  <div className="text-left">
                     <h5 className="text-[9px] font-black tracking-widest text-white/40 uppercase mb-3 px-1">My Drive Logs</h5>
                     <div className="space-y-2">
                        {SELECTABLE_LOGS.map((c) => (
                           <button 
                             key={c.title}
                             type="button"
                             onClick={() => {
                               setSelectedCourse({ title: c.title, distance: c.distance, duration: c.duration, type: 'LOG' });
                               setShowCourseSelector(false);
                             }}
                             className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl hover:border-nike-volt/30 transition-all text-left flex justify-between items-center group"
                           >
                              <div>
                                 <p className="text-xs font-black uppercase text-white group-hover:text-nike-volt transition-colors">{c.title}</p>
                                 <p className="text-[9px] text-white/40 mt-1 uppercase font-bold">{c.distance} • {c.duration}</p>
                              </div>
                              <ChevronRight size={16} className="text-white/20 group-hover:text-nike-volt transition-colors" />
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};
