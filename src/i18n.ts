import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const en = {
  translation: {
    "app_name": "Moodrive",
    "nav_map": "MAP",
    "nav_routes": "ROUTES",
    "nav_ai": "AI VOICE",
    "nav_community": "COMMUNITY",
    "nav_garage": "GARAGE",
    "nav_settings": "SETTINGS",
    "map_search_placeholder": "SEARCH DESTINATION...",
    "pro_nav_start": "START PRO GUIDANCE",
    "selected_target": "TARGET DESTINATION",
    "est_time": "EST. TIME",
    "distance": "DISTANCE",
    "route_preview": "ROUTE PREVIEW",
    "nearby_places": "NEARBY PLACES",
    "ai_assistant": "AI ASSISTANT",
    "settings_language": "LANGUAGE",
    "settings_logout": "LOG OUT",
    "lang_ko": "KOREAN",
    "lang_en": "ENGLISH",
    "lang_ja": "JAPANESE"
  }
};

const ko = {
  translation: {
    "app_name": "무드라이브",
    "nav_map": "지도",
    "nav_routes": "추천코스",
    "nav_ai": "AI 음성",
    "nav_community": "커뮤니티",
    "nav_garage": "내 차고",
    "nav_settings": "설정",
    "map_search_placeholder": "목적지 검색...",
    "pro_nav_start": "프로 안내 시작",
    "selected_target": "선택된 목적지",
    "est_time": "예상 소요 시간",
    "distance": "거리",
    "route_preview": "경로 미리보기",
    "nearby_places": "검색된 장소",
    "ai_assistant": "AI 비서",
    "settings_language": "언어 설정",
    "settings_logout": "로그아웃",
    "lang_ko": "한국어",
    "lang_en": "영어",
    "lang_ja": "일본어"
  }
};

const ja = {
  translation: {
    "app_name": "ムードライブ",
    "nav_map": "マップ",
    "nav_routes": "コース",
    "nav_ai": "AI音声",
    "nav_community": "コミュニティ",
    "nav_garage": "ガレージ",
    "nav_settings": "設定",
    "map_search_placeholder": "目的地を検索...",
    "pro_nav_start": "プロ案内開始",
    "selected_target": "選択された目的地",
    "est_time": "予測時間",
    "distance": "距離",
    "route_preview": "ルートプレビュー",
    "nearby_places": "近くの場所",
    "ai_assistant": "AIアシ스탄트",
    "settings_language": "言語設定",
    "settings_logout": "ログアウト",
    "lang_ko": "韓国語",
    "lang_en": "英語",
    "lang_ja": "日本語"
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: { en, ko, ja },
    lng: 'ko',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
