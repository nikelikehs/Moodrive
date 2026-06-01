import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Star, Clock, Map, Navigation, Heart, Share2, Send } from 'lucide-react';
import { checkIsFavorite, toggleFavorite, addReview, fetchReviews, type Review } from '../services/db';

export const CourseDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Dummy user ID for MVP
  const currentUserId = 'test_user_001';

  const [isFav, setIsFav] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState('');

  // Course Stub
  const course = {
    id: id || 'course_1',
    title: '서울 야간 드라이브 코스',
    image: 'https://images.unsplash.com/photo-1517482811406-3b6928e3b4d4?q=80&w=2938&auto=format&fit=crop',
    rating: 4.8,
    reviewsCount: reviews.length + 128,
    time: '1h 20m',
    distance: '24km',
    description: '서울의 밤을 느낄 수 있는 환상적인 드라이브 코스입니다. 심야에 한강을 따라 달리며 도심의 화려한 네온 야경을 감상해보세요.',
    waypoints: [
      '잠수교 남단',
      '올림픽대로 (하남방면)',
      '천호대교 남단',
      '강변북로 (일산방면)'
    ]
  };

  useEffect(() => {
    // Check if favorited
    checkIsFavorite(currentUserId, course.id).then(setIsFav);
    // Load reviews
    fetchReviews(course.id).then(setReviews);
  }, [course.id]);

  const handleFavorite = async () => {
    try {
      const newStatus = await toggleFavorite(currentUserId, course.id, isFav);
      setIsFav(newStatus);
    } catch {
      // Fallback optimistic UI if Firebase fails
      setIsFav(!isFav);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    try {
      const reviewPayload = {
        courseId: course.id,
        userId: currentUserId,
        userName: 'Guest Driver',
        rating: 5,
        text: newReviewText
      };
      await addReview(reviewPayload);
      setReviews([...reviews, { id: 'temp', ...reviewPayload }]);
      setNewReviewText('');
    } catch (error) {
      console.log('Firebase error, adding optimistic review', error);
      setReviews([...reviews, { 
        id: 'opt', 
        courseId: course.id, 
        userId: currentUserId, 
        userName: 'Guest Driver', 
        rating: 5, 
        text: newReviewText 
      }]);
      setNewReviewText('');
    }
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col bg-black relative overflow-hidden font-sans">
      {/* Header Image */}
      <div className="relative w-full h-72 shrink-0">
        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black"></div>
        
        {/* Top Navbar */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-8 flex justify-between items-center z-10">
          <button 
            onClick={() => navigate(-1)}
            className="w-11 h-11 glass-panel rounded-full flex items-center justify-center text-white"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-3">
            <button className="w-11 h-11 glass-panel rounded-full flex items-center justify-center text-white">
              <Share2 size={20} />
            </button>
            <button 
              onClick={handleFavorite}
              className={`w-11 h-11 glass-panel rounded-full flex items-center justify-center transition-colors ${isFav ? 'bg-red-500/20 text-red-500 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'text-white'}`}
            >
              <Heart size={20} className={isFav ? "fill-red-500" : ""} />
            </button>
          </div>
        </div>

        {/* Title over image */}
        <div className="absolute bottom-4 left-0 p-6 w-full">
          <div className="flex items-center text-white mb-2 drop-shadow-md">
            <Star size={16} className="text-neon-cyan fill-neon-cyan mr-1.5 shadow-[0_0_8px_rgba(0,242,255,0.8)]" />
            <span className="font-bold mr-1 text-neon-cyan">{course.rating}</span>
            <span className="text-sm font-mono text-white/50">({course.reviewsCount} REVIEWS)</span>
          </div>
          <h1 className="text-[28px] font-bold text-white leading-tight uppercase font-sans tracking-wide">
            {course.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-6 pb-28 space-y-8">
        
        <div className="flex justify-around items-center p-5 glass-panel rounded-3xl border border-white/5">
          <div className="flex flex-col items-center">
            <Clock size={22} className="text-neon-cyan mb-1.5" />
            <span className="text-sm font-bold text-white">{course.time}</span>
            <span className="text-xs text-dark-muted mt-0.5">예상 시간</span>
          </div>
          <div className="w-px h-10 bg-white/10"></div>
          <div className="flex flex-col items-center">
            <Map size={22} className="text-neon-cyan mb-1.5" />
            <span className="text-sm font-bold text-white">{course.distance}</span>
            <span className="text-xs text-dark-muted mt-0.5">총 거리</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white mb-3 flex items-center">
            <div className="w-1 h-4 bg-neon-cyan mr-2 rounded-full shadow-[0_0_8px_rgba(0,242,255,0.8)]"></div>
            코스 정보
          </h3>
          <p className="text-[15px] leading-relaxed text-gray-400">
            {course.description}
          </p>
        </div>

        {/* Waypoints */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <div className="w-1 h-4 bg-neon-cyan mr-2 rounded-full shadow-[0_0_8px_rgba(0,242,255,0.8)]"></div>
            경유지
          </h3>
          <div className="relative border-l border-white/20 ml-3 space-y-7 py-2">
            {course.waypoints.map((point, index) => (
              <div key={index} className="relative pl-6">
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(0,242,255,0.8)]"></div>
                <h4 className="text-[15px] font-medium text-white leading-none">
                  {point}
                </h4>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="pt-4 border-t border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <div className="w-1 h-4 bg-neon-cyan mr-2 rounded-full shadow-[0_0_8px_rgba(0,242,255,0.8)]"></div>
            드라이버 리뷰
          </h3>
          
          <form onSubmit={handleAddReview} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              placeholder="코스에 대한 리뷰를 남겨주세요"
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 text-[14px] text-white outline-none focus:border-neon-cyan/50 transition-colors"
            />
            <button 
              type="submit"
              className="w-12 h-12 bg-neon-cyan text-black rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,242,255,0.4)]"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>

          <div className="space-y-4">
            {reviews.map((r, i) => (
              <div key={r.id || i} className="p-4 glass-panel rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-white">{r.userName}</span>
                  <div className="flex items-center text-neon-cyan">
                    <Star size={12} className="fill-neon-cyan mr-1" />
                    <span className="text-xs font-mono">{r.rating}.0</span>
                  </div>
                </div>
                <p className="text-[13px] text-gray-400">{r.text}</p>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-sm text-dark-muted text-center py-4">첫 번째 리뷰를 남겨보세요!</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-black bg-opacity-90 backdrop-blur-xl border-t border-white/10">
        <button className="w-full h-14 bg-neon-cyan text-black rounded-full flex items-center justify-center font-bold text-lg shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-transform active:scale-[0.98]">
          <Navigation size={20} className="mr-2 fill-black" />
          네비게이션 시작
        </button>
      </div>
    </div>
  );
};
