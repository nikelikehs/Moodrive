import { collection, addDoc, getDocs, doc, setDoc, deleteDoc, getDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface AttachedCourse {
  title: string;
  distance?: string;
  duration?: string;
  type: 'RECOMMENDED' | 'LOG';
}

export interface Post {
  id?: string;
  authorName: string;
  authorLocation: string;
  content: string;
  likes: number;
  comments: number;
  image?: string;
  video?: string;
  createdAt?: any;
  attachedCourse?: AttachedCourse;
  commentList?: { id: string; authorName: string; content: string; createdAt: number }[];
  likedByMe?: boolean;
}

export interface ChatMessage {
  id: string;
  authorName: string;
  text: string;
  createdAt: number;
}

export interface ChatRoom {
  id: string;
  title: string;
  category: 'REGION' | 'VIBE' | 'PEOPLE' | 'GEAR';
  participants: number;
  lastMsg: string;
  tags: string[];
  messages?: ChatMessage[];
}

// Detect if Firebase is configured with dummy/placeholder values
const isDummyFirebase = 
  !import.meta.env.VITE_FIREBASE_PROJECT_ID || 
  import.meta.env.VITE_FIREBASE_PROJECT_ID.includes('dummy');

// --- Mock LocalStorage DB Helpers for Fallback ---
const getLocalPosts = (): Post[] => {
  const data = localStorage.getItem('moodrive_posts');
  let parsed: Post[] = [];
  try {
    if (data) {
      parsed = JSON.parse(data);
    }
  } catch (e) {
    console.error("Error parsing local posts:", e);
  }
  // Always verify if we have our updated 4 default mock posts
  if (parsed.length < 4) {
    const defaultPosts: Post[] = [
      {
        id: 'mock-1',
        authorName: 'NIGHT_PILOT',
        authorLocation: 'SEOUL',
        content: '북악스카이웨이 코스는 언제 와도 야경이 죽여줍니다. 오늘 날씨도 맑고 선선해서 드라이브하기 딱 좋네요! 🌃🚙',
        image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=2940&auto=format&fit=crop',
        likes: 24,
        comments: 2,
        createdAt: { seconds: Math.floor(Date.now() / 1000) - 3600 },
        attachedCourse: {
          title: '서울 북악스카이웨이 야간 드라이브',
          distance: '24km',
          duration: '1h 20m',
          type: 'RECOMMENDED'
        },
        likedByMe: false,
        commentList: [
          { id: 'c1', authorName: 'SEOUL_RACER', content: '저도 어제 갔었는데 역시 최고네요! 👍', createdAt: Date.now() - 300000 },
          { id: 'c2', authorName: 'V8_SOUND', content: '오늘 밤에 가시는 분 또 계신가요?', createdAt: Date.now() - 100000 }
        ]
      },
      {
        id: 'mock-2',
        authorName: 'SPEED_DEMON',
        authorLocation: 'INCHEON',
        content: '인천대교 밤바람 쐬면서 시원하게 쏘고 왔습니다! 역시 직빨 크루징은 여기가 최곱니다. 배기음 영상도 올립니다! 🏎️💨',
        video: 'https://assets.mixkit.co/videos/preview/mixkit-under-a-bridge-with-cars-light-trails-at-night-42217-large.mp4',
        likes: 56,
        comments: 1,
        createdAt: { seconds: Math.floor(Date.now() / 1000) - 7200 },
        attachedCourse: {
          title: 'Urban Night Escape',
          distance: '42.5km',
          duration: '1h 12m',
          type: 'LOG'
        },
        likedByMe: true,
        commentList: [
          { id: 'c3', authorName: 'JDM_LOVE', content: '와 영상 터널 소리 대박이네요 ㄷㄷ 배기음 지립니다!', createdAt: Date.now() - 400000 }
        ]
      },
      {
        id: 'mock-3',
        authorName: 'ISLAND_CRUISER',
        authorLocation: 'JEJU',
        content: '제주도 신창 풍차 해안도로 드라이브! 노을이 너무 이뻐서 오픈카 뚜껑 열고 천천히 달렸습니다. 인생 샷 건졌네요. 🌅🌊',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2940&auto=format&fit=crop',
        likes: 98,
        comments: 2,
        createdAt: { seconds: Math.floor(Date.now() / 1000) - 14400 },
        attachedCourse: {
          title: '제주 신창 풍차 해안도로',
          distance: '18km',
          duration: '45m',
          type: 'RECOMMENDED'
        },
        likedByMe: false,
        commentList: [
          { id: 'c4', authorName: 'WINDY_DAY', content: '와 노을 미쳤네요... 당장 제주도 비행기 끊고 싶습니다 ㅠㅠ', createdAt: Date.now() - 200000 },
          { id: 'c5', authorName: 'MINI_COOPER', content: '여기는 뚜껑 열고 해 질 녘에 달리는 게 진리죠! 부럽습니다.', createdAt: Date.now() - 50000 }
        ]
      },
      {
        id: 'mock-4',
        authorName: 'TOUGE_KING',
        authorLocation: 'GANGWON',
        content: '미시령 고개 와인딩 완료. 타이어 타는 냄새가 찌릿하네요. 코너 탈출할 때의 서스펜션 반응은 잊을 수 없습니다. ⛰️🏁',
        image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2938&auto=format&fit=crop',
        likes: 41,
        comments: 1,
        createdAt: { seconds: Math.floor(Date.now() / 1000) - 28800 },
        attachedCourse: {
          title: 'Mountain Peak Vibe',
          distance: '35.1km',
          duration: '55m',
          type: 'LOG'
        },
        likedByMe: false,
        commentList: [
          { id: 'c6', authorName: 'SLIDE_BOY', content: '고갯길 코너 진입 시 오버스티어 조심하세요! 노면 모래가 많습니다.', createdAt: Date.now() - 600000 }
        ]
      }
    ];
    localStorage.setItem('moodrive_posts', JSON.stringify(defaultPosts));
    return defaultPosts;
  }
  return parsed;
};

export const fetchPosts = async (): Promise<Post[]> => {
  if (isDummyFirebase) {
    return getLocalPosts().sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }

  const fetchPromise = (async () => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const posts: Post[] = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });
    // Cache remote posts locally for instant loads next time
    localStorage.setItem('moodrive_posts', JSON.stringify(posts));
    return posts;
  })();

  const timeoutPromise = new Promise<Post[]>((_, reject) =>
    setTimeout(() => reject(new Error("Firestore fetch posts timeout")), 1500)
  );

  try {
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    console.error("Error or timeout fetching posts:", error);
    return getLocalPosts().sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }
};

export const createPost = async (postData: Omit<Post, 'id' | 'createdAt'>) => {
  if (isDummyFirebase) {
    const posts = getLocalPosts();
    const newPost: Post = {
      ...postData,
      id: `post_${Date.now()}`,
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
      commentList: [],
      likedByMe: false
    };
    posts.unshift(newPost);
    localStorage.setItem('moodrive_posts', JSON.stringify(posts));
    return newPost.id;
  }

  const writePromise = (async () => {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  })();

  const timeoutPromise = new Promise<string>((_, reject) =>
    setTimeout(() => reject(new Error("Firestore createPost timeout")), 2000)
  );

  try {
    return await Promise.race([writePromise, timeoutPromise]);
  } catch (error) {
    console.error("Error or timeout creating post on Firestore, falling back to local:", error);
    const posts = getLocalPosts();
    const newPost: Post = {
      ...postData,
      id: `post_${Date.now()}`,
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
      commentList: [],
      likedByMe: false
    };
    posts.unshift(newPost);
    localStorage.setItem('moodrive_posts', JSON.stringify(posts));
    return newPost.id;
  }
};

export const likePost = async (postId: string): Promise<Post> => {
  const posts = getLocalPosts();
  const index = posts.findIndex(p => p.id === postId);
  if (index !== -1) {
    const post = posts[index];
    if (post.likedByMe) {
      post.likes = Math.max(0, post.likes - 1);
      post.likedByMe = false;
    } else {
      post.likes += 1;
      post.likedByMe = true;
    }
    posts[index] = post;
    localStorage.setItem('moodrive_posts', JSON.stringify(posts));
    return post;
  }
  throw new Error("Post not found");
};

export const addPostComment = async (postId: string, authorName: string, content: string): Promise<Post> => {
  const posts = getLocalPosts();
  const index = posts.findIndex(p => p.id === postId);
  if (index !== -1) {
    const post = posts[index];
    if (!post.commentList) post.commentList = [];
    const newComment = {
      id: `comment_${Date.now()}`,
      authorName: authorName.toUpperCase(),
      content: content,
      createdAt: Date.now()
    };
    post.commentList.push(newComment);
    post.comments = post.commentList.length;
    posts[index] = post;
    localStorage.setItem('moodrive_posts', JSON.stringify(posts));
    return post;
  }
  throw new Error("Post not found");
};

// --- Chat Room Helpers ---
const DEFAULT_CHAT_ROOMS: ChatRoom[] = [
  { id: 'r1', title: 'SEOUL NIGHT RIDERS', category: 'REGION', participants: 42, lastMsg: 'Anyone up for Bukak Skyway?', tags: ['SEOUL', 'MIDNIGHT'] },
  { id: 'r2', title: 'MATTE BLACK LOVERS', category: 'VIBE', participants: 128, lastMsg: 'Just detailed my car.', tags: ['AESTHETIC', 'MATTE'] },
  { id: 'r3', title: 'GANGWON COAST CRUISE', category: 'REGION', participants: 15, lastMsg: 'The coffee here is great.', tags: ['SEA', 'DRIVE'] },
  { id: 'r4', title: 'PRO DRIFTERS HUB', category: 'PEOPLE', participants: 8, lastMsg: 'Tracks are open at 9.', tags: ['PRO', 'TRACK'] },
  { id: 'r5', title: 'EV ELECTRIFIED CRUISE', category: 'GEAR', participants: 23, lastMsg: 'Charging at supercharger now.', tags: ['EV', 'TECH'] }
];

export const fetchChatRooms = async (): Promise<ChatRoom[]> => {
  try {
    const roomsData = localStorage.getItem('moodrive_chat_rooms');
    if (!roomsData) {
      localStorage.setItem('moodrive_chat_rooms', JSON.stringify(DEFAULT_CHAT_ROOMS));
      return DEFAULT_CHAT_ROOMS;
    }
    return JSON.parse(roomsData);
  } catch (error) {
    console.error("Error parsing chat rooms, resetting cache:", error);
    localStorage.setItem('moodrive_chat_rooms', JSON.stringify(DEFAULT_CHAT_ROOMS));
    return DEFAULT_CHAT_ROOMS;
  }
};

export const createChatRoom = async (title: string, category: 'REGION' | 'VIBE' | 'PEOPLE' | 'GEAR', tags: string[]): Promise<string> => {
  const rooms = await fetchChatRooms();
  const newRoomId = `room_${Date.now()}`;
  const newRoom: ChatRoom = {
    id: newRoomId,
    title: title.toUpperCase(),
    category,
    participants: 1,
    lastMsg: 'Welcome to the new channel!',
    tags: tags.map(t => t.toUpperCase().replace('#', ''))
  };
  rooms.unshift(newRoom);
  localStorage.setItem('moodrive_chat_rooms', JSON.stringify(rooms));
  return newRoomId;
};

export const fetchChatMessages = async (roomId: string): Promise<ChatMessage[]> => {
  try {
    const allMessages = JSON.parse(localStorage.getItem(`moodrive_chat_messages_${roomId}`) || '[]');
    if (allMessages.length === 0) {
      const welcomeMsgs: ChatMessage[] = [
        { id: 'welcome', authorName: 'SYSTEM', text: 'This is the start of the chat. Say hello!', createdAt: Date.now() - 60000 }
      ];
      localStorage.setItem(`moodrive_chat_messages_${roomId}`, JSON.stringify(welcomeMsgs));
      return welcomeMsgs;
    }
    return allMessages;
  } catch (error) {
    console.error("Error parsing chat messages, resetting:", error);
    const welcomeMsgs: ChatMessage[] = [
      { id: 'welcome', authorName: 'SYSTEM', text: 'This is the start of the chat. Say hello!', createdAt: Date.now() - 60000 }
    ];
    localStorage.setItem(`moodrive_chat_messages_${roomId}`, JSON.stringify(welcomeMsgs));
    return welcomeMsgs;
  }
};

export const sendChatMessage = async (roomId: string, authorName: string, text: string): Promise<ChatMessage> => {
  const messages = await fetchChatMessages(roomId);
  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}`,
    authorName: authorName.toUpperCase(),
    text,
    createdAt: Date.now()
  };
  messages.push(newMsg);
  localStorage.setItem(`moodrive_chat_messages_${roomId}`, JSON.stringify(messages));

  const rooms = await fetchChatRooms();
  const roomIndex = rooms.findIndex(r => r.id === roomId);
  if (roomIndex !== -1) {
    rooms[roomIndex].lastMsg = text;
    rooms[roomIndex].participants = Math.max(rooms[roomIndex].participants, messages.length);
    localStorage.setItem('moodrive_chat_rooms', JSON.stringify(rooms));
  }

  return newMsg;
};

export const toggleFavorite = async (userId: string, courseId: string, currentStatus: boolean) => {
  if (isDummyFirebase) {
    let favs = {};
    try {
      favs = JSON.parse(localStorage.getItem('moodrive_favorites') || '{}');
    } catch (e) {
      console.error("Error parsing local favorites:", e);
    }
    const key = `${userId}_${courseId}`;
    if (currentStatus) {
      delete (favs as any)[key];
    } else {
      (favs as any)[key] = true;
    }
    localStorage.setItem('moodrive_favorites', JSON.stringify(favs));
    return !currentStatus;
  }

  const togglePromise = (async () => {
    const favoriteRef = doc(db, 'user_favorites', `${userId}_${courseId}`);
    if (currentStatus) {
      await deleteDoc(favoriteRef);
      return false;
    } else {
      await setDoc(favoriteRef, { userId, courseId, createdAt: serverTimestamp() });
      return true;
    }
  })();

  const timeoutPromise = new Promise<boolean>((_, reject) =>
    setTimeout(() => reject(new Error("Firestore toggleFavorite timeout")), 2000)
  );

  try {
    return await Promise.race([togglePromise, timeoutPromise]);
  } catch (error) {
    console.error("Error or timeout toggling favorite, falling back to local:", error);
    let favs = {};
    try {
      favs = JSON.parse(localStorage.getItem('moodrive_favorites') || '{}');
    } catch (e) {
      console.error("Error parsing local favorites:", e);
    }
    const key = `${userId}_${courseId}`;
    if (currentStatus) {
      delete (favs as any)[key];
    } else {
      (favs as any)[key] = true;
    }
    localStorage.setItem('moodrive_favorites', JSON.stringify(favs));
    return !currentStatus;
  }
};

export const checkIsFavorite = async (userId: string, courseId: string) => {
  if (isDummyFirebase) {
    let favs = {};
    try {
      favs = JSON.parse(localStorage.getItem('moodrive_favorites') || '{}');
    } catch (e) {
      console.error("Error parsing local favorites:", e);
    }
    return !!(favs as any)[`${userId}_${courseId}`];
  }

  const checkPromise = (async () => {
    const favoriteRef = doc(db, 'user_favorites', `${userId}_${courseId}`);
    const docSnap = await getDoc(favoriteRef);
    return docSnap.exists();
  })();

  const timeoutPromise = new Promise<boolean>((_, reject) =>
    setTimeout(() => reject(new Error("Firestore checkIsFavorite timeout")), 1500)
  );

  try {
    return await Promise.race([checkPromise, timeoutPromise]);
  } catch (error) {
    console.error("Error or timeout checking favorite, falling back to local:", error);
    let favs = {};
    try {
      favs = JSON.parse(localStorage.getItem('moodrive_favorites') || '{}');
    } catch (e) {
      console.error("Error parsing local favorites:", e);
    }
    return !!(favs as any)[`${userId}_${courseId}`];
  }
};

export interface Review {
  id?: string;
  courseId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt?: any;
}

const getLocalReviews = (): Review[] => {
  const data = localStorage.getItem('moodrive_reviews');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error parsing local reviews:", e);
    }
  }
  const defaultReviews: Review[] = [
    {
      id: 'rev-1',
      courseId: 'course_1',
      userId: 'user-1',
      userName: 'SeoulRider',
      rating: 5,
      text: '밤에 달리기에 이만한 코스가 없습니다. 잠수교 분위기 최고네요!',
      createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 }
    },
    {
      id: 'rev-2',
      courseId: 'course_1',
      userId: 'user-2',
      userName: 'TrackDayLover',
      rating: 4,
      text: '주말에는 차가 조금 많지만 주중 심야는 아주 쾌적합니다.',
      createdAt: { seconds: Math.floor(Date.now() / 1000) - 172800 }
    }
  ];
  localStorage.setItem('moodrive_reviews', JSON.stringify(defaultReviews));
  return defaultReviews;
};

export const fetchReviews = async (courseId: string): Promise<Review[]> => {
  if (isDummyFirebase) {
    return getLocalReviews()
      .filter((r) => r.courseId === courseId)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }

  const fetchPromise = (async () => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Review;
      if (data.courseId === courseId) {
        reviews.push({ id: doc.id, ...data });
      }
    });
    return reviews;
  })();

  const timeoutPromise = new Promise<Review[]>((_, reject) =>
    setTimeout(() => reject(new Error("Firestore fetch reviews timeout")), 1500)
  );

  try {
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    console.error("Error or timeout fetching reviews:", error);
    return getLocalReviews()
      .filter((r) => r.courseId === courseId)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }
};

export const addReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
  if (isDummyFirebase) {
    const reviews = getLocalReviews();
    const newReview: Review = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      createdAt: { seconds: Math.floor(Date.now() / 1000) }
    };
    reviews.unshift(newReview);
    localStorage.setItem('moodrive_reviews', JSON.stringify(reviews));
    return newReview.id;
  }

  const writePromise = (async () => {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  })();

  const timeoutPromise = new Promise<string>((_, reject) =>
    setTimeout(() => reject(new Error("Firestore addReview timeout")), 2000)
  );

  try {
    return await Promise.race([writePromise, timeoutPromise]);
  } catch (error) {
    console.error("Error or timeout adding review, falling back to local:", error);
    const reviews = getLocalReviews();
    const newReview: Review = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      createdAt: { seconds: Math.floor(Date.now() / 1000) }
    };
    reviews.unshift(newReview);
    localStorage.setItem('moodrive_reviews', JSON.stringify(reviews));
    return newReview.id;
  }
};
