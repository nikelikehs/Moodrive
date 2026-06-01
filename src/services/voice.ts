export type VoicePersona = {
  id: string;
  name: string;
  description: string;
  lang: string;
  pitch: number;
  rate: number;
};

export const VOICE_PERSONAS: VoicePersona[] = [
  { id: 'nike_male', name: 'NIKE_LEGEND', description: 'Energetic & Powerful Male', lang: 'ko-KR', pitch: 1.0, rate: 1.1 },
  { id: 'luna_female', name: 'LUNA_CALM', description: 'Soft & Gentle Night Vibe', lang: 'ko-KR', pitch: 1.2, rate: 0.9 },
  { id: 'jay_tech', name: 'JAY_SMART', description: 'Clear & Analytical Guide', lang: 'ko-KR', pitch: 0.9, rate: 1.0 },
  { id: 'mia_friendly', name: 'MIA_FRIEND', description: 'Warm & Close Companion', lang: 'ko-KR', pitch: 1.3, rate: 1.0 },
  { id: 'rex_bass', name: 'REX_DEEP', description: 'Heavy & Trusted Bass', lang: 'ko-KR', pitch: 0.6, rate: 0.8 },
  { id: 'aria_bright', name: 'ARIA_GLOW', description: 'Positive & Bright Energy', lang: 'ko-KR', pitch: 1.4, rate: 1.1 },
];

class VoiceService {
  private selectedPersona: VoicePersona = VOICE_PERSONAS[0];
  private recognition: any = null;
  private onResultCallback: ((text: string) => void) | null = null;
  private isStarted = false;

  constructor() {
    this.initRecognition();
    if (typeof window !== 'undefined') {
      const savedPersonaId = localStorage.getItem('moodrive_selected_persona_id');
      if (savedPersonaId) {
        const persona = VOICE_PERSONAS.find(p => p.id === savedPersonaId);
        if (persona) this.selectedPersona = persona;
      }
    }
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'ko-KR';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
    this.recognition.continuous = true; // Keep continuous to process long-running voice flows

    this.recognition.onstart = () => {
      this.isStarted = true;
      if ((window as any)._onSpeechStart) (window as any)._onSpeechStart();
    };

    this.recognition.onspeechstart = () => {
      if ((window as any)._onSpeechStart) (window as any)._onSpeechStart();
    };

    this.recognition.onresult = (event: any) => {
      if (!this.onResultCallback) return;
      // Loop through all new results to read subsequent speech in continuous mode
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const text = event.results[i][0].transcript;
          console.log("Speech Recognized:", text);
          this.onResultCallback(text);
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error:", event.error);
      if (event.error === 'no-speech') return;
      if (event.error === 'not-allowed') {
        alert("마이크 권한이 거부되었습니다. 주소창 왼쪽의 자물쇠를 눌러 마이크를 허용해주세요.");
        this.onResultCallback = null;
      }
    };

    this.recognition.onend = () => {
      this.isStarted = false;
      // If we still have an active callback, restart recognition automatically after a short delay
      if (this.onResultCallback) {
        setTimeout(() => {
          this.startRecognition();
        }, 300);
      }
    };
  }

  private startRecognition() {
    if (!this.recognition || this.isStarted) return;
    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition start failed:", e);
    }
  }

  setSelectedPersona(id: string) {
    const persona = VOICE_PERSONAS.find(p => p.id === id);
    if (persona) {
      this.selectedPersona = persona;
      localStorage.setItem('moodrive_selected_persona_id', id);
    }
  }

  getSelectedPersona() {
    return this.selectedPersona;
  }

  speak(text: string) {
    if (!window.speechSynthesis) return;
    
    // Stop any existing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Find a suitable Korean voice if possible
    const koVoice = voices.find(v => v.lang.includes('ko'));
    if (koVoice) utterance.voice = koVoice;
    
    utterance.pitch = this.selectedPersona.pitch;
    
    // Apply voice speed multiplier from local storage dynamically
    const rateFactor = parseFloat(localStorage.getItem('moodrive_voice_rate') || '1.0');
    utterance.rate = Math.max(0.5, Math.min(2.0, this.selectedPersona.rate * rateFactor));
    utterance.lang = this.selectedPersona.lang;

    window.speechSynthesis.speak(utterance);
  }

  listen(onResult: (text: string) => void) {
    if (!this.recognition) {
      this.initRecognition();
    }
    this.onResultCallback = onResult;
    this.startRecognition();
    return this.recognition;
  }

  stopListening() {
    this.onResultCallback = null;
    if (this.recognition && this.isStarted) {
      try {
        this.recognition.abort();
      } catch (e) {
        console.warn("Aborting recognition failed:", e);
      }
    }
  }
}

export const voiceService = new VoiceService();
