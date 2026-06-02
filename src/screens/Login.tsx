import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogIn, 
  Smartphone, 
  UserCircle2,
  Loader2,
  Mail,
  Lock,
  ArrowLeft,
  Key,
  CheckCircle2,
  X
} from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier
} from 'firebase/auth';
import { auth } from '../firebase';


export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  // Check for active user session on mount for auto-login
  useEffect(() => {
    const savedUser = localStorage.getItem('moodrive_user');
    if (savedUser) {
      navigate('/app/map', { replace: true });
    }
  }, [navigate]);
  
  // Navigation states
  const [activeForm, setActiveForm] = useState<'NONE' | 'EMAIL' | 'PHONE'>('NONE');
  
  // Email states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Phone states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [phoneError, setPhoneError] = useState('');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  // Success indicator
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Load Kakao SDK on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Load script if not exists
    if (!(window as any).Kakao) {
      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
      script.onload = () => {
        try {
          if ((window as any).Kakao && !(window as any).Kakao.isInitialized()) {
            (window as any).Kakao.init('338f0930685d328dadea60e03f7907a8');
          }
        } catch (e) {
          console.warn("Kakao SDK loading failed", e);
        }
      };
      document.head.appendChild(script);
    } else {
      try {
        if (!(window as any).Kakao.isInitialized()) {
          (window as any).Kakao.init('338f0930685d328dadea60e03f7907a8');
        }
      } catch (e) {}
    }
  }, []);

  // Firebase auth config check helper
  const isDummyFirebase = 
    !import.meta.env.VITE_FIREBASE_PROJECT_ID || 
    import.meta.env.VITE_FIREBASE_PROJECT_ID.includes('dummy');

  // Trigger success transition
  const triggerSuccess = () => {
    setLoginSuccess(true);
    setTimeout(() => {
      navigate('/app/map');
    }, 1500);
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setLoading('google');
    try {
      if (isDummyFirebase) {
        // Fallback for demo
        localStorage.setItem('moodrive_user', JSON.stringify({ displayName: 'Google User', email: 'google@moodrive.io' }));
        triggerSuccess();
        return;
      }
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      localStorage.setItem('moodrive_user', JSON.stringify({
        uid: user.uid,
        displayName: user.displayName || 'Google User',
        photoURL: user.photoURL || '',
        email: user.email || ''
      }));
      triggerSuccess();
    } catch (error: any) {
      console.error("Google login failed", error);
      alert(`Google Login Error: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  // Apple Login
  // const _handleAppleLogin = async () => {
  //   setLoading('apple');
  //   try {
  //     if (isDummyFirebase) {
  //       localStorage.setItem('moodrive_user', JSON.stringify({ displayName: 'Apple User', email: 'apple@moodrive.io' }));
  //       triggerSuccess();
  //       return;
  //     }
  //     const provider = new OAuthProvider('apple.com');
  //     await signInWithPopup(auth, provider);
  //     triggerSuccess();
  //   } catch (error: any) {
  //     console.error("Apple login failed", error);
  //     alert(`Apple 로그인 실패 (Firebase 콘솔 연동이 필요합니다):\n${error.message}`);
  //   } finally {
  //     setLoading(null);
  //   }
  // };

  // Kakao Login via Web SDK
  // const _handleKakaoLogin = () => {
  //   setLoading('kakao');
  //   try {
  //     const Kakao = (window as any).Kakao;
  //     if (!Kakao) {
  //       throw new Error("Kakao SDK not loaded yet. Please wait a moment.");
  //     }
  //
  //     if (isDummyFirebase) {
  //       localStorage.setItem('moodrive_user', JSON.stringify({ displayName: '카카오 유저', email: 'kakao@moodrive.io' }));
  //       triggerSuccess();
  //       return;
  //     }
  //
  //     Kakao.Auth.login({
  //       success: function() {
  //         Kakao.API.request({
  //           url: '/v2/user/me',
  //           success: function(res: any) {
  //             const account = res.kakao_account;
  //             localStorage.setItem('moodrive_user', JSON.stringify({
  //               uid: `kakao_${res.id}`,
  //               displayName: account?.profile?.nickname || 'Kakao User',
  //               photoURL: account?.profile?.thumbnail_image_url || '',
  //               email: account?.email || 'kakao@moodrive.io'
  //             }));
  //             triggerSuccess();
  //           },
  //           fail: function(err: any) {
  //             console.error("Kakao User me failed", err);
  //             alert("카카오 사용자 정보를 가져오는 도중 오류가 발생했습니다.");
  //           }
  //         });
  //       },
  //       fail: function(err: any) {
  //         console.error("Kakao Auth Login failed", err);
  //         alert("카카오 로그인 도중 인증에 실패했습니다.");
  //       }
  //     });
  //   } catch (error: any) {
  //     console.warn("Kakao login exception - entering demo mode", error);
  //     // Demo fallback
  //     localStorage.setItem('moodrive_user', JSON.stringify({ displayName: '카카오 데모 유저', email: 'kakao_demo@moodrive.io' }));
  //     triggerSuccess();
  //   } finally {
  //     setLoading(null);
  //   }
  // };

  // Email / Password Login & Sign Up
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setEmailError("이메일과 비밀번호를 입력해 주세요.");
      return;
    }
    
    setLoading('email');
    setEmailError('');

    try {
      if (isDummyFirebase) {
        localStorage.setItem('moodrive_user', JSON.stringify({ displayName: email.split('@')[0], email }));
        triggerSuccess();
        return;
      }

      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      triggerSuccess();
    } catch (error: any) {
      console.error("Email auth failed", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setEmailError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else if (error.code === 'auth/email-already-in-use') {
        setEmailError("이미 사용 중인 이메일 주소입니다.");
      } else if (error.code === 'auth/weak-password') {
        setEmailError("비밀번호는 최소 6자리 이상이어야 합니다.");
      } else {
        setEmailError(error.message);
      }
    } finally {
      setLoading(null);
    }
  };

  // Phone Login Setup & OTP Send
  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setPhoneError("전화번호를 입력해 주세요.");
      return;
    }

    setLoading('phone_send');
    setPhoneError('');

    try {
      if (isDummyFirebase) {
        // Dummy verification setup
        alert("데모 모드: 인증번호 '123456'을 입력하세요.");
        setConfirmationResult({
          confirm: async (code: string) => {
            if (code === '123456') {
              localStorage.setItem('moodrive_user', JSON.stringify({ displayName: 'Phone User', email: 'phone@moodrive.io' }));
              return true;
            }
            throw new Error("Invalid verification code");
          }
        });
        setLoading(null);
        return;
      }

      // Initialize Recaptcha
      let verifier = recaptchaVerifier;
      if (!verifier) {
        verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {}
        });
        setRecaptchaVerifier(verifier);
      }

      // Standardize Phone formatting (e.g. +821012345678)
      let formattedPhone = phoneNumber.trim().replace(/-/g, '');
      if (formattedPhone.startsWith('010')) {
        formattedPhone = `+82${formattedPhone.slice(1)}`;
      }

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(confirmation);
    } catch (error: any) {
      console.error("Phone verification failed", error);
      setPhoneError(`인증번호 발송 실패: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  // OTP Code Verification
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setPhoneError("인증번호 6자리를 입력해 주세요.");
      return;
    }

    setLoading('phone_verify');
    setPhoneError('');

    try {
      await confirmationResult.confirm(verificationCode);
      triggerSuccess();
    } catch (error: any) {
      console.error("Verification code confirmation failed", error);
      setPhoneError("인증번호가 일치하지 않거나 만료되었습니다.");
    } finally {
      setLoading(null);
    }
  };

  // Guest Login
  const handleGuestLogin = async () => {
    setLoading('guest');
    try {
      if (isDummyFirebase) {
        localStorage.setItem('moodrive_user', JSON.stringify({ displayName: '게스트', email: 'guest@moodrive.io' }));
        triggerSuccess();
        return;
      }
      await signInAnonymously(auth);
      triggerSuccess();
    } catch (error) {
       localStorage.setItem('moodrive_user', JSON.stringify({ displayName: '게스트', email: 'guest@moodrive.io' }));
       triggerSuccess();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex justify-center items-center p-0 md:p-8 transition-colors duration-300">
      <div className="w-full h-[100dvh] md:h-[844px] md:max-h-[100vh] max-w-[390px] bg-[#0a0a0a] md:rounded-[40px] border-none overflow-hidden relative flex flex-col transition-colors duration-300 shadow-none">
        <div className="w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-between p-10 font-sans relative overflow-hidden">
      
      {/* Invisible Recaptcha Target */}
      <div id="recaptcha-container"></div>

      {/* Success Animation Overlay */}
      {loginSuccess && (
        <div className="absolute inset-0 bg-[#0a0a0a] z-[200] flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-nike-volt rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle2 size={44} className="text-black" />
          </div>
          <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">MOODRIVE UNLOCKED</h3>
          <p className="text-[10px] font-black italic text-nike-volt uppercase tracking-widest mt-2">반갑습니다! 드라이빙을 시작합니다.</p>
        </div>
      )}

      {/* Top Section - Logo */}
      <div className="mt-14 flex flex-col items-center shrink-0">
        <div className="w-16 h-16 bg-nike-volt rounded-[20px] flex items-center justify-center mb-5 animate-in zoom-in-50 duration-700">
           <LogIn className="text-black" size={28} />
        </div>
        <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-1">
          MOODRIVE
        </h1>
        <p className="text-[8px] font-black italic text-nike-volt tracking-widest uppercase opacity-85">
          Unlock your perfect journey
        </p>
      </div>

      {/* Middle Section - Form or Menu */}
      <div className="w-full my-auto py-6 max-h-[55%] overflow-y-auto no-scrollbar">
        
        {/* PROVIDER MENU SCREEN */}
        {activeForm === 'NONE' && (
          <div className="w-full space-y-3.5">
            <button 
              onClick={handleGoogleLogin}
              disabled={!!loading}
              className="w-full h-15 bg-white hover:bg-white/95 rounded-2xl flex items-center px-7 gap-4 active:scale-95 transition-all text-black"
            >
              {loading === 'google' ? <Loader2 className="animate-spin text-black" size={18} /> : <LogIn size={18} />}
              <span className="flex-1 text-[11px] font-black tracking-widest text-left uppercase">Google 계정으로 계속</span>
            </button>

            {/* Kakao and Apple login hidden temporarily as requested */}

            <button 
              onClick={() => setActiveForm('PHONE')}
              disabled={!!loading}
              className="w-full h-15 bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl flex items-center px-7 gap-4 active:scale-95 transition-all text-white"
            >
              <Smartphone size={18} />
              <span className="flex-1 text-[11px] font-black tracking-widest text-left uppercase">휴대폰 번호로 인증</span>
            </button>

            <button 
              onClick={() => setActiveForm('EMAIL')}
              disabled={!!loading}
              className="w-full h-15 bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl flex items-center px-7 gap-4 active:scale-95 transition-all text-white"
            >
              <Mail size={18} />
              <span className="flex-1 text-[11px] font-black tracking-widest text-left uppercase">이메일/비밀번호 로그인</span>
            </button>

            <div className="flex items-center gap-4 py-1.5">
              <div className="h-[1px] flex-1 bg-white/5"></div>
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">OR</span>
              <div className="h-[1px] flex-1 bg-white/5"></div>
            </div>

            <button 
              onClick={handleGuestLogin}
              disabled={!!loading}
              className="w-full h-12 bg-transparent border border-white/5 rounded-2xl flex items-center justify-center gap-2 text-white/40 active:scale-95 transition-all hover:text-white"
            >
              <UserCircle2 size={16} />
              <span className="text-[9px] font-black tracking-widest uppercase">게스트로 둘러보기</span>
            </button>
          </div>
        )}

        {/* EMAIL LOGIN / SIGN UP FORM */}
        {activeForm === 'EMAIL' && (
          <form onSubmit={handleEmailAuth} className="w-full space-y-4 animate-in slide-in-from-right duration-300 text-left">
            <div className="flex items-center gap-3 mb-4">
              <button 
                type="button"
                onClick={() => { setActiveForm('NONE'); setEmailError(''); }}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 active:scale-90"
              >
                <ArrowLeft size={16} />
              </button>
              <h3 className="text-sm font-black italic tracking-tighter text-white uppercase">
                {isSignUp ? 'REGISTER ACCOUNT' : 'EMAIL SIGN IN'}
              </h3>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"><Mail size={16} /></span>
                <input 
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-13 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-xs text-white outline-none focus:border-nike-volt/40 transition-colors uppercase font-bold"
                />
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"><Lock size={16} /></span>
                <input 
                  type="password"
                  placeholder="PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-13 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-xs text-white outline-none focus:border-nike-volt/40 transition-colors font-bold"
                />
              </div>
            </div>

            {emailError && (
              <p className="text-[10px] text-red-500 font-bold px-1">{emailError}</p>
            )}

            <div className="space-y-3 pt-2">
              <button 
                type="submit"
                disabled={loading === 'email'}
                className="w-full h-13 bg-nike-volt text-black rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                {loading === 'email' ? <Loader2 className="animate-spin" size={16} /> : <LogIn size={16} />}
                {isSignUp ? 'CREATE ACCOUNT' : 'LOG IN'}
              </button>

              <button 
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-center text-[10px] font-black text-white/30 uppercase tracking-wider hover:text-white/60 py-1"
              >
                {isSignUp ? '이미 계정이 있으신가요? 로그인' : '처음이신가요? 이메일로 가입하기'}
              </button>
            </div>
          </form>
        )}

        {/* PHONE NUMBER SMS AUTH FORM */}
        {activeForm === 'PHONE' && (
          <div className="w-full animate-in slide-in-from-right duration-300 text-left">
            <div className="flex items-center gap-3 mb-4">
              <button 
                type="button"
                onClick={() => { setActiveForm('NONE'); setPhoneError(''); setConfirmationResult(null); }}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 active:scale-90"
              >
                <ArrowLeft size={16} />
              </button>
              <h3 className="text-sm font-black italic tracking-tighter text-white uppercase">
                PHONE NUMBER AUTH
              </h3>
            </div>

            {!confirmationResult ? (
              // PHONE INPUT SCREEN
              <form onSubmit={handleSendVerificationCode} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"><Smartphone size={16} /></span>
                  <input 
                    type="tel"
                    placeholder="PHONE (ex: 01012345678)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full h-13 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-xs text-white outline-none focus:border-nike-volt/40 transition-colors uppercase font-bold"
                  />
                </div>

                {phoneError && (
                  <p className="text-[10px] text-red-500 font-bold px-1">{phoneError}</p>
                )}

                <button 
                  type="submit"
                  disabled={loading === 'phone_send'}
                  className="w-full h-13 bg-nike-volt text-black rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  {loading === 'phone_send' ? <Loader2 className="animate-spin" size={16} /> : <LogIn size={16} />}
                  인증번호 전송
                </button>
              </form>
            ) : (
              // OTP INPUT SCREEN
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"><Key size={16} /></span>
                  <input 
                    type="text"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="6-DIGIT VERIFICATION CODE"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full h-13 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-xs text-white outline-none focus:border-nike-volt/40 transition-colors tracking-[0.2em] font-mono font-bold text-center"
                  />
                </div>

                {phoneError && (
                  <p className="text-[10px] text-red-500 font-bold px-1">{phoneError}</p>
                )}

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => { setConfirmationResult(null); setVerificationCode(''); }}
                    className="w-13 h-13 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center active:scale-95 transition-transform text-white/50"
                  >
                    <X size={18} />
                  </button>
                  <button 
                    type="submit"
                    disabled={loading === 'phone_verify'}
                    className="flex-1 h-13 bg-nike-volt text-black rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform flex items-center justify-center gap-2"
                  >
                    {loading === 'phone_verify' ? <Loader2 className="animate-spin" size={16} /> : <LogIn size={16} />}
                    인증 및 로그인
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>

      {/* Bottom Section - Footer */}
      <div className="text-center shrink-0">
        <p className="text-[9px] text-white/20 font-medium leading-relaxed max-w-[200px]">
          By continuing, you agree to our <span className="text-white/40 underline">Terms of Service</span> and <span className="text-white/40 underline">Privacy Policy</span>.
        </p>
      </div>
        </div>
      </div>
    </div>
  );
};
