import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  type ConfirmationResult
} from 'firebase/auth';
import { auth } from '../firebase';

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google Login Error", error);
    throw error;
  }
};

export const loginWithApple = async () => {
  try {
    const provider = new OAuthProvider('apple.com');
    // Request full name and email if needed
    provider.addScope('email');
    provider.addScope('name');
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Apple Login Error", error);
    throw error;
  }
};

export const loginWithKakao = async () => {
  try {
    // Requires setting up custom OIDC in Firebase Authentication -> Sign-in methods
    const provider = new OAuthProvider('oidc.kakao');
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Kakao Login Error", error);
    throw error;
  }
};

// Setup Recaptcha (invisible) for Phone Auth
export const setupRecaptcha = (containerId: string) => {
  if (!(window as any).recaptchaVerifier) {
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      }
    });
  }
};

export const requestPhoneOtp = async (phoneNumber: string, containerId: string): Promise<ConfirmationResult> => {
  try {
    setupRecaptcha(containerId);
    const appVerifier = (window as any).recaptchaVerifier;
    // ensure +82 prefix for KR if not manually inputted
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+82${phoneNumber.startsWith('0') ? phoneNumber.slice(1) : phoneNumber}`;
    
    const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
    return confirmationResult;
  } catch (error) {
    console.error("Phone OTP Request Error", error);
    throw error;
  }
};

export const verifyPhoneOtp = async (confirmationResult: ConfirmationResult, otpCode: string) => {
  try {
    const result = await confirmationResult.confirm(otpCode);
    return result.user;
  } catch (error) {
    console.error("Phone OTP Verification Error", error);
    throw error;
  }
};
