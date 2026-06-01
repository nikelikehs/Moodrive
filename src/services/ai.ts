export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export const generateDriveRecommendation = async (prompt: string, history: ChatMessage[] = []): Promise<string> => {
  const hasUserKey = !!localStorage.getItem('moodrive_gemini_key');
  
  try {
    // Dynamically retrieve the API Key from localStorage, env, or fallback
    const apiKey = localStorage.getItem('moodrive_gemini_key') || 
                   import.meta.env.VITE_GEMINI_API_KEY || 
                   '';

    // If it's a placeholder dummy key or empty, jump to fallback immediately
    if (!apiKey || apiKey.includes('dummy') || apiKey.trim() === '') {
      throw new Error("API 키가 설정되지 않았거나 올바르지 않습니다.");
    }

    const systemInstruction = "당신은 Moodrive의 초지능 AI 비서 'HK'입니다. 당신은 ChatGPT나 Gemini처럼 세상의 모든 지식을 가지고 있으며, 사용자와 일상적인 수다부터 전문적인 지식 상담까지 모든 대화가 가능합니다. 1. 드라이브 관련 주제는 전문적으로 답하세요. 2. 일상 대화나 철학적, 과학적 질문에도 깊이 있게 답하세요. 3. 항상 친절하고 센스 있는 말투를 유지하며 적절한 이모지를 사용하세요. 4. 답변은 모바일에서 읽기 좋게 핵심 위주로 구성하세요.";

    // Build contents array starting with the system context as a guiding prompt
    const contents = [];
    contents.push({
      role: 'user',
      parts: [{ 
        text: `[SYSTEM INSTRUCTION]\n${systemInstruction}\n\n(위 지침에 따라 Moodrive AI 비서 'HK'로서 대화를 시작하고 답변해 주세요.)` 
      }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: "알겠습니다. 지금부터 Moodrive의 초지능 AI 비서 'HK'로서 친절하고 센스 있는 말투로 안내해 드리겠습니다! 🏎️✨" }]
    });

    // Append existing history
    history.forEach(msg => {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      });
    });

    // Append current prompt
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    // Try multiple working models in a fallback chain to avoid high demand (503) or rate limits (429)
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-2.5-flash-lite',
      'gemini-3.1-flash-lite'
    ];

    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: contents
          })
        });

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          const errMsg = errJson.error?.message || response.statusText;
          throw new Error(`API 응답 오류 (HTTP ${response.status}): ${errMsg}`);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          return responseText;
        }
      } catch (err: any) {
        console.warn(`Failed with model ${model}, trying fallback...`, err);
        lastError = err;
      }
    }

    if (lastError) {
      throw lastError;
    }

    return '알겠습니다. 제가 최고의 드라이브 코스를 찾아드릴게요!';
  } catch (error: any) {
    console.warn("Gemini API Error:", error);
    
    // If the user explicitly provided their own key, return the detailed error message in the chat bubble
    if (hasUserKey) {
      return `[구글 제미나이 연동 실패 ⚠️]

원인: ${error.message}

Google AI Studio에서 발급받은 API 키가 유효한지 다시 확인해 주세요. 복사 시 앞뒤에 공백이 들어갔을 수도 있습니다.`;
    }
    
    // 로컬 지능형 응답 엔진 (API 키가 없거나 더미인 경우)
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('동서대') || lowerPrompt.includes('학교')) {
      return "동서대학교로 가는 가장 멋진 길을 찾았습니다! 캠퍼스 야경이 정말 예쁜 곳이죠. 안전하게 안내할까요? 🏎️";
    }
    if (lowerPrompt.includes('광안') || lowerPrompt.includes('바다')) {
      return "광안리 바닷가는 지금 이 시간에 최고의 드라이브 코스입니다! 광안대교의 조명을 즐기며 달리는 걸 추천드려요. 🌊";
    }
    if (lowerPrompt.includes('우울') || lowerPrompt.includes('기분')) {
      return "기분이 안 좋으실 때는 차창을 열고 시원한 바람을 맞으며 해안도로를 달려보는 건 어떨까요? 제가 옆에서 같이 있어 드릴게요. 🎧";
    }
    if (lowerPrompt.includes('맛집') || lowerPrompt.includes('배고파')) {
      return "드라이브 중간에 즐길 수 있는 주변 맛집들을 지도에 표시해 두었습니다! HK가 추천하는 장소들을 확인해 보세요. 🍔";
    }
    if (lowerPrompt.includes('안녕') || lowerPrompt.includes('반가워') || lowerPrompt.includes('hello')) {
      return "안녕하세요! Moodrive AI 비서 HK입니다. 어떤 드라이브 코스를 가고 싶으신가요? 😃";
    }
    
    // Default dynamic response that echoes the user's input so it doesn't look identical
    return `"${prompt}"에 대해 들었습니다. 현재 데모 모드로 작동 중입니다. 실제 실시간 인공지능 답변을 활성화하려면 Settings(설정) 메뉴에서 본인의 Gemini API Key를 등록해 주세요! ✨`;
  }
};

export const generateThreadTitle = async (firstMessage: string): Promise<string> => {
  try {
    const apiKey = localStorage.getItem('moodrive_gemini_key') || 
                   import.meta.env.VITE_GEMINI_API_KEY || 
                   '';

    if (!apiKey || apiKey.includes('dummy') || apiKey.trim() === '') {
      return firstMessage.length > 12 ? firstMessage.slice(0, 12) + '...' : firstMessage;
    }

    const prompt = `당신은 대화 제목 요약기입니다. 다음 사용자의 첫 질문을 핵심 단어 위주로 아주 간결하게 요약한 2~3단어(공백 포함 10자 이내)의 세련된 한글 제목을 생성해 주세요. 맨 뒤에 어울리는 이모지를 하나 붙여 주세요. 다른 추가 텍스트나 큰따옴표, 부연 설명은 일체 생략하고 오직 요약된 제목만 반환하세요.
예시: "남해안 드라이브 🌊", "기분 전환 음악 🎵", "동서대 코스 안내 🏎️"

사용자 메시지: "${firstMessage}"`;

    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-2.5-flash-lite',
      'gemini-3.1-flash-lite'
    ];

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{ text: prompt }]
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText && responseText.trim()) {
            return responseText.trim().replace(/[`'"“”\r\n]/g, '');
          }
        }
      } catch (err) {
        console.warn(`Thread title summary failed with model ${model}`, err);
      }
    }
  } catch (error) {
    console.error("Error generating thread title:", error);
  }

  return firstMessage.length > 12 ? firstMessage.slice(0, 12) + '...' : firstMessage;
};

