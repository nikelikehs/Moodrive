import React, { useState, useRef } from 'react';
import { Play, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../layouts/MobileLayout';

const MOCK_ROUTES = [
  // Seoul/Gyeonggi (수도권)
  {
    id: 'sg-1',
    title: '서울 북악스카이웨이 야간 드라이브',
    titleEn: 'NORTH PEAK NIGHT DRIVE',
    region: 'SEOUL/GYEONGGI',
    image: 'https://images.unsplash.com/photo-1510442650500-9321f8d59149?q=80&w=800&auto=format&fit=crop',
    tags: ['CITY NIGHT', 'HILL CLIMB'],
    lat: 37.5926,
    lng: 126.9840
  },
  {
    id: 'sg-2',
    title: '광주 남한산성 성곽길 드라이브',
    titleEn: 'NAMHANSANSEONG CASTLE CRUISE',
    region: 'SEOUL/GYEONGGI',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=800&auto=format&fit=crop',
    tags: ['FOREST ROAD', 'CITY VIEW'],
    lat: 37.4786,
    lng: 127.1856
  },
  {
    id: 'sg-3',
    title: '양평 두물머리 강변길',
    titleEn: 'DUMULMEORI RIVER CRUISE',
    region: 'SEOUL/GYEONGGI',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop',
    tags: ['RIVER VIEW', 'PEACEFUL'],
    lat: 37.4913,
    lng: 127.3195
  },
  {
    id: 'sg-4',
    title: '가평 청평호반 드라이브 코스',
    titleEn: 'CHEONGPYEONG LAKE DRIVE',
    region: 'SEOUL/GYEONGGI',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop',
    tags: ['LAKE VIEW', 'WINDING'],
    lat: 37.7123,
    lng: 127.4256
  },
  {
    id: 'sg-5',
    title: '파주 자유로 일산-임진각 코스',
    titleEn: 'JAYURO IMJINGAK ROAD',
    region: 'SEOUL/GYEONGGI',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop',
    tags: ['HIGHWAY', 'BORDER ROAD'],
    lat: 37.8925,
    lng: 126.7456
  },

  // Incheon (인천/영종도)
  {
    id: 'ic-1',
    title: '영종도 해안남로 노을 드라이브',
    titleEn: 'YEONGJONGDO SUNSET DRIVE',
    region: 'INCHEON',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    tags: ['OCEAN VIEW', 'AIRPORT'],
    lat: 37.4332,
    lng: 126.4716
  },
  {
    id: 'ic-2',
    title: '송도 센트럴파크 시티뷰 코스',
    titleEn: 'SONGDO CENTRAL PARK DRIVE',
    region: 'INCHEON',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
    tags: ['CITY VIEW', 'SKYSCRAPERS'],
    lat: 37.3912,
    lng: 126.6356
  },
  {
    id: 'ic-3',
    title: '강화도 해안순환도로 드라이브',
    titleEn: 'GANGHWADO ISLAND CRUISE',
    region: 'INCHEON',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop',
    tags: ['HISTORICAL', 'COASTAL'],
    lat: 37.7012,
    lng: 126.4523
  },
  {
    id: 'ic-4',
    title: '경인 아라뱃길 정서진 노을 드라이브',
    titleEn: 'ARAWATERWAY SUNSET DRIVE',
    region: 'INCHEON',
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=800&auto=format&fit=crop',
    tags: ['CANAL VIEW', 'SUNSET'],
    lat: 37.5645,
    lng: 126.6012
  },
  {
    id: 'ic-5',
    title: '영흥도 십리포 해수욕장 해변길',
    titleEn: 'YEONGHEUNGDO BEACH CRUISE',
    region: 'INCHEON',
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=800&auto=format&fit=crop',
    tags: ['MUDFLAT', 'BEACH COVE'],
    lat: 37.2845,
    lng: 126.4956
  },

  // Gangwon (강원)
  {
    id: 'gw-1',
    title: '강원 삼척 새천년 해안도로',
    titleEn: 'MILLENNIUM COAST ROAD',
    region: 'GANGWON',
    image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=800&auto=format&fit=crop',
    tags: ['EAST SEA', 'ROCKY'],
    lat: 37.4411,
    lng: 129.1706
  },
  {
    id: 'gw-2',
    title: '강릉 금진-심곡 헌화로 해안길',
    titleEn: 'HEONHWARO CRASHING WAVES',
    region: 'GANGWON',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800&auto=format&fit=crop',
    tags: ['CLOSE SEA', 'COAST CLIFF'],
    lat: 37.6698,
    lng: 129.0494
  },
  {
    id: 'gw-3',
    title: '정선 소금강 계곡 드라이브',
    titleEn: 'JEONGSEON VALLEY ROAD',
    region: 'GANGWON',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
    tags: ['DEEP VALLEY', 'ROCKY CLIFF'],
    lat: 37.3391,
    lng: 128.7490
  },
  {
    id: 'gw-4',
    title: '춘천 의암호반 물레길 드라이브',
    titleEn: 'UIYAM LAKE WATERWAY DRIVE',
    region: 'GANGWON',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop',
    tags: ['FOGGY LAKE', 'PEACEFUL'],
    lat: 37.8812,
    lng: 127.7012
  },
  {
    id: 'gw-5',
    title: '태백산맥 함백산 만항재 드라이브',
    titleEn: 'HAMBAEKSAN MANHANGJAE CLIMB',
    region: 'GANGWON',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
    tags: ['MOUNTAIN PASS', 'WINDING ROAD'],
    lat: 37.1645,
    lng: 128.8956
  },

  // Chungcheong (충청)
  {
    id: 'cc-1',
    title: '청주 대청호반 드라이브 코스',
    titleEn: 'DAECHYEONG LAKE ROAD',
    region: 'CHUNGCHEONG',
    image: 'https://images.unsplash.com/photo-1472214222541-d510753a4907?q=80&w=800&auto=format&fit=crop',
    tags: ['LAKE CRUISE', 'CHERRY BLOSSOM'],
    lat: 36.4678,
    lng: 127.4789
  },
  {
    id: 'cc-2',
    title: '단양 보발재 와인딩 고개',
    titleEn: 'BOBALJAE S-CURVE PASS',
    region: 'CHUNGCHEONG',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop',
    tags: ['WINDING PASS', 'AUTUMN FOLIAGE'],
    lat: 37.0423,
    lng: 128.4312
  },
  {
    id: 'cc-3',
    title: '충주호 수변 드라이브 코스',
    titleEn: 'CHUNGJUHO LAKE DRIVE',
    region: 'CHUNGCHEONG',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop',
    tags: ['LAKE CRUISE', 'NATURE'],
    lat: 36.9845,
    lng: 127.9956
  },
  {
    id: 'cc-4',
    title: '태안 안면도 안면대로 송림길',
    titleEn: 'ANMYEONDO PINE ROAD',
    region: 'CHUNGCHEONG',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop',
    tags: ['PINE WOODS', 'WEST COAST'],
    lat: 36.5312,
    lng: 126.3656
  },
  {
    id: 'cc-5',
    title: '부여 백마강 강변도로 코스',
    titleEn: 'BAEKMA RIVER CRUISE',
    region: 'CHUNGCHEONG',
    image: 'https://images.unsplash.com/photo-1472214222541-d510753a4907?q=80&w=800&auto=format&fit=crop',
    tags: ['RIVER VIEW', 'HISTORICAL'],
    lat: 36.2845,
    lng: 126.9012
  },

  // Jeolla (전라)
  {
    id: 'jl-1',
    title: '담양 메타세쿼이아 가로수터널',
    titleEn: 'DAMYANG REDWOOD TUNNEL',
    region: 'JEOLLA',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop',
    tags: ['TREE TUNNEL', 'GREEN FOREST'],
    lat: 35.3216,
    lng: 127.0094
  },
  {
    id: 'jl-2',
    title: '영광 백수해안노을도로',
    titleEn: 'YEONGGWANG SUNSET ROAD',
    region: 'JEOLLA',
    image: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=800&auto=format&fit=crop',
    tags: ['WEST SEA', 'HIGH CLIFF'],
    lat: 35.3854,
    lng: 126.3768
  },
  {
    id: 'jl-3',
    title: '지리산 정령치 고갯길 드라이브',
    titleEn: 'JIRISAN JEONGRYEONGCHI CRUISE',
    region: 'JEOLLA',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop',
    tags: ['MOUNTAIN', 'WINDING ROAD'],
    lat: 35.4412,
    lng: 127.5356
  },
  {
    id: 'jl-4',
    title: '순천만 와온해변 노을 드라이브',
    titleEn: 'SUNCHEON BAY SUNSET DRIVE',
    region: 'JEOLLA',
    image: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=800&auto=format&fit=crop',
    tags: ['MUDFLAT', 'SUNSET VIEW'],
    lat: 34.8645,
    lng: 127.5612
  },
  {
    id: 'jl-5',
    title: '변산반도 해안도로 격포-모항 코스',
    titleEn: 'BYEONSAN COASTAL ROAD',
    region: 'JEOLLA',
    image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=800&auto=format&fit=crop',
    tags: ['CLIFF ROAD', 'COASTAL'],
    lat: 35.6123,
    lng: 126.4756
  },

  // Gyeongsang (경상)
  {
    id: 'gs-1',
    title: '경주 보문호수 벚꽃길 드라이브',
    titleEn: 'GYEONGJU BOMUN LAKE',
    region: 'GYEONGSANG',
    image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=800&auto=format&fit=crop',
    tags: ['HISTORIC LAKE', 'FLOWER PATH'],
    lat: 35.8431,
    lng: 129.2783
  },
  {
    id: 'gs-2',
    title: '남해 지족해협 남해대교 해안길',
    titleEn: 'NAMHAE COAST CRUISE',
    region: 'GYEONGSANG',
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=800&auto=format&fit=crop',
    tags: ['SOUTH SEA', 'ISLAND BRIDGE'],
    lat: 34.8361,
    lng: 128.0264
  },
  {
    id: 'gs-3',
    title: '영덕 블루로드 동해안도로',
    titleEn: 'YEONGDEOK BLUE ROAD',
    region: 'GYEONGSANG',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    tags: ['BLUE SEA', 'COAST DRIVE'],
    lat: 36.4123,
    lng: 129.3956
  },
  {
    id: 'gs-4',
    title: '청도 운문호 호반 드라이브',
    titleEn: 'CHEONGDO UNMUNHO LAKE DRIVE',
    region: 'GYEONGSANG',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    tags: ['REFLECTIVE', 'LAKE PATH'],
    lat: 35.7012,
    lng: 128.9056
  },
  {
    id: 'gs-5',
    title: '안동호 주진교 드라이브 코스',
    titleEn: 'ANDONGHO LAKE BRIDGE CRUISE',
    region: 'GYEONGSANG',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=800&auto=format&fit=crop',
    tags: ['BRIDGE CRUISE', 'PEACEFUL'],
    lat: 36.6845,
    lng: 128.8912
  },

  // Busan/Ulsan (부산/울산)
  {
    id: 'bu-1',
    title: '부산 광안대교 & 마린시티',
    titleEn: 'BUSAN GWANGAN BRIDGE',
    region: 'BUSAN/ULSAN',
    image: 'https://images.unsplash.com/photo-1598463065730-abbb7f94bbcd?q=80&w=800&auto=format&fit=crop',
    tags: ['CITY NIGHT', 'OCEAN BRIDGE'],
    lat: 35.1481,
    lng: 129.1124,
    type: 'DRIVE'
  },
  {
    id: 'bu-2',
    title: '울산 간절곶 해맞이 해안도로',
    titleEn: 'GANJEOLGOT SUNRISE CRUISE',
    region: 'BUSAN/ULSAN',
    image: 'https://images.unsplash.com/photo-1502945015378-0e284ca1a5be?q=80&w=800&auto=format&fit=crop',
    tags: ['SUNRISE', 'LIGHTHOUSE'],
    lat: 35.3612,
    lng: 129.3645,
    type: 'DRIVE'
  },
  {
    id: 'bu-3',
    title: '부산 해운대 달맞이길 드라이브',
    titleEn: 'DALMAJIGIL HILL CRUISE',
    region: 'BUSAN/ULSAN',
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=800&auto=format&fit=crop',
    tags: ['OCEAN VIEW', 'COFFEE STRIP'],
    lat: 35.1589,
    lng: 129.1765,
    type: 'DRIVE'
  },
  {
    id: 'bu-4',
    title: '부산 영도 청학수변공원 해안도로',
    titleEn: 'YEONGDO HARBOR CRUISE',
    region: 'BUSAN/ULSAN',
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=800&auto=format&fit=crop',
    tags: ['BRIDGE NIGHT', 'HARBOR'],
    lat: 35.0912,
    lng: 129.0656,
    type: 'DRIVE'
  },
  {
    id: 'bu-5',
    title: '울산 주전-정자 몽돌해변 해안길',
    titleEn: 'JUJEON PEBBLE COAST DRIVE',
    region: 'BUSAN/ULSAN',
    image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=800&auto=format&fit=crop',
    tags: ['PEBBLE BEACH', 'WINDY OCEAN'],
    lat: 35.6012,
    lng: 129.4356,
    type: 'DRIVE'
  },

  // Jeju (제주)
  {
    id: 'jj-1',
    title: '제주 신창 풍차 해안도로',
    titleEn: 'WINDMILL COAST CRUISE',
    region: 'JEJU',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    tags: ['SUNSET', 'OCEAN'],
    lat: 33.3486,
    lng: 126.1756
  },
  {
    id: 'jj-2',
    title: '제주 1100고지 눈꽃 터널 도로',
    titleEn: '1100 HIGHLAND SNOW ROAD',
    region: 'JEJU',
    image: 'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?q=80&w=800&auto=format&fit=crop',
    tags: ['MOUNTAIN PASS', 'HIGH ALTITUDE'],
    lat: 33.3934,
    lng: 126.4632
  },
  {
    id: 'jj-3',
    title: '제주 사려니숲길 삼나무 터널',
    titleEn: 'SARYEONI FOREST ROAD',
    region: 'JEJU',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop',
    tags: ['FOREST', 'CEDAR TREES'],
    lat: 33.4012,
    lng: 126.6456
  },
  {
    id: 'jj-4',
    title: '제주 애월 해안도로 드라이브',
    titleEn: 'AEWOL CLIFF ROAD',
    region: 'JEJU',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    tags: ['COAST CLIFF', 'SUNSET'],
    lat: 33.4712,
    lng: 126.3545
  },
  {
    id: 'jj-5',
    title: '제주 종달리 수국 해안도로',
    titleEn: 'JONGDALLI FLOWER ROAD',
    region: 'JEJU',
    image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=800&auto=format&fit=crop',
    tags: ['FLOWERS', 'EAST BEACH'],
    lat: 33.5123,
    lng: 126.9045
  },

  // Islands (독도/울릉도)
  {
    id: 'is-1',
    title: '울릉도 일주도로 해안 드라이브',
    titleEn: 'ULLEUNGDO ISLAND CRUISE',
    region: 'ISLANDS',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=800&auto=format&fit=crop',
    tags: ['MYSTICAL SEA', 'RING ROAD'],
    lat: 37.4841,
    lng: 130.9023
  },
  {
    id: 'is-2',
    title: '울릉도 태하 황토굴 해안산책로',
    titleEn: 'TAEHA COASTAL PATH',
    region: 'ISLANDS',
    image: 'https://images.unsplash.com/photo-1502945015378-0e284ca1a5be?q=80&w=800&auto=format&fit=crop',
    tags: ['WALK', 'WOODEN WALKWAY'],
    lat: 37.5123,
    lng: 130.8012,
    type: 'WALK'
  },
  {
    id: 'is-3',
    title: '울릉도 삼선암 해안 드라이브',
    titleEn: 'SAMSEONAM ROCK ROAD',
    region: 'ISLANDS',
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=800&auto=format&fit=crop',
    tags: ['ROCK COLUMN', 'OCEAN SHORE'],
    lat: 37.5512,
    lng: 130.9345
  },
  {
    id: 'is-4',
    title: '울릉도 독도전망대 역사산책 코스',
    titleEn: 'DOKDO OBSERVATORY TRAIL',
    region: 'ISLANDS',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop',
    tags: ['WALK', 'MOUNTAIN TOP'],
    lat: 37.4856,
    lng: 130.9012,
    type: 'WALK'
  },
  {
    id: 'is-5',
    title: '독도 해안 절벽 둘레길 코스',
    titleEn: 'DOKDO CLIFF WALK',
    region: 'ISLANDS',
    image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=800&auto=format&fit=crop',
    tags: ['WALK', 'VOLCANIC LAND'],
    lat: 37.2412,
    lng: 131.8656,
    type: 'WALK'
  }
];

const REGIONS = [
  { id: 'ALL', label: '전국' },
  { id: 'SEOUL/GYEONGGI', label: '수도권' },
  { id: 'INCHEON', label: '인천/영종도' },
  { id: 'GANGWON', label: '강원' },
  { id: 'CHUNGCHEONG', label: '충청' },
  { id: 'JEOLLA', label: '전라' },
  { id: 'GYEONGSANG', label: '경상' },
  { id: 'BUSAN/ULSAN', label: '부산/울산' },
  { id: 'JEJU', label: '제주' },
  { id: 'ISLANDS', label: '독도/울릉도' }
];

export const RecommendedRoutes: React.FC = () => {
  const navigate = useNavigate();
  const [activeRegion, setActiveRegion] = useState('ALL');
  const [activeType, setActiveType] = useState<'ALL' | 'DRIVE' | 'WALK'>('ALL');

  // Horizontal Scroll Drag-to-Swipe mouse events
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const filteredRoutes = MOCK_ROUTES.filter(route => {
    const regionMatch = activeRegion === 'ALL' || route.region === activeRegion;
    const typeMatch = activeType === 'ALL' || 
                      (activeType === 'WALK' && route.type === 'WALK') ||
                      (activeType === 'DRIVE' && route.type !== 'WALK');
    return regionMatch && typeMatch;
  });

  const startRoute = (route: any) => {
    const mode = route.type === 'WALK' ? 'WALK' : 'CAR';
    navigate(`/app/map?search=${encodeURIComponent(route.title)}&mode=${mode}`);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a] px-6 pt-12 pb-32 relative transition-colors duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10 shrink-0">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
            DRIVE CURATED
          </h2>
          <p className="text-nike-volt font-mono text-[10px] mt-2 uppercase tracking-[0.3em] font-bold">
            PRO SELECTION
          </p>
        </div>
        <Compass className="text-nike-volt opacity-20" size={40} />
      </div>
      
      {/* Filters (Drag to Scroll bar) */}
      <div className="mb-4 space-y-4 shrink-0">
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ scrollBehavior: isDown ? 'auto' : 'smooth' }}
          className="flex gap-2 overflow-x-auto no-scrollbar pb-2 select-none cursor-grab active:cursor-grabbing"
        >
          {REGIONS.map(region => (
            <button 
              key={region.id}
              onClick={() => setActiveRegion(region.id)}
              className={cn(
                "px-5 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border whitespace-nowrap pointer-events-auto",
                activeRegion === region.id 
                  ? "bg-nike-volt border-nike-volt text-black shadow-lg" 
                  : "bg-[#111111] border-white/5 text-white/40 hover:border-white/10"
              )}
            >
              {region.label}
            </button>
          ))}
        </div>
      </div>

      {/* Type Toggle Tabs */}
      <div className="flex gap-2 mb-8 shrink-0 bg-[#111111] p-1 rounded-2xl border border-white/5">
        {[
          { id: 'ALL', label: '⚡️ 전체 코스' },
          { id: 'DRIVE', label: '🚗 드라이브 코스' },
          { id: 'WALK', label: '🚶 걷기 코스' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveType(tab.id as any)}
            className={cn(
              "flex-1 py-3.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap",
              activeType === tab.id
                ? "bg-[#222222] text-nike-volt border border-white/10"
                : "text-white/40 hover:text-white/70"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards List (Flat Style) */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
        {filteredRoutes.length > 0 ? filteredRoutes.map((route) => (
          <div 
            key={route.id}
            onClick={() => startRoute(route)}
            className="w-full h-80 rounded-[32px] overflow-hidden relative cursor-pointer group border border-white/5 bg-[#111111] active:scale-[0.98] transition-transform"
          >
            <img 
              src={route.image} 
              alt={route.titleEn}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-50"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-app)] via-transparent to-transparent"></div>
            
            <div className="absolute top-6 left-6 flex gap-2">
              <span className={cn(
                "backdrop-blur-md border px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5",
                route.type === 'WALK' 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : "bg-white/5 border-white/10 text-white"
              )}>
                {route.type === 'WALK' ? '🚶 WALK' : '🚗 DRIVE'}
              </span>
              <span className="bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest text-white/60 uppercase">
                {route.tags[0]}
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div className="text-left">
                <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none mb-2 pr-4">
                  {route.titleEn}
                </h3>
                <p className={cn(
                  "font-bold text-[10px] uppercase tracking-widest",
                  route.type === 'WALK' ? "text-emerald-400" : "text-nike-volt"
                )}>
                  {route.title}
                </p>
              </div>

              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                route.type === 'WALK' ? "bg-emerald-500 text-black" : "bg-nike-volt text-black"
              )}>
                <Play size={20} className="text-black fill-black ml-1" />
              </div>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center h-40 text-white/20 uppercase italic font-black">
            No curated routes yet.
          </div>
        )}
      </div>
    </div>
  );
};
