import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ImagePlus, MapPin, Plus } from 'lucide-react';

export const CourseRegistration: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-[100dvh] flex flex-col bg-white dark:bg-gray-950 px-5 pt-6 relative">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center -ml-2 text-gray-900 dark:text-white"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xl font-bold ml-2 text-gray-900 dark:text-white">코스 등록</h1>
        <div className="flex-1"></div>
        <button className="text-primary-600 font-bold text-base">완료</button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10 space-y-6">
        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">커버 사진</label>
          <button className="w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            <ImagePlus size={32} className="text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-500">사진 추가하기</span>
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">코스 이름</label>
          <input 
            type="text" 
            placeholder="예: 서울근교 새벽 드라이브" 
            className="w-full h-14 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 text-[15px] outline-none focus:border-primary-500 transition-colors text-gray-900 dark:text-white placeholder:text-gray-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">코스 설명</label>
          <textarea 
            placeholder="코스의 특징을 설명해주세요..."
            rows={4}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-[15px] outline-none focus:border-primary-500 transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 resize-none"
          ></textarea>
        </div>

        {/* Waypoints */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">경유지</label>
          <div className="space-y-3">
            {[1, 2].map((idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-gray-400" />
                </div>
                <div className="flex-1 h-14 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 flex items-center justify-between cursor-pointer">
                  <span className="text-gray-500">경유지 추가</span>
                </div>
              </div>
            ))}
            <button className="w-full h-14 border border-dashed border-primary-500 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center font-medium bg-primary-50/50 dark:bg-primary-900/10">
              <Plus size={20} className="mr-1" />
              경유지 추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
