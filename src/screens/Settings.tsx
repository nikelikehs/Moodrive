import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, 
  Globe, 
  Sparkles, 
  LogOut, 
  Edit2, 
  Check, 
  X, 
  Volume2, 
  Sun, 
  Moon, 
  Map, 
  Navigation, 
  Trash2,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../layouts/MobileLayout';
import { auth } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import { voiceService, VOICE_PERSONAS } from '../services/voice';

export const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme, isGrayscale, toggleGrayscale, colorTheme, setColorTheme } = useTheme();

  const currentLanguage = i18n.language;
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('moodrive_gemini_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('moodrive_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  // Inline Profile Edit Nickname state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(currentUser?.displayName || '');

  // Map settings state
  const [mapType, setMapType] = useState(() => localStorage.getItem('moodrive_map_type') || 'roadmap');
  const [showTraffic, setShowTraffic] = useState(() => localStorage.getItem('moodrive_show_traffic') === 'true');
  const [showBicycle, setShowBicycle] = useState(() => localStorage.getItem('moodrive_show_bicycle') === 'true');
  const [showCadastral, setShowCadastral] = useState(() => localStorage.getItem('moodrive_show_cadastral') === 'true');

  // Navigation settings state
  const [routeOption, setRouteOption] = useState(() => localStorage.getItem('moodrive_nav_route_option') || 'RECOMMEND');
  const [cameraAlert, setCameraAlert] = useState(() => localStorage.getItem('moodrive_camera_alert') || '500m');

  // Voice settings state
  const [selectedPersonaId, setSelectedPersonaId] = useState(() => localStorage.getItem('moodrive_selected_persona_id') || 'nike_male');
  const [voiceRate, setVoiceRate] = useState(() => localStorage.getItem('moodrive_voice_rate') || '1.0');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => localStorage.getItem('moodrive_voice_enabled') !== 'false');

  // AI Chatbot Settings state
  const [aiPersona, setAiPersona] = useState(() => localStorage.getItem('moodrive_ai_persona') || 'standard');
  const [aiTemperature, setAiTemperature] = useState(() => parseFloat(localStorage.getItem('moodrive_ai_temperature') || '0.7'));

  const handleSetAiPersona = (persona: string) => {
    setAiPersona(persona);
    localStorage.setItem('moodrive_ai_persona', persona);
  };

  const handleSetAiTemperature = (temp: number) => {
    setAiTemperature(temp);
    localStorage.setItem('moodrive_ai_temperature', String(temp));
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (e) {}
    localStorage.removeItem('moodrive_user');
    setCurrentUser(null);
    navigate('/login');
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('moodrive_gemini_key', geminiKey.trim());
    alert("제미나이 API 키가 저장되었습니다!");
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleSaveNickname = () => {
    if (!editName.trim()) return;
    const updatedUser = { ...currentUser, displayName: editName.trim() };
    localStorage.setItem('moodrive_user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setIsEditingName(false);
  };

  const handleResetAllData = async () => {
    const confirmReset = window.confirm("모든 설정과 사용자 데이터를 초기화하고 로그아웃 하시겠습니까?");
    if (!confirmReset) return;
    try {
      await auth.signOut();
    } catch (e) {}
    localStorage.clear();
    navigate('/');
  };

  const handleToggleTraffic = () => {
    const next = !showTraffic;
    setShowTraffic(next);
    localStorage.setItem('moodrive_show_traffic', String(next));
  };

  const handleToggleBicycle = () => {
    const next = !showBicycle;
    setShowBicycle(next);
    localStorage.setItem('moodrive_show_bicycle', String(next));
  };

  const handleToggleCadastral = () => {
    const next = !showCadastral;
    setShowCadastral(next);
    localStorage.setItem('moodrive_show_cadastral', String(next));
  };

  const handleSetMapType = (type: string) => {
    setMapType(type);
    localStorage.setItem('moodrive_map_type', type);
  };

  const handleSetRouteOption = (opt: string) => {
    setRouteOption(opt);
    localStorage.setItem('moodrive_nav_route_option', opt);
  };

  const handleSetCameraAlert = (alertDist: string) => {
    setCameraAlert(alertDist);
    localStorage.setItem('moodrive_camera_alert', alertDist);
  };

  const handleSetPersona = (id: string) => {
    setSelectedPersonaId(id);
    voiceService.setSelectedPersona(id);
  };

  const handleSetVoiceRate = (rate: string) => {
    setVoiceRate(rate);
    localStorage.setItem('moodrive_voice_rate', rate);
  };

  const handleToggleVoiceEnabled = () => {
    const next = !isVoiceEnabled;
    setIsVoiceEnabled(next);
    localStorage.setItem('moodrive_voice_enabled', String(next));
  };

  const handlePreviewVoice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const prevId = selectedPersonaId;
    voiceService.setSelectedPersona(id);

    let text = "반갑습니다. 무드라이브 길안내를 시작합니다.";
    if (id === 'nike_male') text = "레전드 드라이버님, 오늘도 안전운전 고고! 안내 시작할게.";
    else if (id === 'luna_female') text = "조용하고 편안한 밤 드라이브네요. 안전하게 길을 찾아드릴게요.";
    else if (id === 'jay_tech') text = "수집된 데이터를 기반으로 최적 경로를 안내합니다. 서행 운전하세요.";
    else if (id === 'mia_friendly') text = "친구야 반가워! 오늘 드라이브 엄청 기대된다. 출발해볼까?";
    else if (id === 'rex_bass') text = "경로 안내를 시작합니다. 전방 상황을 주시하십시오.";
    else if (id === 'aria_glow') text = "기분 좋은 에너지로 안내해 드릴게요! 신나게 출발해봐요!";

    voiceService.speak(text);
    voiceService.setSelectedPersona(prevId);
  };

  return (
    <div className="absolute inset-0 bg-[var(--bg-app)] flex flex-col font-sans text-white select-none">
      {/* Header */}
      <div className="px-6 py-6 flex items-center bg-[var(--bg-app)] border-b border-white/5 sticky top-0 z-[100] shrink-0">
        <div className="max-w-2xl mx-auto w-full flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mr-4 active:scale-90 active:bg-white/10 transition-all border border-white/5"
          >
            <ChevronLeft className="text-white" size={24} />
          </button>
          <h1 className="text-xl font-black italic tracking-tighter uppercase text-white leading-none">
            {t('nav_settings')}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-32 max-w-2xl mx-auto w-full">
        {/* 1. User Profile Card */}
        {currentUser && (
          <div className="bg-[#111111] border border-white/5 p-6 rounded-[32px] text-left relative overflow-hidden animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-black text-nike-volt italic">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'P'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[9px] font-black tracking-widest text-nike-volt uppercase mb-0.5">REGISTERED PILOT</h2>
                
                {isEditingName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-black border border-white/10 rounded-lg px-2 py-1 text-sm font-bold text-white outline-none focus:border-nike-volt flex-1 min-w-0"
                    />
                    <button 
                      onClick={handleSaveNickname}
                      className="w-8 h-8 bg-nike-volt text-black rounded-lg flex items-center justify-center shrink-0 active:scale-90"
                    >
                      <Check size={16} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => { setEditName(currentUser.displayName || ''); setIsEditingName(false); }}
                      className="w-8 h-8 bg-white/10 text-white rounded-lg flex items-center justify-center shrink-0 active:scale-90"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black tracking-tight text-white uppercase truncate">
                      {currentUser.displayName || 'PILOT'}
                    </h3>
                    <button 
                      onClick={() => setIsEditingName(true)}
                      className="p-1 text-white/40 hover:text-white transition-colors"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                )}
                
                <p className="text-[10px] text-white/40 truncate mt-0.5">{currentUser.email || 'no-email@moodrive.io'}</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Map Screen Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <Map className="text-nike-volt" size={18} />
            <h2 className="text-[10px] font-black tracking-widest text-white/40 uppercase">지도 화면 설정</h2>
          </div>
          
          <div className="bg-[#111111] border border-white/5 rounded-[32px] p-5 space-y-5">
            {/* Map Type Segment Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/50 pl-1">지도 유형</label>
              <div className="grid grid-cols-2 gap-2 bg-black p-1 rounded-2xl border border-white/5">
                <button
                  onClick={() => handleSetMapType('roadmap')}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-black tracking-wider transition-all active:scale-[0.98]",
                    mapType === 'roadmap'
                      ? "bg-nike-volt text-black"
                      : "text-white/50 hover:text-white"
                  )}
                >
                  일반 지도
                </button>
                <button
                  onClick={() => handleSetMapType('skyview')}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-black tracking-wider transition-all active:scale-[0.98]",
                    mapType === 'skyview'
                      ? "bg-nike-volt text-black"
                      : "text-white/50 hover:text-white"
                  )}
                >
                  위성 지도
                </button>
              </div>
            </div>

            {/* Overlays toggle list */}
            <div className="space-y-4 pt-2 border-t border-white/5">
              {[
                { label: "실시간 교통정보", desc: "주요 도로의 정체 수준 표시", active: showTraffic, handler: handleToggleTraffic },
                { label: "자전거 도로", desc: "자전거 전용 차선 및 코스 겹쳐보기", active: showBicycle, handler: handleToggleBicycle },
                { label: "지적편집도", desc: "토지 용도 및 도시 계획 정보 레이어", active: showCadastral, handler: handleToggleCadastral }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.label}</h4>
                    <p className="text-[9px] text-white/30 font-medium mt-0.5">{item.desc}</p>
                  </div>
                  
                  {/* Sliding Toggle Switch */}
                  <button 
                    onClick={item.handler}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-colors duration-300 relative focus:outline-none shrink-0",
                      item.active ? "bg-nike-volt" : "bg-white/10"
                    )}
                  >
                    <div 
                      className={cn(
                        "w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300",
                        item.active ? "translate-x-6 bg-black" : "translate-x-0"
                      )} 
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Navigation Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <Navigation className="text-nike-volt" size={18} />
            <h2 className="text-[10px] font-black tracking-widest text-white/40 uppercase">내비게이션 안내 설정</h2>
          </div>
          
          <div className="bg-[#111111] border border-white/5 rounded-[32px] p-5 space-y-5">
            {/* Route Preferences */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/50 pl-1">기본 탐색 옵션</label>
              <div className="grid grid-cols-3 gap-2 bg-black p-1 rounded-2xl border border-white/5">
                {[
                  { id: 'RECOMMEND', label: '추천 경로' },
                  { id: 'SHORTEST', label: '최단 거리' },
                  { id: 'TOLL_FREE', label: '무료 도로' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSetRouteOption(opt.id)}
                    className={cn(
                      "py-2 px-1 rounded-xl text-[10px] font-black tracking-tight transition-all active:scale-[0.98] truncate",
                      routeOption === opt.id
                        ? "bg-nike-volt text-black"
                        : "text-white/50 hover:text-white"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Safety Alert (Camera distance) */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-[10px] font-bold text-white/50 pl-1">안전 운전 안내 (단속 카메라 경고 시점)</label>
              <div className="grid grid-cols-3 gap-2 bg-black p-1 rounded-2xl border border-white/5">
                {['300m', '500m', '1km'].map((dist) => (
                  <button
                    key={dist}
                    onClick={() => handleSetCameraAlert(dist)}
                    className={cn(
                      "py-2 rounded-xl text-[10px] font-black tracking-tight transition-all active:scale-[0.98]",
                      cameraAlert === dist
                        ? "bg-nike-volt text-black"
                        : "text-white/50 hover:text-white"
                    )}
                  >
                    {dist} 전방
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Voice Guidance Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <Volume2 className="text-nike-volt" size={18} />
            <h2 className="text-[10px] font-black tracking-widest text-white/40 uppercase">음성 및 크루징 안내음 설정</h2>
          </div>

          <div className="bg-[#111111] border border-white/5 rounded-[32px] p-5 space-y-5">
            {/* AI Voice Toggle Switch */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h4 className="text-xs font-bold text-white">AI 음성 안내 활성화</h4>
                <p className="text-[9px] text-white/30 font-medium mt-0.5">내비게이션 및 안내음 소리를 켜거나 끕니다.</p>
              </div>
              <button 
                onClick={handleToggleVoiceEnabled}
                className={cn(
                  "w-12 h-6 rounded-full p-1 transition-colors duration-300 relative focus:outline-none shrink-0",
                  isVoiceEnabled ? "bg-nike-volt" : "bg-white/10"
                )}
              >
                <div 
                  className={cn(
                    "w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300",
                    isVoiceEnabled ? "translate-x-6 bg-black" : "translate-x-0"
                  )} 
                />
              </button>
            </div>

            {/* Speed Rate Segment */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/50 pl-1">안내 음성 속도</label>
              <div className="grid grid-cols-3 gap-2 bg-black p-1 rounded-2xl border border-white/5">
                {[
                  { rate: '0.8', label: '느리게' },
                  { rate: '1.0', label: '보통' },
                  { rate: '1.2', label: '빠르게' }
                ].map((item) => (
                  <button
                    key={item.rate}
                    onClick={() => handleSetVoiceRate(item.rate)}
                    className={cn(
                      "py-2 rounded-xl text-[10px] font-black tracking-tight transition-all active:scale-[0.98]",
                      voiceRate === item.rate
                        ? "bg-nike-volt text-black"
                        : "text-white/50 hover:text-white"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Personas Grid List */}
            <div className="space-y-3 pt-2 border-t border-white/5">
              <label className="text-[10px] font-bold text-white/50 pl-1">길안내 캐릭터 선택</label>
              <div className="grid grid-cols-1 gap-2.5">
                {VOICE_PERSONAS.map((persona) => {
                  const isSelected = selectedPersonaId === persona.id;
                  return (
                    <div 
                      key={persona.id}
                      onClick={() => handleSetPersona(persona.id)}
                      className={cn(
                        "p-4 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]",
                        isSelected 
                          ? "border-nike-volt bg-nike-volt/5 text-white" 
                          : "border-white/5 bg-black/45 text-white/60 hover:border-white/10"
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("text-xs font-black italic", isSelected ? "text-nike-volt" : "text-white")}>
                            {persona.name}
                          </span>
                          {isSelected && <span className="bg-nike-volt text-black text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase leading-none">선택됨</span>}
                        </div>
                        <p className="text-[9px] text-white/40 mt-1 truncate">{persona.description}</p>
                      </div>

                      <button
                        onClick={(e) => handlePreviewVoice(persona.id, e)}
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 hover:bg-white/10 active:scale-90 text-white transition-colors"
                        title="미리듣기"
                      >
                        <Volume2 size={14} className={isSelected ? "text-nike-volt animate-pulse" : "text-white"} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Language Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <Globe className="text-nike-volt" size={18} />
            <h2 className="text-[10px] font-black tracking-widest text-white/40 uppercase">
              {t('settings_language')}
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3 bg-[#111111] border border-white/5 p-4 rounded-[32px]">
            {[
              { id: 'ko', label: "KOR", full: t('lang_ko') },
              { id: 'en', label: "ENG", full: t('lang_en') },
              { id: 'ja', label: "JPN", full: t('lang_ja') }
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => changeLanguage(lang.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-4 px-2 rounded-2xl border transition-all duration-300 active:scale-95",
                  currentLanguage === lang.id 
                    ? "bg-nike-volt border-nike-volt text-black ring-4 ring-nike-volt/20" 
                    : "bg-black/40 border-white/5 text-white/40 hover:border-white/10"
                )}
              >
                <span className="text-[14px] font-black italic tracking-tighter mb-0.5">{lang.label}</span>
                <span className="text-[7px] font-bold opacity-70 uppercase leading-none">{lang.full}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 6. Gemini API Key */}
        <div className="space-y-4 bg-[#111111] border border-white/5 p-6 rounded-[32px] text-left">
          <div className="flex items-center gap-3 px-2">
            <Sparkles className="text-nike-volt" size={18} />
            <h2 className="text-[10px] font-black tracking-widest text-white/40 uppercase">
              Gemini API Key
            </h2>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <input 
                type={showApiKey ? "text" : "password"}
                placeholder="Enter Gemini API Key..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-xs font-mono text-white outline-none focus:border-nike-volt/50 transition-colors"
              />
              <button 
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-[10px] font-black font-mono transition-colors focus:outline-none"
              >
                {showApiKey ? "HIDE" : "SHOW"}
              </button>
            </div>
            <button 
              onClick={handleSaveApiKey}
              className="w-full h-12 bg-nike-volt text-black rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
            >
              Save API Key
            </button>
          </div>
        </div>

        {/* AI Chatbot Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <MessageSquare className="text-nike-volt" size={18} />
            <h2 className="text-[10px] font-black tracking-widest text-white/40 uppercase">AI 비서 설정</h2>
          </div>
          
          <div className="bg-[#111111] border border-white/5 rounded-[32px] p-5 space-y-5">
            {/* AI Persona/Tone selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/50 pl-1">AI 채팅 캐릭터 말투</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'standard', name: '일반/친절', desc: '친절하고 센스 있는 안내' },
                  { id: 'energetic', name: '열정 코치', desc: '활기차고 터프한 반말 코치' },
                  { id: 'calm', name: '감성/위로', desc: '나긋나긋하고 따뜻한 어조' },
                  { id: 'technical', name: '테크/분석', desc: '데이터 위주의 건조한 존댓말' }
                ].map((persona) => {
                  const isSelected = aiPersona === persona.id;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => handleSetAiPersona(persona.id)}
                      className={cn(
                        "p-3 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-[0.98] h-[72px]",
                        isSelected 
                          ? "border-nike-volt bg-nike-volt/5 text-white" 
                          : "border-white/5 bg-black/40 text-white/60 hover:border-white/10"
                      )}
                    >
                      <span className={cn("text-xs font-black italic", isSelected ? "text-nike-volt" : "text-white")}>
                        {persona.name}
                      </span>
                      <span className="text-[8px] text-white/40 mt-1 leading-snug">{persona.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Temperature settings */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-[10px] font-bold text-white/50 pl-1">답변 스타일 (AI 창의성 온도)</label>
              <div className="grid grid-cols-3 gap-2 bg-black p-1 rounded-2xl border border-white/5">
                {[
                  { value: 0.2, label: '이성적/단답형' },
                  { value: 0.7, label: '균형 잡힌' },
                  { value: 1.0, label: '창의적/풍부한' }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => handleSetAiTemperature(item.value)}
                    className={cn(
                      "py-2 rounded-xl text-[10px] font-black tracking-tight transition-all active:scale-[0.98]",
                      aiTemperature === item.value
                        ? "bg-nike-volt text-black"
                        : "text-white/50 hover:text-white"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 7. Interface Customizations (Theme Context) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            {theme === 'dark' ? <Moon className="text-nike-volt" size={18} /> : <Sun className="text-nike-volt" size={18} />}
            <h2 className="text-[10px] font-black tracking-widest text-white/40 uppercase">화면 테마 설정</h2>
          </div>
          
          <div className="bg-[#111111] border border-white/5 rounded-[32px] p-5 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">다크 모드 우선 적용</h4>
              <p className="text-[9px] text-white/30 font-medium mt-0.5">화면 눈부심을 줄이고 전력을 절약합니다.</p>
            </div>
            
            {/* Sliding Toggle Switch for Dark Mode */}
            <button 
              onClick={toggleTheme}
              className={cn(
                "w-12 h-6 rounded-full p-1 transition-colors duration-300 relative focus:outline-none shrink-0",
                theme === 'dark' ? "bg-nike-volt" : "bg-white/10"
              )}
            >
              <div 
                className={cn(
                  "w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300",
                  theme === 'dark' ? "translate-x-6 bg-black" : "translate-x-0"
                )} 
              />
            </button>
          </div>

          {/* Custom Theme Color Settings */}
          <div className="bg-[#111111] border border-white/5 rounded-[32px] p-5 space-y-4">
            <div className="text-left">
              <h4 className="text-xs font-bold text-white">커스텀 테마 색상 설정</h4>
              <p className="text-[9px] text-white/30 font-medium mt-0.5">앱 전체의 포인트 컬러와 배경 테마 톤을 설정합니다.</p>
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'volt', label: 'VOLT', colorClass: 'bg-[#CCFF00]' },
                { id: 'crimson', label: 'RED', colorClass: 'bg-[#FF3B30]' },
                { id: 'blue', label: 'BLUE', colorClass: 'bg-[#00E5FF]' },
                { id: 'green', label: 'GREEN', colorClass: 'bg-[#00FF85]' },
                { id: 'purple', label: 'PURPLE', colorClass: 'bg-[#DF00FF]' }
              ].map((themeOpt) => {
                const isActive = colorTheme === themeOpt.id;
                return (
                  <button
                    key={themeOpt.id}
                    onClick={() => setColorTheme(themeOpt.id as any)}
                    className={cn(
                      "flex flex-col items-center justify-center py-3 px-1 rounded-2xl border transition-all duration-300 active:scale-95 cursor-pointer",
                      isActive 
                        ? "border-nike-volt bg-nike-volt/5 text-white" 
                        : "bg-black/40 border-white/5 text-white/40 hover:border-white/10"
                    )}
                  >
                    <div className={cn("w-5 h-5 rounded-full shadow-inner mb-2 shrink-0", themeOpt.colorClass)} />
                    <span className="text-[8px] font-black italic tracking-tighter uppercase leading-none">{themeOpt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#111111] border border-white/5 rounded-[32px] p-5 flex items-center justify-between mt-4">
            <div>
              <h4 className="text-xs font-bold text-white">흑백 모드 적용</h4>
              <p className="text-[9px] text-white/30 font-medium mt-0.5">화면을 흑백톤으로 변경하여 피로도를 줄입니다.</p>
            </div>
            
            {/* Sliding Toggle Switch for Grayscale Mode */}
            <button 
              onClick={toggleGrayscale}
              className={cn(
                "w-12 h-6 rounded-full p-1 transition-colors duration-300 relative focus:outline-none shrink-0",
                isGrayscale ? "bg-nike-volt" : "bg-white/10"
              )}
            >
              <div 
                className={cn(
                  "w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300",
                  isGrayscale ? "translate-x-6 bg-black" : "translate-x-0"
                )} 
              />
            </button>
          </div>
        </div>

        {/* 8. Danger Zone & Logout */}
        <div className="space-y-3 pt-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-5 rounded-[24px] bg-white/5 border border-white/5 text-white/80 active:scale-[0.98] active:bg-white/10 transition-all font-black text-xs tracking-widest uppercase"
          >
            <LogOut size={18} />
            <span>{t('settings_logout')}</span>
          </button>

          <button 
            onClick={handleResetAllData}
            className="w-full flex items-center justify-center gap-3 p-5 rounded-[24px] bg-red-500/10 border border-red-500/20 text-red-500 active:scale-[0.98] active:bg-red-500/20 transition-all font-black text-xs tracking-widest uppercase"
          >
            <Trash2 size={18} />
            <span>전체 데이터 및 캐시 초기화</span>
          </button>
        </div>

        <div className="text-center pt-4">
          <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.2em]">Moodrive Premium v2.5.0</p>
        </div>
      </div>
    </div>
  );
};
