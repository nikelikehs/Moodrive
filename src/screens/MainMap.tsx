import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Menu, 
  X, 
  Search, 
  MapPin, 
  Navigation2, 
  ChevronRight, 
  Stars,
  PersonStanding,
  Navigation,
  Fuel,
  Utensils,
  Bed,
  Landmark,
  Mic,
  ArrowLeft,
  Clock,
  Activity,
  History,
  LayoutGrid,
  Settings as SettingsIcon,
  LogOut,
  Train,
  Car,
  Compass,
  Shield
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Map, CustomOverlayMap, useKakaoLoader, Polyline } from 'react-kakao-maps-sdk';
import { cn } from '../layouts/MobileLayout';
import { voiceService } from '../services/voice';
import { generateDriveRecommendation } from '../services/ai';
import { auth } from '../firebase';

const COURSE_PATHS: { [key: string]: { start: { lat: number, lng: number }, end: { lat: number, lng: number } } } = {
  '서울 북악스카이웨이 야간 드라이브': { start: { lat: 37.5926, lng: 126.9840 }, end: { lat: 37.6040, lng: 126.9695 } },
  '광주 남한산성 성곽길 드라이브': { start: { lat: 37.4786, lng: 127.1856 }, end: { lat: 37.4645, lng: 127.2345 } },
  '양평 두물머리 강변길': { start: { lat: 37.4913, lng: 127.3195 }, end: { lat: 37.5025, lng: 127.3312 } },
  '영종도 해안남로 노을 드라이브': { start: { lat: 37.4332, lng: 126.4716 }, end: { lat: 37.4589, lng: 126.3980 } },
  '제주 신창 풍차 해안도로': { start: { lat: 33.3486, lng: 126.1756 }, end: { lat: 33.3768, lng: 126.1680 } },
  '제주 1100고지 눈꽃 터널 도로': { start: { lat: 33.3934, lng: 126.4632 }, end: { lat: 33.4650, lng: 126.4950 } },
  '강원 삼척 새천년 해안도로': { start: { lat: 37.4411, lng: 129.1706 }, end: { lat: 37.4250, lng: 129.1820 } },
  '강릉 금진-심곡 헌화로 해안길': { start: { lat: 37.6698, lng: 129.0494 }, end: { lat: 37.6890, lng: 129.0395 } },
  '정선 소금강 계곡 드라이브': { start: { lat: 37.3391, lng: 128.7490 }, end: { lat: 37.3590, lng: 128.7290 } },
  '청주 대청호반 드라이브 코스': { start: { lat: 36.4678, lng: 127.4789 }, end: { lat: 36.5050, lng: 127.4850 } },
  '단양 보발재 와인딩 고개': { start: { lat: 37.0423, lng: 128.4312 }, end: { lat: 37.0620, lng: 128.4150 } },
  '담양 메타세쿼이아 가로수터널': { start: { lat: 35.3216, lng: 127.0094 }, end: { lat: 35.3050, lng: 127.0350 } },
  '영광 백수해안노을도로': { start: { lat: 35.3854, lng: 126.3768 }, end: { lat: 35.4380, lng: 126.3450 } },
  '부산 광안대교 & 마린시티': { start: { lat: 35.1481, lng: 129.1124 }, end: { lat: 35.1680, lng: 129.1310 } },
  '경주 보문호수 벚꽃길 드라이브': { start: { lat: 35.8431, lng: 129.2783 }, end: { lat: 35.8690, lng: 129.2890 } },
  '남해 지족해협 남해대교 해안길': { start: { lat: 34.8361, lng: 128.0264 }, end: { lat: 34.8720, lng: 127.9540 } },
  '부산 이기대 신선대 해안산책로 걷기 코스': { start: { lat: 35.1235, lng: 129.1132 }, end: { lat: 35.1110, lng: 129.1245 } },
  '부산 해운대 그린레일웨이 걷기 코스': { start: { lat: 35.1587, lng: 129.1764 }, end: { lat: 35.1820, lng: 129.2010 } },
  '부산 절영 해안산책로 흰여울길 걷기 코스': { start: { lat: 35.0763, lng: 129.0435 }, end: { lat: 35.0610, lng: 129.0320 } },
  '부산 갈맷길 2코스 광안리-해운대 걷기 코스': { start: { lat: 35.1531, lng: 129.1189 }, end: { lat: 35.1587, lng: 129.1604 } },
  '부산 금정산성 역사문화 성곽길 걷기 코스': { start: { lat: 35.2635, lng: 129.0624 }, end: { lat: 35.2440, lng: 129.0495 } },
  '부산 해운대 동백섬 순환 걷기 코스': { start: { lat: 35.1575, lng: 129.1524 }, end: { lat: 35.1533, lng: 129.1518 } },
  'urban night escape': { start: { lat: 37.5665, lng: 126.9780 }, end: { lat: 37.5250, lng: 127.0350 } },
  'coastal breeze course': { start: { lat: 35.1481, lng: 129.1124 }, end: { lat: 35.1950, lng: 129.2150 } },
  'mountain peak vibe': { start: { lat: 37.4786, lng: 127.1856 }, end: { lat: 37.4520, lng: 127.2450 } }
};

// Real-road mapping coordinates from OpenStreetMap API
const fetchOSRMRoute = async (
  start: { lat: number, lng: number },
  end: { lat: number, lng: number },
  mode: 'CAR' | 'BUS' | 'WALK' | 'BIKE'
): Promise<{ path: { lat: number, lng: number }[], distance: number, duration: number }> => {
  const profile = (mode === 'WALK' || mode === 'BIKE') ? 'foot' : 'driving';
  const url = `https://router.project-osrm.org/route/v1/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      const route = data.routes[0];
      const path = route.geometry.coordinates.map((coord: any) => ({
        lat: coord[1],
        lng: coord[0]
      }));
      const distance = route.legs[0].distance / 1000; // km
      const duration = Math.ceil(route.legs[0].duration / 60);
      return { path, distance, duration };
    }
  } catch (err) {
    console.warn("OSRM Route fetch failed, falling back to simulated interpolation", err);
  }

  // Fallback if OSRM is blocked or down
  const pointsCount = 15;
  const path: { lat: number, lng: number }[] = [start];
  for (let i = 1; i < pointsCount; i++) {
    const ratio = i / pointsCount;
    const baseLat = start.lat + (end.lat - start.lat) * ratio;
    const baseLng = start.lng + (end.lng - start.lng) * ratio;
    const wobble = Math.sin(i * 2) * 0.0006;
    path.push({ lat: baseLat + wobble, lng: baseLng + (i % 2 === 0 ? wobble : -wobble) });
  }
  path.push(end);
  const dist = Math.sqrt(Math.pow(end.lat - start.lat, 2) + Math.pow(end.lng - start.lng, 2)) * 100;
  const speedMap = { CAR: 40, BUS: 25, WALK: 5, BIKE: 18 };
  const duration = Math.ceil((dist / speedMap[mode]) * 60);
  return { path, distance: parseFloat(dist.toFixed(1)), duration };
};

// Haversine distance formula to calculate accurate real-world distance in km
const haversineDistance = (p1: { lat: number, lng: number }, p2: { lat: number, lng: number }) => {
  const R = 6371; // Earth radius in km
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLng = (p2.lng - p1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const MainMap: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [polylinePath, setPolylinePath] = useState<{ lat: number, lng: number }[]>([]);
  const [coursePolylinePath, setCoursePolylinePath] = useState<{ lat: number, lng: number }[]>([]);
  const [navInfo, setNavInfo] = useState({ distance: 0, duration: 0, toll: 0 });
  const [simSegment, setSimSegment] = useState<'TRANSIT' | 'COURSE' | 'NONE'>('NONE');
  const [transportMode, setTransportMode] = useState<'CAR' | 'BUS' | 'WALK' | 'BIKE'>('CAR');
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [gpsSpeed, setGpsSpeed] = useState<number | null>(null);
  const [isSafetyDriveMode, setIsSafetyDriveMode] = useState(false);
  const [isOnHighway, setIsOnHighway] = useState(false);
  const [trafficStatus, setTrafficStatus] = useState("교통 상황 원활");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const [currentPos, setCurrentPos] = useState({ lat: 37.5665, lng: 126.9780 });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [destination, setDestination] = useState("");
  const [startPlace, setStartPlace] = useState<any | null>(null);
  const [activeSearchField, setActiveSearchField] = useState<'start' | 'destination' | 'none'>('none');
  const [points] = useState(12450);
  const [aiStatus, setAiStatus] = useState<'STANDBY' | 'READY' | 'LISTENING' | 'THINKING'>('STANDBY');
  
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [activeStayTab, setActiveStayTab] = useState<'hotel' | 'motel' | 'longterm'>('hotel');
  const [nearbyRecommendations, setNearbyRecommendations] = useState<{
    fuel?: { cheapest: any; closest: any };
    food?: { cheapest: any; closest: any };
    hotel_hotel?: { cheapest: any; closest: any };
    hotel_motel?: { cheapest: any; closest: any };
    hotel_longterm?: { cheapest: any; closest: any };
    landmark?: { cheapest: any; closest: any };
  }>({});
  const [isSearchingNearby, setIsSearchingNearby] = useState(false);
  
  // Pre-calculated route options for transport modes
  const [routeOptions, setRouteOptions] = useState<{
    CAR?: { path: { lat: number, lng: number }[], distance: number, duration: number },
    BUS?: { path: { lat: number, lng: number }[], distance: number, duration: number },
    WALK?: { path: { lat: number, lng: number }[], distance: number, duration: number }
  }>({});

  // Highway Mode HUD Items State
  const [highwayItems, setHighwayItems] = useState([
    { id: 'tg1', type: 'TG', name: '서울 요금소', distance: 2.4, info: '통행료 1,800원' },
    { id: 'ra1', type: 'RA', name: '기흥 휴게소', distance: 12.5, info: '휘 1,595 | 경 1,395' },
    { id: 'tg2', type: 'TG', name: '수원신갈 TG', distance: 21.0, info: '통행료 1,200원' },
    { id: 'ra2', type: 'RA', name: '죽전 휴게소', distance: 32.4, info: '휘 1,580 | 경 1,380' }
  ]);

  // Highway countdown simulation
  useEffect(() => {
    if (!isNavigating) return;
    const interval = setInterval(() => {
      setHighwayItems(prev =>
        prev.map(item => ({
          ...item,
          distance: Math.max(0, parseFloat((item.distance - 0.1).toFixed(1)))
        }))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [isNavigating]);

  // Dynamic Map Types & Overlays from Settings
  useEffect(() => {
    if (!map) return;
    try {
      // 1. Map type
      const mapTypeSetting = localStorage.getItem('moodrive_map_type') || 'roadmap';
      if (mapTypeSetting === 'skyview' && (window as any).kakao?.maps?.MapTypeId) {
        map.setMapTypeId((window as any).kakao.maps.MapTypeId.HYBRID);
      } else if ((window as any).kakao?.maps?.MapTypeId) {
        map.setMapTypeId((window as any).kakao.maps.MapTypeId.ROADMAP);
      }

      // 2. Overlays
      const showTraffic = localStorage.getItem('moodrive_show_traffic') === 'true';
      const showBicycle = localStorage.getItem('moodrive_show_bicycle') === 'true';
      const showCadastral = localStorage.getItem('moodrive_show_cadastral') === 'true';

      if ((window as any).kakao?.maps?.MapTypeId) {
        const types = (window as any).kakao.maps.MapTypeId;
        map.removeOverlayMapTypeId(types.TRAFFIC);
        map.removeOverlayMapTypeId(types.BICYCLE);
        map.removeOverlayMapTypeId(types.USE_DISTRICT);

        if (showTraffic) map.addOverlayMapTypeId(types.TRAFFIC);
        if (showBicycle) map.addOverlayMapTypeId(types.BICYCLE);
        if (showCadastral) map.addOverlayMapTypeId(types.USE_DISTRICT);
      }
    } catch (err) {
      console.warn("Failed to apply map overrides:", err);
    }
  }, [map]);

  // Speed Camera countdown state and simulation
  const [cameraDistance, setCameraDistance] = useState<number | null>(null);
  const [cameraLimit, setCameraLimit] = useState<number>(60);

  useEffect(() => {
    if (!isNavigating || transportMode !== 'CAR') {
      setCameraDistance(null);
      return;
    }

    // Delay camera alarm by 4s once navigation starts
    const timer = setTimeout(() => {
      const alertDistSetting = localStorage.getItem('moodrive_camera_alert') || '500m';
      const startDist = alertDistSetting === '300m' ? 300 : (alertDistSetting === '1km' ? 1000 : 500);
      const limit = [50, 60, 80, 100][Math.floor(Math.random() * 4)];
      setCameraLimit(limit);
      setCameraDistance(startDist);
      voiceService.speak(`잠시 후 시속 ${limit}킬로미터 신호 과속 단속 구간입니다.`);
    }, 4000);

    return () => clearTimeout(timer);
  }, [isNavigating, transportMode]);

  useEffect(() => {
    if (cameraDistance === null || !isNavigating || transportMode !== 'CAR') return;

    const interval = setInterval(() => {
      setCameraDistance(prev => {
        if (prev === null) return null;
        const next = prev - 20;
        if (next <= 0) {
          voiceService.speak("단속 구간을 통과했습니다.");
          
          // Queue next camera alert after 15 seconds
          setTimeout(() => {
            if (isNavigating && transportMode === 'CAR') {
              const alertDistSetting = localStorage.getItem('moodrive_camera_alert') || '500m';
              const startDist = alertDistSetting === '300m' ? 300 : (alertDistSetting === '1km' ? 1000 : 500);
              const limit = [50, 60, 80, 100][Math.floor(Math.random() * 4)];
              setCameraLimit(limit);
              setCameraDistance(startDist);
              voiceService.speak(`잠시 후 시속 ${limit}킬로미터 신호 과속 단속 구간입니다.`);
            }
          }, 15000);

          return null;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cameraDistance, isNavigating, transportMode]);

  // Speedometer geolocation watch and simulation logic
  useEffect(() => {
    if (!isNavigating) {
      setGpsSpeed(null);
      setCurrentSpeed(0);
      return;
    }

    let watchId: number | null = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (pos.coords.speed !== null && pos.coords.speed !== undefined && pos.coords.speed >= 0) {
            const speedKmh = Math.round(pos.coords.speed * 3.6);
            setGpsSpeed(speedKmh);
          } else {
            setGpsSpeed(null);
          }
        },
        (err) => {
          console.warn("Geolocation watch speed error:", err);
          setGpsSpeed(null);
        },
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isNavigating]);

  useEffect(() => {
    if (!isNavigating) return;

    const initialBase = isSafetyDriveMode ? 0 : (transportMode === 'WALK' ? 5 : (transportMode === 'BUS' ? 45 : (transportMode === 'BIKE' ? 18 : 78)));
    setCurrentSpeed(initialBase);

    const interval = setInterval(() => {
      if (gpsSpeed !== null) {
        setCurrentSpeed(gpsSpeed);
        return;
      }

      setCurrentSpeed((prevSpeed) => {
        let target = 0;
        let variance = 1;
        if (transportMode === 'WALK') {
          target = 5;
          variance = 0.5;
        } else if (transportMode === 'BUS') {
          target = 45;
          variance = 2;
        } else if (transportMode === 'BIKE') {
          target = 18;
          variance = 1.5;
        } else {
          // CAR mode
          if (cameraDistance !== null && cameraDistance < 200) {
            target = cameraLimit - 4;
            variance = 1;
          } else {
            target = 78;
            variance = 3;
          }
        }

        // If in Safety Drive Mode, simulate acceleration from 0 km/h
        if (isSafetyDriveMode && prevSpeed < target - 5) {
          const accel = Math.round(8 + Math.random() * 4);
          return prevSpeed + accel;
        }

        const delta = (Math.random() - 0.5) * variance * 2;
        let nextSpeed = Math.round(target + delta);
        if (nextSpeed < 0) nextSpeed = 0;
        return nextSpeed;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isNavigating, transportMode, cameraDistance, cameraLimit, gpsSpeed, isSafetyDriveMode]);

  // Highway state detection and voice feedback
  useEffect(() => {
    if (!isNavigating) {
      setIsOnHighway(false);
      return;
    }

    if (isSafetyDriveMode) {
      if (currentSpeed >= 70 && !isOnHighway) {
        setIsOnHighway(true);
        voiceService.speak("고속도로 요금소에 진입했습니다. 통행료 실시간 수집을 시작합니다.");
      } else if (currentSpeed < 45 && isOnHighway) {
        setIsOnHighway(false);
        voiceService.speak("고속도로 주행을 완료하고 일반 도로로 진입했습니다.");
      }
    } else {
      setIsOnHighway(navInfo.toll > 0);
    }
  }, [currentSpeed, isSafetyDriveMode, isNavigating, navInfo.toll, isOnHighway]);

  // Traffic status simulation loop in Safety Drive Mode
  useEffect(() => {
    if (!isSafetyDriveMode || !isNavigating) return;

    const statuses = [
      "교통 상황 원활",
      "전방 소통 원활",
      "실시간 도로 상황 수집 중",
      "교통 흐름 원활",
      "안전 규정속도를 준수하세요"
    ];

    const interval = setInterval(() => {
      setTrafficStatus(() => {
        const currentIdx = statuses.indexOf(trafficStatus);
        let nextIdx = Math.floor(Math.random() * statuses.length);
        if (nextIdx === currentIdx) {
          nextIdx = (nextIdx + 1) % statuses.length;
        }
        return statuses[nextIdx];
      });
    }, 10000); // changes every 10 seconds

    return () => clearInterval(interval);
  }, [isSafetyDriveMode, isNavigating, trafficStatus]);

  const [loading] = useKakaoLoader({
    appkey: "338f0930685d328dadea60e03f7907a8",
    libraries: ["services", "clusterer", "drawing"],
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCurrentPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  const startSafetyDrive = () => {
    setIsSafetyDriveMode(true);
    setTransportMode('CAR');
    setDestination("안전운행 안내");
    setSearchResults([]);
    setSelectedPlace(null);
    setSearchQuery("");
    setIsRightSidebarOpen(false);
    setIsNavigating(true);
    voiceService.speak("안전운행 안내를 시작합니다. 실시간 단속 정보를 안내합니다.");
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (e) {}
    localStorage.removeItem('moodrive_user');
    navigate('/login');
  };

  const startCourseNavigation = async (
    courseName: string, 
    course: { start: { lat: number, lng: number }, end: { lat: number, lng: number } },
    mode: 'CAR' | 'BUS' | 'WALK' | 'BIKE' = 'CAR'
  ) => {
    setDestination(courseName);
    setSelectedPlace({
      place_name: courseName,
      y: course.start.lat.toString(),
      x: course.start.lng.toString(),
      address_name: mode === 'WALK' ? "추천 걷기 코스 출발점" : "추천 드라이브 코스 출발점"
    });
    setTransportMode(mode);
    setSearchQuery("");
    setSearchParams({});
    setPolylinePath([]);
    setCoursePolylinePath([]);
    await getCourseRoute(course.start, course.end, mode);
  };

  const getCourseRoute = async (
    start: { lat: number, lng: number }, 
    end: { lat: number, lng: number },
    mode: 'CAR' | 'BUS' | 'WALK' | 'BIKE' = transportMode
  ) => {
    try {
      const startCoords = startPlace 
        ? { lat: parseFloat(startPlace.y), lng: parseFloat(startPlace.x) } 
        : currentPos;
      // 1. Current position to Course Start point
      const res1 = await fetchOSRMRoute(startCoords, start, mode);
      // 2. Course Start point to Course End point (the curated course segment)
      const res2 = await fetchOSRMRoute(start, end, mode);

      let totalDistance = parseFloat((res1.distance + res2.distance).toFixed(1));
      let totalDuration = res1.duration + res2.duration;
      let toll = 0;

      if (mode === 'CAR') {
        const routeOption = localStorage.getItem('moodrive_nav_route_option') || 'RECOMMEND';
        if (routeOption === 'SHORTEST') {
          totalDistance = parseFloat((totalDistance * 0.95).toFixed(1));
          totalDuration = Math.ceil(totalDuration * 1.05);
          toll = Math.round(totalDistance * 100 / 100) * 100;
        } else if (routeOption === 'TOLL_FREE') {
          totalDistance = parseFloat((totalDistance * 1.1).toFixed(1));
          totalDuration = Math.ceil(totalDuration * 1.25);
          toll = 0;
        } else {
          // RECOMMEND
          toll = Math.round(totalDistance * 130 / 100) * 100;
        }
      }

      setPolylinePath(res1.path);
      setCoursePolylinePath(res2.path);
      setNavInfo({
        distance: totalDistance,
        duration: totalDuration,
        toll
      } as any);

      if (map) {
        const bounds = new kakao.maps.LatLngBounds();
        res1.path.forEach(p => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)));
        res2.path.forEach(p => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)));
        map.panTo(new kakao.maps.LatLng(start.lat, start.lng));
        map.setBounds(bounds, 120);
      }
    } catch (e) {
      console.warn("OSRM course directions failed", e);
    }
  };

  const recalculateRoute = async (sPlace: any | null, dPlace: any) => {
    if (!dPlace) return;
    const startCoords = sPlace 
      ? { lat: parseFloat(sPlace.y), lng: parseFloat(sPlace.x) } 
      : currentPos;
    const end = { lat: parseFloat(dPlace.y), lng: parseFloat(dPlace.x) };

    if (map) {
      const bounds = new kakao.maps.LatLngBounds();
      bounds.extend(new kakao.maps.LatLng(startCoords.lat, startCoords.lng));
      bounds.extend(new kakao.maps.LatLng(end.lat, end.lng));
      map.setBounds(bounds, 120);
    }

    try {
      const carRes = await fetchOSRMRoute(startCoords, end, 'CAR');
      
      const routeOption = localStorage.getItem('moodrive_nav_route_option') || 'RECOMMEND';
      let adjustedCar = { ...carRes, toll: 0 };
      if (routeOption === 'SHORTEST') {
        adjustedCar.distance = parseFloat((carRes.distance * 0.95).toFixed(1));
        adjustedCar.duration = Math.ceil(carRes.duration * 1.05);
        adjustedCar.toll = Math.round(adjustedCar.distance * 100 / 100) * 100;
      } else if (routeOption === 'TOLL_FREE') {
        adjustedCar.distance = parseFloat((carRes.distance * 1.1).toFixed(1));
        adjustedCar.duration = Math.ceil(carRes.duration * 1.25);
        adjustedCar.toll = 0;
      } else {
        adjustedCar.toll = Math.round(carRes.distance * 130 / 100) * 100;
      }

      const transitRes = {
        path: carRes.path,
        distance: carRes.distance,
        duration: Math.max(5, Math.ceil(carRes.duration * 1.25))
      };
      const walkRes = await fetchOSRMRoute(startCoords, end, 'WALK');

      setRouteOptions({
        CAR: adjustedCar,
        BUS: transitRes,
        WALK: walkRes
      } as any);

      const activeRoute = transportMode === 'WALK' ? walkRes : (transportMode === 'BUS' ? transitRes : adjustedCar);
      setPolylinePath(activeRoute.path);
      setNavInfo({ 
        distance: activeRoute.distance, 
        duration: activeRoute.duration, 
        toll: (activeRoute as any).toll || 0 
      });
    } catch (e) {
      console.warn("Recalculate route failed", e);
    }
  };

  const selectStartPlace = async (place: any) => {
    setStartPlace(place);
    setSearchQuery("");
    setSearchResults([]);
    setActiveSearchField('none');
    if (selectedPlace) {
      await recalculateRoute(place, selectedPlace);
    }
  };

  const resetToMyLocationStart = async () => {
    setStartPlace(null);
    setSearchQuery("");
    setSearchResults([]);
    setActiveSearchField('none');
    if (selectedPlace) {
      await recalculateRoute(null, selectedPlace);
    }
  };

  const swapStartEnd = () => {
    if (!selectedPlace) return;
    const currentPlaceObj = {
      place_name: "내 위치",
      y: currentPos.lat.toString(),
      x: currentPos.lng.toString(),
      address_name: "현재 GPS 수신 위치"
    };
    const nextStart = selectedPlace;
    const nextEnd = startPlace || currentPlaceObj;

    setStartPlace(nextStart);
    selectPlace(nextEnd);
  };

  const fetchNearbyRecommendations = useCallback((lat: number, lng: number) => {
    if (isSearchingNearby) return;
    setIsSearchingNearby(true);

    const generateMockRecommendations = (baseLat: number, baseLng: number) => {
      const mockCategories = {
        fuel: {
          cheapest: { id: 'mock_fuel_1', place_name: '에너지 알뜰주유소', x: (baseLng + 0.015).toString(), y: (baseLat + 0.012).toString(), distance: '2100', distanceNum: 2100, priceNum: 1540, priceText: '1,540원' },
          closest: { id: 'mock_fuel_2', place_name: '현대오일뱅크 대청호주유소', x: (baseLng + 0.005).toString(), y: (baseLat + 0.004).toString(), distance: '800', distanceNum: 800, priceNum: 1595, priceText: '1,595원' }
        },
        food: {
          cheapest: { id: 'mock_food_1', place_name: '대청마루 시골밥상', x: (baseLng - 0.01).toString(), y: (baseLat + 0.008).toString(), distance: '1400', distanceNum: 1400, priceNum: 9000, priceText: '평균 9,000원' },
          closest: { id: 'mock_food_2', place_name: '레이크뷰 이탈리안 레스토랑', x: (baseLng + 0.003).toString(), y: (baseLat + 0.002).toString(), distance: '450', distanceNum: 450, priceNum: 18000, priceText: '평균 18,000원' }
        },
        hotel_hotel: {
          cheapest: { id: 'mock_hotel_1', place_name: '레이크사이드 리조트 호텔', x: (baseLng - 0.02).toString(), y: (baseLat - 0.015).toString(), distance: '3200', distanceNum: 3200, priceNum: 110000, priceText: '110,000원~' },
          closest: { id: 'mock_hotel_2', place_name: '더그랜드 청주 호텔', x: (baseLng + 0.007).toString(), y: (baseLat + 0.008).toString(), distance: '1100', distanceNum: 1100, priceNum: 180000, priceText: '180,000원~' }
        },
        hotel_motel: {
          cheapest: { id: 'mock_motel_1', place_name: '호반 드라이브인 무인텔', x: (baseLng + 0.018).toString(), y: (baseLat + 0.016).toString(), distance: '2800', distanceNum: 2800, priceNum: 40000, priceText: '40,000원~' },
          closest: { id: 'mock_motel_2', place_name: '대청 레이크뷰 모텔', x: (baseLng - 0.009).toString(), y: (baseLat + 0.011).toString(), distance: '1500', distanceNum: 1500, priceNum: 50000, priceText: '50,000원~' }
        },
        hotel_longterm: {
          cheapest: { id: 'mock_long_1', place_name: '숲속 초록 게스트하우스', x: (baseLng - 0.03).toString(), y: (baseLat - 0.025).toString(), distance: '4500', distanceNum: 4500, priceNum: 20000, priceText: '1박 20,000원~' },
          closest: { id: 'mock_long_2', place_name: '호수마을 전통 한옥민박', x: (baseLng + 0.014).toString(), y: (baseLat + 0.013).toString(), distance: '2200', distanceNum: 2200, priceNum: 35000, priceText: '1박 35,000원~' }
        },
        landmark: {
          cheapest: { id: 'mock_view_1', place_name: '대청호반 자연생태공원', x: (baseLng + 0.006).toString(), y: (baseLat + 0.007).toString(), distance: '950', distanceNum: 950, priceNum: 0, priceText: '무료' },
          closest: { id: 'mock_view_2', place_name: '대청호 전망대 쉼터', x: (baseLng + 0.004).toString(), y: (baseLat + 0.003).toString(), distance: '600', distanceNum: 600, priceNum: 0, priceText: '무료' }
        }
      };
      return mockCategories;
    };

    try {
      const ps = new kakao.maps.services.Places();
      const searchOptions: kakao.maps.services.PlacesSearchOptions = {
        location: new kakao.maps.LatLng(lat, lng),
        radius: 5000,
        sort: kakao.maps.services.SortBy.DISTANCE
      };

      const categories = [
        { key: 'fuel', query: '주유소' },
        { key: 'food', query: '맛집' },
        { key: 'hotel_hotel', query: '호텔' },
        { key: 'hotel_motel', query: '모텔' },
        { key: 'hotel_longterm', query: '게스트하우스' },
        { key: 'landmark', query: '관광명소' }
      ];

      const results: any = {};
      let completed = 0;

      categories.forEach((cat) => {
        try {
          ps.keywordSearch(cat.query, (data, status) => {
            completed++;
            if (status === kakao.maps.services.Status.OK && data && data.length > 0) {
              const placesWithPrice = data.slice(0, 5).map(place => {
                const hash = place.id.split('').reduce((a: number, b: string) => (a + b.charCodeAt(0)), 0);
                let priceNum = 0;
                let priceText = '';
                
                if (cat.key === 'fuel') {
                  priceNum = 1580 + (hash % 140);
                  priceText = `${priceNum.toLocaleString()}원`;
                } else if (cat.key === 'food') {
                  priceNum = 8500 + (hash % 120) * 100;
                  priceText = `평균 ${priceNum.toLocaleString()}원`;
                } else if (cat.key === 'hotel_hotel') {
                  priceNum = 120000 + (hash % 300) * 1000;
                  priceText = `${priceNum.toLocaleString()}원~`;
                } else if (cat.key === 'hotel_motel') {
                  priceNum = 45000 + (hash % 100) * 500;
                  priceText = `${priceNum.toLocaleString()}원~`;
                } else if (cat.key === 'hotel_longterm') {
                  priceNum = 25000 + (hash % 50) * 1000;
                  priceText = `1박 ${priceNum.toLocaleString()}원~`;
                } else {
                  priceNum = (hash % 15) * 1000;
                  priceText = priceNum === 0 ? '무료' : `입장료 ${priceNum.toLocaleString()}원`;
                }
                
                return {
                  ...place,
                  priceNum,
                  priceText,
                  distanceNum: parseFloat(place.distance) || 0
                };
              });

              const cheapest = [...placesWithPrice].sort((a, b) => a.priceNum - b.priceNum)[0];
              const closest = [...placesWithPrice].sort((a, b) => a.distanceNum - b.distanceNum)[0];
              
              results[cat.key] = {
                cheapest,
                closest
              };
            } else {
              // Fallback to mock data for this specific category if no results are found
              const mockCat = generateMockRecommendations(lat, lng)[cat.key as keyof ReturnType<typeof generateMockRecommendations>];
              results[cat.key] = mockCat;
            }
            
            if (completed === categories.length) {
              setNearbyRecommendations(results);
              setIsSearchingNearby(false);
            }
          }, searchOptions);
        } catch (e) {
          console.warn(`Keyword search failed for category ${cat.key}`, e);
          completed++;
          
          // Fallback to mock data on exception
          const mockCat = generateMockRecommendations(lat, lng)[cat.key as keyof ReturnType<typeof generateMockRecommendations>];
          results[cat.key] = mockCat;

          if (completed === categories.length) {
            setNearbyRecommendations(results);
            setIsSearchingNearby(false);
          }
        }
      });
    } catch (e) {
      console.warn("Kakao Places initialization failed, returning mock data", e);
      // Full fallback if Places services fail to initialize
      setNearbyRecommendations(generateMockRecommendations(lat, lng));
      setIsSearchingNearby(false);
    }
  }, [isSearchingNearby]);

  useEffect(() => {
    if (isRightSidebarOpen && currentPos.lat && currentPos.lng) {
      fetchNearbyRecommendations(currentPos.lat, currentPos.lng);
    }
  }, [isRightSidebarOpen, currentPos.lat, currentPos.lng, fetchNearbyRecommendations]);

  const lastQueryRef = useRef<string | null>(null);
  const followUpTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const query = searchParams.get('search');
    const modeParam = searchParams.get('mode');
    if (query && map) {
      if (lastQueryRef.current === query) return;
      lastQueryRef.current = query;
      setSearchQuery(query);
      
      let targetMode: 'CAR' | 'BUS' | 'WALK' | 'BIKE' = 'CAR';
      if (modeParam === 'WALK') {
        targetMode = 'WALK';
      } else if (modeParam === 'BUS' || modeParam === 'SUBWAY') {
        targetMode = 'BUS';
      }
      setTransportMode(targetMode);

      const courseKey = Object.keys(COURSE_PATHS).find(k => 
        query.toLowerCase().includes(k.toLowerCase()) || 
        k.toLowerCase().includes(query.toLowerCase())
      );
      if (courseKey) {
        const course = COURSE_PATHS[courseKey];
        startCourseNavigation(courseKey, course, targetMode);
      } else {
        handleSearch(query);
      }
    }
  }, [searchParams, map]);

  // Active real-time GPS tracking and dynamic distance recalculation
  useEffect(() => {
    if (!navigator.geolocation) return;

    const handleSuccess = (pos: GeolocationPosition) => {
      const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCurrentPos(newPos);

      // If active navigation is running, update the map camera and recalculate remaining metrics
      if (isNavigating) {
        if (map) {
          map.panTo(new kakao.maps.LatLng(newPos.lat, newPos.lng));
        }

        // Determine destination coordinate
        let targetPoint: { lat: number, lng: number } | null = null;
        if (coursePolylinePath.length > 0) {
          if (simSegment === 'TRANSIT') {
            targetPoint = coursePolylinePath[0]; // Course start point
            const distToStart = haversineDistance(newPos, targetPoint);
            // Transition from entry route to actual course route when within 30m
            if (distToStart < 0.03) {
              setSimSegment('COURSE');
              if (transportMode === 'WALK') {
                voiceService.speak("걷기 코스에 진입했습니다. 지금부터 아름다운 산책길 안내를 시작합니다. 주변 경치를 둘러보며 안전하게 걸어보세요!");
              } else {
                voiceService.speak("드라이브 코스 지점에 진입했습니다. 지금부터 본격적인 크루징 안내를 시작합니다. 창문을 열고 시원한 바람을 느껴보세요!");
              }
            }
          } else {
            targetPoint = coursePolylinePath[coursePolylinePath.length - 1]; // Course end point
            const distToEnd = haversineDistance(newPos, targetPoint);
            // Finish navigation when within 20m of course end
            if (distToEnd < 0.02) {
              setIsNavigating(false);
              setIsSafetyDriveMode(false);
              setSimSegment('NONE');
              setPolylinePath([]);
              setCoursePolylinePath([]);
              if (transportMode === 'WALK') {
                voiceService.speak("도보 산책 코스를 안전하게 완주하셨습니다. 즐거운 시간 되셨길 바랍니다! 감사합니다.");
              } else {
                voiceService.speak("드라이브 코스 주행을 안전하게 마쳤습니다. 오늘 드라이브는 즐거우셨나요? 이용해 주셔서 감사합니다!");
              }
            }
          }
        } else if (selectedPlace) {
          targetPoint = { lat: parseFloat(selectedPlace.y), lng: parseFloat(selectedPlace.x) };
          const distToTarget = haversineDistance(newPos, targetPoint);
          // Finish navigation when within 20m of destination
          if (distToTarget < 0.02) {
            setIsNavigating(false);
            setIsSafetyDriveMode(false);
            setPolylinePath([]);
            voiceService.speak(transportMode === 'WALK' ? "목적지에 도착하여 도보 안내를 종료합니다. 수고하셨습니다." : "목적지에 도착하여 경로 안내를 종료합니다. 안전 운전해 주셔서 감사합니다.");
          }
        }

        // Dynamic metrics update
        if (targetPoint) {
          const remainingDist = haversineDistance(newPos, targetPoint);
          const speedMap = { CAR: 40, BUS: 25, WALK: 5, BIKE: 18 };
          const remainingTime = Math.max(1, Math.ceil((remainingDist / speedMap[transportMode]) * 60));
          
          let toll = 0;
          if (transportMode === 'CAR') {
            const routeOption = localStorage.getItem('moodrive_nav_route_option') || 'RECOMMEND';
            if (routeOption === 'SHORTEST') {
              toll = Math.round(remainingDist * 100 / 100) * 100;
            } else if (routeOption === 'TOLL_FREE') {
              toll = 0;
            } else {
              toll = Math.round(remainingDist * 130 / 100) * 100;
            }
          }

          setNavInfo({
            distance: parseFloat(remainingDist.toFixed(1)),
            duration: remainingTime,
            toll
          } as any);
        }
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      console.warn("GPS tracking error: ", err);
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 5000
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isNavigating, map, selectedPlace, coursePolylinePath, simSegment, transportMode]);

  const getRoute = async (destLat: string, destLng: string, mode: 'CAR' | 'BUS' | 'WALK' | 'BIKE' = transportMode) => {
    const end = { lat: parseFloat(destLat), lng: parseFloat(destLng) };
    try {
      const startCoords = startPlace 
        ? { lat: parseFloat(startPlace.y), lng: parseFloat(startPlace.x) } 
        : currentPos;
      const res = await fetchOSRMRoute(startCoords, end, mode);
      
      let adjusted = { ...res, toll: 0 };
      if (mode === 'CAR') {
        const routeOption = localStorage.getItem('moodrive_nav_route_option') || 'RECOMMEND';
        if (routeOption === 'SHORTEST') {
          adjusted.distance = parseFloat((res.distance * 0.95).toFixed(1));
          adjusted.duration = Math.ceil(res.duration * 1.05);
          adjusted.toll = Math.round(adjusted.distance * 100 / 100) * 100;
        } else if (routeOption === 'TOLL_FREE') {
          adjusted.distance = parseFloat((res.distance * 1.1).toFixed(1));
          adjusted.duration = Math.ceil(res.duration * 1.25);
          adjusted.toll = 0;
        } else {
          // RECOMMEND
          adjusted.toll = Math.round(res.distance * 130 / 100) * 100;
        }
      }

      setPolylinePath(adjusted.path);
      setNavInfo({ distance: adjusted.distance, duration: adjusted.duration, toll: adjusted.toll } as any);

      if (map && adjusted.path.length > 0) {
        const bounds = new kakao.maps.LatLngBounds();
        adjusted.path.forEach(p => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)));
        map.setBounds(bounds, 120);
      }
    } catch (e) {
      console.warn("OSRM Route fetch failed in getRoute", e);
    }
  };

  useEffect(() => {
    if (aiStatus === 'STANDBY') {
      startVoiceAssistant();
    }
  }, [aiStatus]);

  useEffect(() => {
    return () => {
      voiceService.stopListening();
      if (followUpTimeoutRef.current) {
        clearTimeout(followUpTimeoutRef.current);
      }
    };
  }, []);

  const triggerVoiceAssistant = () => {
    if (aiStatus === 'LISTENING' || aiStatus === 'THINKING') {
      if (followUpTimeoutRef.current) {
        clearTimeout(followUpTimeoutRef.current);
        followUpTimeoutRef.current = null;
      }
      voiceService.stopListening();
      setAiStatus('STANDBY');
      return;
    }
    setAiStatus('READY');
    voiceService.speak("네, 어디로 안내할까요?");
    setTimeout(() => {
      setAiStatus('LISTENING');
      voiceService.listen(handleGenAIResponse);
    }, 1200);
  };

  const startVoiceAssistant = () => {
    if (aiStatus === 'LISTENING' || aiStatus === 'THINKING') return;
    voiceService.listen((text) => {
      const lowerText = text.toLowerCase();
      if (
        lowerText.includes('hk') || 
        lowerText.includes('에이치케이') || 
        lowerText.includes('에이치 케이') || 
        lowerText.includes('hk야') || 
        lowerText.includes('에이치케이야') || 
        lowerText.includes('에이치 케이야')
      ) {
        if (followUpTimeoutRef.current) {
          clearTimeout(followUpTimeoutRef.current);
          followUpTimeoutRef.current = null;
        }
        setAiStatus('READY');
        voiceService.speak("네, 어디로 안내할까요?");
        setTimeout(() => {
          setAiStatus('LISTENING');
          voiceService.listen(handleGenAIResponse);
        }, 1200);
      }
    });
  };

  const handleGenAIResponse = async (userText: string) => {
    if (followUpTimeoutRef.current) {
      clearTimeout(followUpTimeoutRef.current);
      followUpTimeoutRef.current = null;
    }

    setAiStatus('THINKING');
    voiceService.stopListening(); // Stop microphone listening while the assistant responds
    try {
      const response = await generateDriveRecommendation(userText);
      voiceService.speak(response);

      const navMatch = userText.match(/(.+)으로\s*(가줘|가자|안내|추천)/) || 
                       userText.match(/(.+)\s*(가줘|가자|안내|추천)/);

      if (navMatch && navMatch[1]) {
        const dest = navMatch[1].replace(/야|님|아|HK|에이치케이/g, '').trim();
        if (dest.length > 1) {
          setSearchQuery(dest);
          handleSearch(dest);
        }
      }
    } catch (error) {
      console.error(error);
    }

    // Now, keep mic active for 3 seconds for follow-up conversation
    setTimeout(() => {
      setAiStatus('LISTENING');
      voiceService.listen(handleGenAIResponse);

      followUpTimeoutRef.current = setTimeout(() => {
        setAiStatus('STANDBY');
        voiceService.stopListening();
      }, 3000);
    }, 1500);
  };

  const handleSearch = (query: string, isCategory = false) => {
    if (!query) return;
    
    if (!isSafetyDriveMode) {
      setSelectedPlace(null);
      setDestination("");
      setPolylinePath([]);
      setCoursePolylinePath([]);
      setNavInfo({ distance: 0, duration: 0, toll: 0 });

      // Intercept search if it matches a curated drive course
      const courseKey = Object.keys(COURSE_PATHS).find(k => 
        query.toLowerCase().includes(k.toLowerCase()) || 
        k.toLowerCase().includes(query.toLowerCase())
      );
      if (courseKey && !isCategory) {
        const course = COURSE_PATHS[courseKey];
        startCourseNavigation(courseKey, course);
        return;
      }
    } else {
      setSelectedPlace(null);
    }

    const ps = new kakao.maps.services.Places();
    const searchOptions: kakao.maps.services.PlacesSearchOptions = {
      location: new kakao.maps.LatLng(currentPos.lat, currentPos.lng),
      radius: 5000, // 5km radius
      sort: kakao.maps.services.SortBy.DISTANCE // Sort by distance
    };

    ps.keywordSearch(query, (data, status) => {
      if (status === kakao.maps.services.Status.OK) {
        setSearchResults(data);
        if (data.length > 0 && map) {
          // 검색 결과가 있으면 가장 가까운 첫 번째 결과로 부드럽게 이동
          map.panTo(new kakao.maps.LatLng(parseFloat(data[0].y), parseFloat(data[0].x)));
        }
      }
    }, isCategory ? searchOptions : undefined);
  };

  const selectPlace = async (place: any) => {
    setSelectedPlace(place);
    setDestination(place.place_name);
    setCoursePolylinePath([]); // Clear course segments on normal place selection
    setSearchQuery("");
    setSearchParams({});
    await recalculateRoute(startPlace, place);
  };

  if (loading) return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center text-nike-volt">
        <div className="w-16 h-16 border-4 border-nike-volt border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-black italic animate-pulse">LOADING...</p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-[#0a0a0a] relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <Map center={currentPos} style={{ width: '100%', height: '100%' }} level={4} onCreate={setMap}>
          {polylinePath.length > 0 && (
            <>
              {/* Transit Outer Border */}
              <Polyline
                path={polylinePath}
                strokeWeight={10}
                strokeColor={"#000000"}
                strokeOpacity={0.2}
              />
              {/* Transit Inner Line */}
              <Polyline
                path={polylinePath}
                strokeWeight={6}
                strokeColor={
                  coursePolylinePath.length > 0 ? (transportMode === 'WALK' ? "#10b981" : "#3b82f6") : // Green or Blue for transit segment
                  transportMode === 'WALK' ? "#10b981" : 
                  transportMode === 'BUS' ? "#3b82f6" : "#DFFF00"
                }
                strokeOpacity={1}
                strokeStyle={coursePolylinePath.length > 0 || transportMode === 'WALK' || transportMode === 'BUS' ? 'dash' : 'solid'}
              />
            </>
          )}

          {coursePolylinePath.length > 0 && (
            <>
              {/* Course Outer Border */}
              <Polyline
                path={coursePolylinePath}
                strokeWeight={12}
                strokeColor={"#000000"}
                strokeOpacity={0.3}
              />
              {/* Course Inner Line */}
              <Polyline
                path={coursePolylinePath}
                strokeWeight={8}
                strokeColor={
                  transportMode === 'WALK' ? "#10b981" : // Pedestrian route green
                  transportMode === 'BUS' ? "#ef4444" : "#DFFF00" // Red for transit, Volt for drive
                }
                strokeOpacity={1}
                strokeStyle={transportMode === 'WALK' ? 'dash' : 'solid'}
              />

              {/* Start and End Custom Overlay Labels */}
              <CustomOverlayMap position={coursePolylinePath[0]} yAnchor={1.5}>
                <div className="bg-[#111111]/95 text-nike-volt border border-nike-volt/30 px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5 shadow-2xl backdrop-blur-xl">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                  코스 시작점 (Cruise Start)
                </div>
              </CustomOverlayMap>

              <CustomOverlayMap position={coursePolylinePath[coursePolylinePath.length - 1]} yAnchor={1.5}>
                <div className="bg-[#111111]/95 text-white border border-white/10 px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5 shadow-2xl backdrop-blur-xl">
                  코스 종료점 (Cruise End)
                </div>
              </CustomOverlayMap>
            </>
          )}

          <CustomOverlayMap position={currentPos} yAnchor={1}>
            {isSafetyDriveMode ? (
              <Car className="text-nike-volt fill-nike-volt/20 drop-shadow-[0_0_8px_rgba(204,255,0,0.6)] scale-150 transition-all duration-300" size={32} />
            ) : (
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center border-4 border-black transition-all shadow-2xl", 
                isNavigating && "scale-110",
                transportMode === 'WALK' ? "bg-emerald-500 text-black" :
                transportMode === 'BUS' ? "bg-sky-500 text-white" : "bg-nike-volt text-black"
              )}>
                {transportMode === 'WALK' ? (
                  <PersonStanding className={cn(isNavigating && "animate-bounce")} size={28} strokeWidth={2.5} />
                ) : transportMode === 'BUS' ? (
                  <Train size={28} strokeWidth={2.5} />
                ) : (
                  <Navigation2 className={cn("text-black fill-black transition-transform duration-500", isNavigating ? "rotate-0 scale-125" : "-rotate-45")} size={28} />
                )}
              </div>
            )}
          </CustomOverlayMap>

          {/* Custom Overlay Pins for search results in Safety Driving Mode */}
          {isSafetyDriveMode && searchResults.map((place, idx) => (
            <CustomOverlayMap 
              key={place.id || idx} 
              position={{ lat: parseFloat(place.y), lng: parseFloat(place.x) }}
              yAnchor={1.25}
            >
              <button 
                onClick={() => {
                  setSelectedPlace(place);
                  if (map) {
                    map.panTo(new kakao.maps.LatLng(parseFloat(place.y), parseFloat(place.x)));
                  }
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black tracking-tight flex items-center gap-1.5 shadow-2xl backdrop-blur-xl hover:scale-105 active:scale-95 transition-all border pointer-events-auto",
                  selectedPlace?.id === place.id
                    ? "bg-nike-volt text-black border-nike-volt"
                    : "bg-[#111111]/95 text-white border-white/10 hover:border-nike-volt/30"
                )}
              >
                <MapPin size={11} className={selectedPlace?.id === place.id ? "text-black fill-black/10" : "text-nike-volt fill-nike-volt/10"} />
                <span>{place.place_name}</span>
              </button>
            </CustomOverlayMap>
          ))}
        </Map>

        {/* Voice Recognition Trigger Button */}
        {!isSafetyDriveMode && (
          <button 
            onClick={triggerVoiceAssistant}
            className={cn(
              "absolute right-6 w-14 h-14 rounded-2xl flex items-center justify-center z-[70] active:scale-90 transition-all bottom-[248px]",
              aiStatus === 'LISTENING' 
                ? "bg-nike-volt text-black shadow-[0_0_15px_rgba(204,255,0,0.6)] animate-pulse" 
                : "bg-[#111111]/90 backdrop-blur-xl border border-white/10 text-nike-volt"
            )}
          >
            <Mic size={24} />
          </button>
        )}

        {/* My Location Tracking Button */}
        {!isSafetyDriveMode && (
          <button 
            onClick={() => {
              if (map) map.panTo(new kakao.maps.LatLng(currentPos.lat, currentPos.lng));
            }}
            className="absolute right-6 w-14 h-14 bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center z-[70] active:scale-90 transition-all text-nike-volt bottom-[176px]"
          >
            <Navigation size={26} className="fill-none" />
          </button>
        )}

        {/* Safety Drive Button (Naver Map style) */}
        {!isNavigating && (
          <button 
            onClick={startSafetyDrive}
            className="absolute right-6 w-14 h-14 bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center justify-center z-[70] active:scale-90 transition-all text-nike-volt bottom-[104px]"
            title="안전주행 모드"
          >
            <Shield size={20} className="fill-nike-volt/10" />
            <span className="text-[7px] font-black tracking-tighter uppercase mt-1 text-white/80">안전주행</span>
          </button>
        )}

        {/* Naver Map Style Floating Circular Button Stack in Safety Driving Mode */}
        {isSafetyDriveMode && (
          <div className="absolute right-6 top-[180px] z-[80] flex flex-col items-center gap-3.5 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* 1. Voice Mic Button */}
            <button 
              onClick={triggerVoiceAssistant}
              className={cn(
                "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-2 active:scale-90",
                aiStatus === 'LISTENING' 
                  ? "bg-nike-volt border-nike-volt text-black animate-pulse shadow-[0_0_12px_rgba(204,255,0,0.5)]" 
                  : "bg-[#111111]/90 border-emerald-500 text-emerald-400"
              )}
              title="음성 안내"
            >
              <Mic size={18} />
            </button>

            {/* 2. Search Button with expandable input */}
            <div className="relative flex items-center justify-end pointer-events-auto">
              {isSearchExpanded && (
                <input 
                  type="text" 
                  placeholder="주변 검색..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(searchQuery);
                      setIsSearchExpanded(false);
                    }
                  }}
                  autoFocus
                  className="absolute right-13 w-32 bg-black/95 text-white border border-white/15 px-3 py-1.5 rounded-full text-[10px] font-black tracking-tight outline-none shadow-2xl animate-in slide-in-from-right-2 duration-300"
                />
              )}
              <button 
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className={cn(
                  "w-11 h-11 rounded-full bg-[#111111]/90 border flex items-center justify-center transition-all duration-300 shadow-xl active:scale-90",
                  isSearchExpanded ? "border-nike-volt text-nike-volt" : "border-white/10 text-white"
                )}
                title="통합 검색"
              >
                <Search size={18} />
              </button>
            </div>

            {/* 3. Gas Station Button with Price Badge */}
            <div className="flex flex-col items-center">
              <button 
                onClick={() => handleSearch("주유소", true)}
                className="w-11 h-11 rounded-full bg-[#111111]/90 border border-white/10 flex items-center justify-center transition-all duration-300 shadow-xl text-white hover:text-nike-volt active:scale-90"
                title="주변 주유소"
              >
                <Fuel size={18} />
              </button>
              <span className="text-[7.5px] font-black bg-nike-volt text-black px-1.5 py-0.5 rounded-md mt-1 shadow-md leading-none border border-black/10 tracking-tighter shrink-0 select-none">
                1,540원
              </span>
            </div>

            {/* 4. Restaurant Button */}
            <button 
              onClick={() => handleSearch("맛집", true)}
              className="w-11 h-11 rounded-full bg-[#111111]/90 border border-white/10 flex items-center justify-center transition-all duration-300 shadow-xl text-white hover:text-nike-volt active:scale-90"
              title="주변 식당"
            >
              <Utensils size={18} />
            </button>

            {/* 5. Lodging/Stay Button */}
            <button 
              onClick={() => handleSearch("호텔", true)}
              className="w-11 h-11 rounded-full bg-[#111111]/90 border border-white/10 flex items-center justify-center transition-all duration-300 shadow-xl text-white hover:text-nike-volt active:scale-90"
              title="주변 숙소"
            >
              <Bed size={18} />
            </button>

            {/* 6. My Location Button */}
            <button 
              onClick={() => {
                if (map) map.panTo(new kakao.maps.LatLng(currentPos.lat, currentPos.lng));
              }}
              className="w-11 h-11 rounded-full bg-[#111111]/90 border border-white/10 flex items-center justify-center transition-all duration-300 shadow-xl text-white hover:text-nike-volt active:scale-90"
              title="내 위치"
            >
              <Navigation size={18} className="fill-none" />
            </button>
          </div>
        )}
      </div>

      {/* Naver Map Style TBT Instruction Card (Only during Navigation) */}
      {isNavigating && (
        <div className="absolute top-12 left-6 right-6 z-[100] animate-in slide-in-from-top-10 duration-500">
          {transportMode === 'CAR' && (
            <>
              {isSafetyDriveMode ? (
                /* Compact unified Safety Drive HUD card */
                <div className={cn(
                  "border rounded-xl py-2.5 px-3.5 flex items-center gap-3 shadow-2xl transition-all duration-300 mx-auto max-w-[340px]",
                  cameraDistance !== null 
                    ? "bg-gradient-to-r from-red-950/95 to-black/95 border-red-500/40" 
                    : "bg-black/95 border-white/10"
                )}>
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                    cameraDistance !== null ? "bg-white" : "bg-nike-volt"
                  )}>
                    {cameraDistance !== null ? (
                      <div className="w-7 h-7 rounded-full bg-white border-[2.5px] border-red-600 flex items-center justify-center font-black text-black text-[10px] shrink-0 shadow-md">
                        {cameraLimit}
                      </div>
                    ) : (
                      destination !== "안전운행 안내" ? (
                        <ArrowLeft size={18} className="text-black -rotate-90" />
                      ) : (
                        <Shield size={18} className="text-black fill-black/10" />
                      )
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-nike-volt font-black italic text-xs tracking-tight leading-none mb-0.5">
                      {cameraDistance !== null 
                        ? `⚠️ 신호·과속 단속 ${cameraDistance}m 전방` 
                        : (destination !== "안전운행 안내" 
                            ? `🟢 250m 앞 회전 (목적지 방향)` 
                            : `🟢 ${trafficStatus}`)}
                    </div>
                    <div className="text-white/60 font-bold text-[10px] tracking-tight truncate">
                      {cameraDistance !== null 
                        ? `규정속도 ${cameraLimit}km/h 제한 구간` 
                        : (destination !== "안전운행 안내" 
                            ? `${destination} 안내 중` 
                            : "실시간 단속 및 교통정보 안내 중")}
                    </div>
                  </div>
                </div>
              ) : (
                /* Regular TBT navigation card */
                <div className="bg-black/95 border border-white/10 rounded-[32px] p-6 flex items-center gap-6">
                  <div className="w-16 h-16 bg-nike-volt rounded-2xl flex items-center justify-center flex-shrink-0">
                     <ArrowLeft size={32} className="text-black -rotate-90" />
                  </div>
                  <div className="flex-1">
                    <div className="text-nike-volt font-black italic text-3xl tracking-tighter leading-none mb-1">
                      250<span className="text-sm ml-1 uppercase">m</span>
                    </div>
                    <div className="text-white font-black italic text-lg uppercase tracking-tight">
                      {destination || "NEXT TURN"}
                    </div>
                  </div>
                </div>
              )}

              {cameraDistance !== null && !isSafetyDriveMode && (
                <div className="bg-red-950/90 border border-red-500/30 rounded-[24px] p-4 flex items-center justify-between mt-3 shadow-2xl animate-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-white border-[3.5px] border-red-600 flex items-center justify-center font-black text-black text-[15px] shrink-0 shadow-lg">
                      {cameraLimit}
                    </div>
                    <div className="text-left">
                      <div className="text-[9px] font-black text-red-400 tracking-widest uppercase">Speed Camera</div>
                      <div className="text-white font-bold text-xs tracking-tight">신호 및 과속 단속 구간</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-nike-volt font-black italic text-lg tracking-tighter">
                      {cameraDistance} <span className="text-[10px] text-white">m</span>
                    </div>
                    <div className="text-[8px] text-white/50 font-bold uppercase tracking-wider">Remaining</div>
                  </div>
                </div>
              )}
            </>
          )}

          {transportMode === 'BUS' && (
            <div className="bg-[#0b1b3d]/95 border border-sky-500/20 rounded-[32px] p-6 flex items-center gap-6">
              <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center flex-shrink-0 text-black">
                 <Train size={32} />
              </div>
              <div className="flex-1">
                <div className="text-sky-400 font-mono text-[10px] tracking-widest uppercase mb-1 font-bold">
                  지하철 최적 노선 안내 (SUBWAY TRANSIT)
                </div>
                <div className="text-white font-black italic text-xl uppercase tracking-tight">
                  이번 역: 서면역
                </div>
                <div className="text-white/40 text-[10px] uppercase font-bold mt-1">
                  다음 역: 전포역 • 2분 소요 (Next: Jeonpo)
                </div>
              </div>
            </div>
          )}

          {transportMode === 'WALK' && (
            <div className="bg-[#052416]/95 border border-emerald-500/20 rounded-[32px] p-6 flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 text-black animate-pulse">
                 <PersonStanding size={32} />
              </div>
              <div className="flex-1">
                <div className="text-emerald-400 font-mono text-[10px] tracking-widest uppercase mb-1 font-bold">
                  도보 안심 길안내 (PEDESTRIAN GUIDE)
                </div>
                <div className="text-white font-black italic text-xl uppercase tracking-tight">
                  골목길 진입 후 80m 직진
                </div>
                <div className="text-white/40 text-[10px] uppercase font-bold mt-1">
                  안전한 도보 전용 코스로 안내 중입니다.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Naver Map Style Highway Mode HUD / Transit Stops HUD / Walk Health HUD (Only during Navigation) */}
      {isNavigating && transportMode === 'CAR' && !isSafetyDriveMode && (
        <div className="absolute right-6 top-[156px] z-[80] w-56 bg-black/95 backdrop-blur-xl border border-white/10 rounded-[32px] p-5 flex flex-col max-h-[38vh] overflow-y-auto no-scrollbar shadow-2xl animate-in slide-in-from-right-10 duration-500">
          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2 shrink-0">
            <span className="text-[10px] font-black text-nike-volt tracking-widest uppercase">Highway Mode</span>
            <span className="text-[8px] font-mono text-white/40 uppercase">Gyeongbu Expwy</span>
          </div>
          <div className="relative flex-1 pl-4 pr-1 py-1 overflow-y-auto no-scrollbar">
            {/* Vertical Timeline Line */}
            <div className="absolute left-[9px] top-0 bottom-0 w-[2px] bg-white/10 rounded-full" />
            
            <div className="space-y-4">
              {highwayItems.map((item) => (
                <div key={item.id} className="relative flex gap-3 text-left">
                  {/* Timeline Dot */}
                  <div className="relative z-10 w-5 h-5 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center shrink-0">
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      item.distance === 0 ? "bg-white/20" :
                      item.type === 'TG' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "bg-nike-volt shadow-[0_0_8px_rgba(204,255,0,0.8)]"
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className={cn(
                        "text-xs font-black uppercase tracking-tight truncate",
                        item.distance === 0 ? "text-white/30" : "text-white"
                      )}>
                        {item.name}
                      </h4>
                      <span className={cn(
                        "text-[9px] font-mono shrink-0 font-bold",
                        item.distance === 0 ? "text-white/20" : "text-nike-volt"
                      )}>
                        {item.distance === 0 ? "PASSED" : `${item.distance.toFixed(1)} km`}
                      </span>
                    </div>
                    <p className={cn(
                      "text-[9px] mt-0.5 font-bold uppercase",
                      item.distance === 0 ? "text-white/10" : "text-white/40"
                    )}>
                      {item.info}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isNavigating && transportMode === 'BUS' && (
        <div className="absolute right-6 top-[156px] z-[80] w-56 bg-[#0b1b3d]/95 backdrop-blur-xl border border-sky-500/20 rounded-[32px] p-5 flex flex-col max-h-[38vh] overflow-y-auto no-scrollbar shadow-2xl animate-in slide-in-from-right-10 duration-500">
          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2 shrink-0">
            <span className="text-[10px] font-black text-sky-400 tracking-widest uppercase">지하철 노선도</span>
            <span className="text-[8px] font-mono text-white/40 uppercase">Busan Line 2</span>
          </div>
          <div className="relative flex-1 pl-4 pr-1 py-1 overflow-y-auto no-scrollbar">
            <div className="absolute left-[9px] top-0 bottom-0 w-[2px] bg-sky-500/20 rounded-full" />
            <div className="space-y-4 text-left">
              {[
                { name: '수영역 (Board)', time: '출발', type: 'BOARD' },
                { name: '금련산역', time: '1분', type: 'STOP' },
                { name: '광안역', time: '3분', type: 'STOP' },
                { name: '해운대역 (Arrive)', time: '11분', type: 'DEST' }
              ].map((stop, idx) => (
                <div key={idx} className="relative flex gap-3 text-left">
                  <div className="relative z-10 w-5 h-5 rounded-full bg-[#0b1b3d] border border-sky-500/20 flex items-center justify-center shrink-0">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      stop.type === 'BOARD' ? "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" : "bg-sky-500/30"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-xs font-black text-white truncate">{stop.name}</h4>
                      <span className="text-[9px] font-mono text-sky-400 shrink-0 font-bold">{stop.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isNavigating && transportMode === 'WALK' && (
        <div className="absolute right-6 top-[156px] z-[80] w-56 bg-[#052416]/95 backdrop-blur-xl border border-emerald-500/20 rounded-[32px] p-5 flex flex-col shadow-2xl animate-in slide-in-from-right-10 duration-500">
          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2 shrink-0">
            <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">워킹 피트니스</span>
            <span className="text-[8px] font-mono text-white/40 uppercase">Fitness Hub</span>
          </div>
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] font-bold text-white/40">👟 걸음 수</span>
              <span className="text-xs font-black text-white italic">
                {Math.round((navInfo.distance > 0 ? (12.5 - navInfo.distance) : 2.5) * 1350)} <span className="text-[9px]">보</span>
              </span>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] font-bold text-white/40">🔥 칼로리</span>
              <span className="text-xs font-black text-white italic">
                {Math.round((navInfo.distance > 0 ? (12.5 - navInfo.distance) : 2.5) * 62)} <span className="text-[9px]">KCAL</span>
              </span>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] font-bold text-white/40">💚 심박수</span>
              <span className="text-xs font-black text-emerald-400 italic flex items-center gap-1.5 animate-pulse">
                112 <span className="text-[9px] text-white/40">BPM</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar (Sam-dan-ba) NO SHADOW */}
      <div className={cn(
        "absolute top-0 left-0 bottom-0 w-72 bg-[#111111] z-[100] transform transition-transform duration-500 border-r border-white/5 p-8 flex flex-col",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex justify-between items-center mb-10">
          <div className="text-xl font-black italic text-nike-volt uppercase tracking-tighter">{t('app_name')}</div>
          <button onClick={() => setIsMenuOpen(false)} className="text-white/40 hover:text-white"><X size={24} /></button>
        </div>

        <div className="space-y-2 flex-1">
          {[
            { label: t('nav_map'), icon: Navigation, path: '/app/map' },
            { label: t('nav_routes'), icon: History, path: '/app/routes' },
            { label: t('nav_ai'), icon: Stars, path: '/app/ai' },
            { label: t('nav_garage'), icon: LayoutGrid, path: '/app/garage' },
            { label: t('nav_settings'), icon: SettingsIcon, path: '/settings' },
          ].map((item) => (
            <button key={item.label} onClick={() => { navigate(item.path); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 p-4 rounded-xl text-white/50 hover:bg-white/5 hover:text-nike-volt transition-all group text-left">
              <item.icon size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>

        <button onClick={handleLogout} className="flex items-center gap-4 p-4 text-red-500/60 hover:text-red-500 transition-colors uppercase font-black text-[10px] tracking-widest mt-auto active:scale-95">
          <LogOut size={20} />{t('settings_logout')}
        </button>
      </div>

      {/* Right Sidebar - Closest & Cheapest Nearby Places */}
      <div className={cn(
        "absolute top-0 right-0 bottom-0 w-72 bg-[#111111]/98 backdrop-blur-xl z-[100] transform transition-transform duration-500 border-l border-white/5 p-6 flex flex-col overflow-hidden shadow-2xl",
        isRightSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex justify-between items-center mb-6 shrink-0">
          <button onClick={() => setIsRightSidebarOpen(false)} className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
          <div className="flex items-center gap-1.5">
            <Compass className="text-nike-volt" size={14} />
            <span className="text-[11px] font-black italic text-nike-volt uppercase tracking-widest">주변 정보 탐색</span>
          </div>
        </div>

        {isSearchingNearby ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-nike-volt/20 border-t-nike-volt rounded-full animate-spin" />
            <span className="text-[9px] font-black text-white/40 tracking-widest uppercase animate-pulse">실시간 주변 탐색 중...</span>
          </div>
        ) : (
          /* Original recommendations list */
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pr-1">
            {[
              { key: 'fuel', title: '⛽ 주유소', icon: Fuel },
              { key: 'food', title: '🍚 밥집', icon: Utensils },
              { key: 'hotel', title: '🏨 숙박 (STAY)', icon: Bed, isStay: true },
              { key: 'landmark', title: '🏞️ 랜드마크', icon: Landmark }
            ].map((cat) => {
              const isStay = cat.isStay;
              let recs: any = null;

              if (isStay) {
                if (activeStayTab === 'hotel') recs = nearbyRecommendations.hotel_hotel;
                else if (activeStayTab === 'motel') recs = nearbyRecommendations.hotel_motel;
                else if (activeStayTab === 'longterm') recs = nearbyRecommendations.hotel_longterm;
              } else {
                recs = nearbyRecommendations[cat.key as 'fuel'|'food'|'landmark'];
              }

              const formatDistance = (m: number) => {
                if (m < 1000) return `${Math.round(m)}m`;
                return `${(m / 1000).toFixed(1)}km`;
              };

              return (
                <div key={cat.key} className="space-y-3 text-left">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-1">
                    <cat.icon className={cn("shrink-0", cat.key === 'fuel' ? 'text-nike-volt' : cat.key === 'food' ? 'text-orange-400' : isStay ? 'text-sky-400' : 'text-emerald-400')} size={14} />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{cat.title}</span>
                  </div>

                  {isStay && (
                    <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/5 shrink-0">
                      {[
                        { id: 'hotel', label: '호텔' },
                        { id: 'motel', label: '모텔' },
                        { id: 'longterm', label: '장기투숙' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveStayTab(tab.id as 'hotel' | 'motel' | 'longterm')}
                          className={cn(
                            "flex-1 text-[9px] font-black py-1.5 rounded-lg transition-all border text-center uppercase tracking-tight",
                            activeStayTab === tab.id
                              ? "bg-sky-400/10 border-sky-400/40 text-sky-400"
                              : "bg-transparent border-transparent text-white/40 hover:text-white"
                          )}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {!recs ? (
                    <div className="text-[10px] text-white/20 italic p-3 bg-white/5 rounded-xl border border-white/5 text-center">검색된 정보 없음</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {recs.cheapest && (
                        <button 
                          onClick={() => { selectPlace(recs.cheapest); setIsRightSidebarOpen(false); }}
                          className={cn(
                            "bg-white/5 hover:bg-white/10 transition-all border border-white/5 rounded-2xl p-3 flex flex-col text-left group",
                            isStay ? "hover:border-sky-400/30" : "hover:border-nike-volt/30"
                          )}
                        >
                          <div className="flex justify-between items-center w-full mb-1">
                            <span className={cn(
                              "text-[8px] font-black uppercase px-1.5 py-0.5 rounded tracking-tighter text-black",
                              isStay ? "bg-sky-400" : "bg-nike-volt"
                            )}>🏷️ 최저가</span>
                            <span className="text-[9px] font-bold text-white/40">{formatDistance(recs.cheapest.distanceNum)}</span>
                          </div>
                          <span className={cn(
                            "text-xs font-black text-white truncate max-w-[210px] transition-colors",
                            isStay ? "group-hover:text-sky-400" : "group-hover:text-nike-volt"
                          )}>{recs.cheapest.place_name}</span>
                          <span className={cn(
                            "text-[10px] font-black mt-1",
                            isStay ? "text-sky-400" : "text-nike-volt"
                          )}>{recs.cheapest.priceText}</span>
                        </button>
                      )}

                      {recs.closest && recs.closest.id !== recs.cheapest?.id && (
                        <button 
                          onClick={() => { selectPlace(recs.closest); setIsRightSidebarOpen(false); }}
                          className="bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-sky-400/30 rounded-2xl p-3 flex flex-col text-left group"
                        >
                          <div className="flex justify-between items-center w-full mb-1">
                            <span className="text-[8px] font-black uppercase bg-sky-400 text-black px-1.5 py-0.5 rounded tracking-tighter">📍 최단거리</span>
                            <span className="text-[9px] font-bold text-white/40">{formatDistance(recs.closest.distanceNum)}</span>
                          </div>
                          <span className="text-xs font-black text-white truncate max-w-[210px] group-hover:text-sky-400 transition-colors">{recs.closest.place_name}</span>
                          <span className="text-[10px] font-black text-sky-400 mt-1">{recs.closest.priceText}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex items-center justify-center pointer-events-none">
        <div className={cn("px-6 py-2 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-3 bg-black/80", aiStatus !== 'STANDBY' && "border-nike-volt/50")}>
          <div className={cn("w-2 h-2 rounded-full transition-all duration-300", aiStatus === 'STANDBY' ? "bg-white/20" : "bg-nike-volt animate-pulse")} />
          <span className="text-[10px] font-black italic tracking-widest uppercase text-nike-volt">
            {aiStatus === 'STANDBY' ? 'AI STANDBY' : `HK ${aiStatus}`}
          </span>
        </div>
      </div>
      {!isNavigating && (
        <div className="absolute top-20 left-6 right-6 z-[80] space-y-4 pointer-events-none text-left">
          {selectedPlace !== null && activeSearchField === 'none' ? (
            /* Route Planner Dual-Input Card */
            <div className="bg-[#111111]/95 backdrop-blur-xl border border-white/10 p-5 rounded-[32px] pointer-events-auto shadow-2xl flex flex-col gap-3 relative animate-in slide-in-from-top-6 duration-300">
              {/* Top row with Back button and Title */}
              <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                <button 
                  onClick={() => {
                    setSelectedPlace(null);
                    setStartPlace(null);
                    setPolylinePath([]);
                    setCoursePolylinePath([]);
                    setNavInfo({ distance: 0, duration: 0, toll: 0 });
                    setActiveSearchField('none');
                  }} 
                  className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                >
                  <ArrowLeft size={16} className="text-white" />
                </button>
                <span className="text-[10px] font-black italic text-nike-volt uppercase tracking-widest">
                  경로 탐색 (Route Search)
                </span>
              </div>

              {/* Split layout: Inputs on left, Swap button on right */}
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-3">
                  {/* Start point selector */}
                  <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-2xl pr-4">
                    <div className="w-6 h-6 rounded-full border-2 border-white/35 flex items-center justify-center font-black text-[9px] text-white/50 shrink-0 select-none">
                      S
                    </div>
                    <button 
                      onClick={() => {
                        setActiveSearchField('start');
                        setSearchQuery(startPlace ? startPlace.place_name : "");
                      }}
                      className="flex-1 text-left text-xs font-black tracking-tight text-white/95 truncate"
                    >
                      {startPlace ? startPlace.place_name : "내 위치 (현위치)"}
                    </button>
                    {startPlace && (
                      <button 
                        onClick={resetToMyLocationStart}
                        className="p-1 text-white/40 hover:text-white shrink-0"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Destination point selector */}
                  <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-2xl pr-4">
                    <div className="w-6 h-6 rounded-full bg-nike-volt flex items-center justify-center font-black text-[9px] text-black shrink-0 select-none">
                      E
                    </div>
                    <button 
                      onClick={() => {
                        setActiveSearchField('destination');
                        setSearchQuery(selectedPlace.place_name);
                      }}
                      className="flex-1 text-left text-xs font-black tracking-tight text-nike-volt truncate"
                    >
                      {selectedPlace.place_name}
                    </button>
                  </div>
                </div>

                {/* Dedicated Swap Button Column */}
                <button 
                  onClick={swapStartEnd}
                  className="w-11 h-11 bg-nike-volt text-black rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform shrink-0"
                  title="출발지/목적지 변경"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
                </button>
              </div>
            </div>
          ) : (
            /* Standard Search Bar or Active Search mode input */
            <div className="flex items-center gap-3 bg-[#111111]/95 backdrop-blur-xl border border-white/10 p-2 pl-3 rounded-[24px] pointer-events-auto shadow-2xl">
              {activeSearchField !== 'none' ? (
                <button 
                  onClick={() => {
                    setActiveSearchField('none');
                    setSearchQuery("");
                    setSearchResults([]);
                  }} 
                  className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 active:scale-95 transition-transform"
                >
                  <ArrowLeft className="text-white" size={20} />
                </button>
              ) : (
                <button onClick={() => setIsMenuOpen(true)} className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 active:scale-95 transition-transform">
                  <Menu className="text-white" size={20} />
                </button>
              )}
              <Search className="text-white/40 ml-1" size={20} />
              <input 
                type="text" 
                placeholder={
                  activeSearchField === 'start' ? "출발지 검색..." : 
                  activeSearchField === 'destination' ? "목적지 검색..." : 
                  t('map_search_placeholder')
                }
                className="flex-1 bg-transparent border-none outline-none text-white text-sm font-bold placeholder:text-white/20 uppercase"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                autoFocus={activeSearchField !== 'none'}
              />
              {activeSearchField === 'none' && (
                <button onClick={() => setIsRightSidebarOpen(true)} className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 active:scale-95 transition-transform text-nike-volt">
                  <MapPin size={20} />
                </button>
              )}
            </div>
          )}

          {!selectedPlace && searchResults.length === 0 && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 pointer-events-auto mt-2 active:cursor-grabbing">
              {[
                { id: 'fuel', icon: Fuel, label: 'GAS' },
                { id: 'food', icon: Utensils, label: 'FOOD' },
                { id: 'hotel', icon: Bed, label: 'STAY' },
                { id: 'sight', icon: Landmark, label: 'VIEW' },
                { id: 'cafe', icon: Clock, label: 'CAFE' },
                { id: 'parking', icon: MapPin, label: 'PARK' }
              ].map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => handleSearch(cat.label, true)} 
                  className="flex items-center gap-3 bg-[#111111]/85 backdrop-blur-md border border-white/5 px-6 py-4 rounded-[22px] shrink-0 hover:border-nike-volt/40 transition-all active:scale-90"
                >
                  <cat.icon className="text-nike-volt" size={18} />
                  <span className="text-[11px] font-black italic text-white uppercase tracking-tighter">{cat.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Always Visible Stats Bar - Hidden during navigation to prevent marker overlapping */}
      {!isNavigating && (
        <div className="absolute bottom-[176px] left-6 z-50 bg-[#111111]/95 border border-white/10 rounded-[28px] pointer-events-auto transition-all duration-500 ease-out shadow-2xl h-14 w-14 hover:w-48 flex items-center p-3.5 overflow-hidden group">
          {/* Pulsing neon Activity icon always visible */}
          <div className="flex items-center justify-center shrink-0 w-7 h-7 bg-nike-volt/10 rounded-full">
            <Activity className="text-nike-volt animate-pulse" size={14} />
          </div>
          
          {/* Expanded text content popping up to the right on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-3 flex flex-col text-left whitespace-nowrap select-none pointer-events-none">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[9px] font-black italic text-nike-volt uppercase tracking-tighter">Standby</span>
            </div>
            <div className="text-sm font-black italic tracking-tighter text-white leading-none mt-0.5">
              0.0<span className="text-[8px] ml-0.5">KM</span>
            </div>
            <div className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
              {points.toLocaleString()} PTS
            </div>
          </div>
        </div>
      )}

      {searchResults.length > 0 && !isNavigating && (
        <div className="absolute bottom-28 left-6 right-6 z-[80] bg-[#111111]/95 border border-white/10 rounded-[32px] flex flex-col max-h-[60vh] overflow-hidden animate-in slide-in-from-bottom-6">
          {(!selectedPlace || activeSearchField !== 'none') && (
            <div className="flex items-center px-4 py-4 border-b border-white/5 gap-3">
              {selectedPlace && (
                <button onClick={() => { setSelectedPlace(null); setPolylinePath([]); setCoursePolylinePath([]); setNavInfo({ distance: 0, duration: 0, toll: 0 }); }} className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center"><ArrowLeft size={16} className="text-white" /></button>
              )}
              <span className="flex-1 text-[10px] font-black italic text-nike-volt uppercase tracking-widest truncate">{selectedPlace ? t('route_preview') : `${searchResults.length} ${t('nearby_places')}`}</span>
              <button onClick={() => { setSearchResults([]); setSelectedPlace(null); setDestination(""); setPolylinePath([]); setCoursePolylinePath([]); }} className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center"><X size={16} className="text-white" /></button>
           </div>
          )}

           <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
              {!selectedPlace || activeSearchField !== 'none' ? (
                searchResults.map((place, idx) => {
                  // 실시간 가격 데이터 엔진 (ID 기반 고정 데이터 생성)
                  const getPrice = () => {
                    const hash = place.id.split('').reduce((a: number, b: string) => (a + b.charCodeAt(0)), 0);
                    if (place.category_group_name === '주유소' || place.category_name.includes('주유소')) {
                      return `${(1580 + (hash % 140)).toLocaleString()}원`;
                    }
                    if (place.category_group_name === '음식점' || place.category_name.includes('음식점')) {
                      return `평균 ${(8500 + (hash % 120) * 100).toLocaleString()}원`;
                    }
                    if (place.category_group_name === '숙박' || place.category_name.includes('호텔')) {
                      return `${(65000 + (hash % 200) * 500).toLocaleString()}원~`;
                    }
                    return '정보 없음';
                  };

                  return (
                    <button 
                      key={idx} 
                      onClick={() => {
                        if (activeSearchField === 'start') {
                          selectStartPlace(place);
                        } else {
                          selectPlace(place);
                        }
                      }} 
                      className="w-full bg-white/5 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all border border-white/5 text-left group"
                    >
                      <div className="w-10 h-10 bg-nike-volt/10 rounded-xl flex items-center justify-center shrink-0"><MapPin className="text-nike-volt" size={20} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="text-sm font-black italic text-white uppercase truncate flex-1">{place.place_name}</div>
                          <div className="text-[10px] font-black text-nike-volt bg-nike-volt/10 px-2 py-0.5 rounded ml-2 shrink-0">{getPrice()}</div>
                        </div>
                        <div className="text-[10px] text-white/40 mt-1 truncate">{place.address_name}</div>
                      </div>
                      <ChevronRight className="text-white/20 group-hover:text-nike-volt transition-colors" size={16} />
                    </button>
                  );
                })
              ) : (
                <div className="space-y-6 animate-in fade-in zoom-in-95">

                  {/* Stacked Route Recommendations Options */}
                  <div className="space-y-3">
                    <div className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-1 text-left">추천 경로 안내 (Route Options)</div>
                    {[
                      {
                        id: 'CAR',
                        label: (() => {
                          const optVal = localStorage.getItem('moodrive_nav_route_option') || 'RECOMMEND';
                          if (optVal === 'SHORTEST') return '자동차 최단';
                          if (optVal === 'TOLL_FREE') return '자동차 무료';
                          return '자동차 추천';
                        })(),
                        icon: Car,
                        color: 'border-nike-volt bg-nike-volt/5 text-nike-volt',
                        activeBg: 'bg-nike-volt border-nike-volt text-black',
                        desc: (() => {
                          const optVal = localStorage.getItem('moodrive_nav_route_option') || 'RECOMMEND';
                          const toll = (routeOptions.CAR as any)?.toll ?? (navInfo as any).toll ?? 0;
                          const tollText = toll > 0 ? `통행료 ${toll.toLocaleString()}원` : '통행료 없음';
                          if (optVal === 'SHORTEST') return `거리 우선 실시간 탐색 • ${tollText}`;
                          if (optVal === 'TOLL_FREE') return `무료 도로 우선 탐색 • ${tollText}`;
                          return `실시간 최적 경로 탐색 • ${tollText}`;
                        })(),
                        route: routeOptions.CAR || { path: polylinePath, distance: navInfo.distance, duration: navInfo.duration, toll: (navInfo as any).toll }
                      },
                      {
                        id: 'BUS',
                        label: '지하철/대중교통 최적',
                        icon: Train,
                        color: 'border-sky-500 bg-sky-500/5 text-sky-400',
                        activeBg: 'bg-sky-500 border-sky-500 text-black',
                        desc: '교통 체증 없는 정시 정류장 이동',
                        route: routeOptions.BUS || { path: polylinePath, distance: navInfo.distance, duration: Math.ceil(navInfo.duration * 1.25) }
                      },
                      {
                        id: 'WALK',
                        label: '도보 산책로',
                        icon: PersonStanding,
                        color: 'border-emerald-500 bg-emerald-500/5 text-emerald-400',
                        activeBg: 'bg-emerald-500 border-emerald-500 text-black',
                        desc: '여유로운 산책길 및 칼로리 소비',
                        route: routeOptions.WALK || { path: polylinePath, distance: navInfo.distance, duration: Math.ceil(navInfo.distance * 12 + 2) }
                      }
                    ].map((opt) => {
                      const isActive = transportMode === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setTransportMode(opt.id as any);
                            if (opt.route.path.length > 0) {
                              setPolylinePath(opt.route.path);
                            } else {
                              getRoute(selectedPlace.y, selectedPlace.x, opt.id as any);
                            }
                            setNavInfo({ distance: opt.route.distance, duration: opt.route.duration, toll: (opt.route as any).toll || 0 });
                          }}
                          className={cn(
                            "w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.99]",
                            isActive 
                              ? opt.activeBg + " shadow-[0_0_12px_rgba(255,255,255,0.05)] font-black" 
                              : "border-white/5 bg-[#1a1a1a] text-white/50 hover:border-white/10"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                              isActive ? "bg-black/10 text-current" : "bg-white/5 text-white/40"
                            )}>
                              <opt.icon size={22} />
                            </div>
                            <div>
                              <div className={cn("text-xs font-black uppercase tracking-wider", isActive ? "text-current" : "text-white")}>
                                {opt.label}
                              </div>
                              <div className={cn("text-[9px] mt-0.5", isActive ? "text-black/60" : "text-white/30")}>
                                {opt.desc}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black italic">
                              {opt.route.duration} <span className="text-[9px]">MIN</span>
                            </div>
                            <div className={cn("text-[9px] font-bold mt-0.5", isActive ? "text-black/50" : "text-white/20")}>
                              {opt.route.distance.toFixed(1)} KM
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => {
                      const routeOption = localStorage.getItem('moodrive_nav_route_option') || 'RECOMMEND';
                      const tollMultiplier = routeOption === 'TOLL_FREE' ? 0 : (routeOption === 'SHORTEST' ? 0.7 : 1.0);

                      setHighwayItems([
                        { id: 'tg1', type: 'TG', name: '서울 요금소', distance: 2.4, info: tollMultiplier > 0 ? `통행료 ${Math.round(1800 * tollMultiplier).toLocaleString()}원` : '통행료 없음' },
                        { id: 'ra1', type: 'RA', name: '기흥 휴게소', distance: 12.5, info: '휘 1,595 | 경 1,395' },
                        { id: 'tg2', type: 'TG', name: '수원신갈 TG', distance: 21.0, info: tollMultiplier > 0 ? `통행료 ${Math.round(1200 * tollMultiplier).toLocaleString()}원` : '통행료 없음' },
                        { id: 'ra2', type: 'RA', name: '죽전 휴게소', distance: 32.4, info: '휘 1,580 | 경 1,380' }
                      ]);
                      setIsNavigating(true);
                      setSimSegment('TRANSIT');

                      if (transportMode === 'CAR') {
                        setIsSafetyDriveMode(true);
                      } else {
                        setIsSafetyDriveMode(false);
                      }

                      if (coursePolylinePath.length > 0) {
                        if (transportMode === 'WALK') {
                          voiceService.speak("추천 도보 산책 코스 안내를 시작합니다. 먼저 코스 시작점까지 안내합니다.");
                        } else {
                          voiceService.speak("추천 드라이브 코스 안내를 시작합니다. 먼저 코스 시작점까지 안내합니다.");
                        }
                      } else {
                        if (transportMode === 'WALK') {
                          voiceService.speak("목적지까지 도보 안내를 시작합니다. 보행 안전에 유의해 주세요.");
                        } else if (transportMode === 'BUS') {
                          voiceService.speak("대중교통 경로 안내를 시작합니다. 지하철 승하차 위치를 참고하세요.");
                        } else {
                          voiceService.speak("목적지까지 자동차 경로 안내를 시작합니다. 안전 운전하십시오.");
                        }
                      }
                    }} 
                    className={cn(
                      "w-full p-5 rounded-3xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.02]",
                      transportMode === 'WALK' ? "bg-emerald-500 text-black" :
                      transportMode === 'BUS' ? "bg-sky-500 text-black" : "bg-nike-volt text-black"
                    )}
                  >
                    <Stars className="text-black" size={24} /><span className="text-black font-black italic text-lg uppercase tracking-tighter">{t('pro_nav_start')}</span>
                  </button>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Selected Place Details Card for Safety Driving Mode */}
      {isSafetyDriveMode && selectedPlace && (
        <div className="absolute bottom-[148px] left-6 right-6 z-[70] bg-[#111111]/95 border border-white/10 rounded-2xl p-3 flex justify-between items-center shadow-2xl animate-in slide-in-from-bottom-2 duration-300 pointer-events-auto">
          <div className="flex-1 min-w-0 text-left pl-1">
            <h4 className="text-xs font-black text-white truncate">{selectedPlace.place_name}</h4>
            <p className="text-[9px] text-white/40 font-bold truncate mt-0.5">{selectedPlace.road_address_name || selectedPlace.address_name}</p>
          </div>
          <div className="flex items-center gap-2 ml-3 shrink-0">
            <button 
              onClick={() => {
                setIsSafetyDriveMode(false);
                selectPlace(selectedPlace);
              }}
              className="bg-nike-volt text-black px-3 py-1.5 rounded-xl text-[10px] font-black italic uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
            >
              <Navigation2 size={10} className="fill-black" />
              안내 시작
            </button>
            <button 
              onClick={() => setSelectedPlace(null)}
              className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {isNavigating && (
        <div className={cn(
          "absolute left-6 z-[70] w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl border-2 backdrop-blur-xl select-none",
          isSafetyDriveMode ? "bottom-[156px]" : "bottom-[248px]",
          (cameraDistance !== null && currentSpeed > cameraLimit)
            ? "bg-red-600/90 border-red-500 animate-pulse text-white"
            : "bg-[#111111]/90 border-white/15 text-white"
        )}>
          <span className="text-2xl font-black italic tracking-tighter leading-none mt-1">
            {currentSpeed}
          </span>
          <span className={cn(
            "text-[7px] font-black tracking-widest uppercase mt-1",
            (cameraDistance !== null && currentSpeed > cameraLimit) ? "text-white" : "text-white/40"
          )}>
            {(cameraDistance !== null && currentSpeed > cameraLimit) ? "SLOW" : "km/h"}
          </span>
        </div>
      )}

      {isNavigating && (
        <div className={cn(
          "absolute left-6 right-6 z-50 p-5 rounded-[32px] flex flex-col gap-3 animate-in slide-in-from-bottom-6 shadow-2xl border",
          isSafetyDriveMode ? "bottom-6" : "bottom-28",
          transportMode === 'WALK' ? "bg-[#052416] border-emerald-500/20 text-white" :
          transportMode === 'BUS' ? "bg-[#0b1b3d] border-sky-500/20 text-white" : "bg-nike-volt border-transparent text-black"
        )}>
          <div className="flex items-center">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shrink-0",
              transportMode === 'WALK' ? "bg-emerald-500 text-black" :
              transportMode === 'BUS' ? "bg-sky-500 text-black" : "bg-black text-nike-volt"
            )}>
              {transportMode === 'WALK' ? (
                <PersonStanding className="animate-bounce" size={24} />
              ) : transportMode === 'BUS' ? (
                <Train className="animate-pulse" size={24} />
              ) : (
                <Navigation2 className="animate-bounce" size={24} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn(
                "text-[9px] font-black uppercase tracking-widest mb-0.5 text-left",
                transportMode === 'CAR' ? "text-black/50" : "text-white/40"
              )}>
                {transportMode === 'WALK' ? 'WALKING TO' : transportMode === 'BUS' ? 'TRANSIT TO' : 'DRIVING TO'}
              </div>
              <div className={cn(
                "text-md font-black italic uppercase tracking-tighter leading-none text-left truncate",
                transportMode === 'CAR' ? "text-black" : "text-white"
              )}>
                {destination}
              </div>
            </div>
            <button 
              onClick={() => { 
                setIsNavigating(false); 
                setIsSafetyDriveMode(false); 
                setPolylinePath([]); 
                setCoursePolylinePath([]); 
                setSimSegment('NONE'); 
              }} 
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center ml-2",
                transportMode === 'CAR' ? "bg-black/10 text-black" : "bg-white/10 text-white"
              )}
            >
              <X size={20} />
            </button>
          </div>
          <div className={cn(
            "grid rounded-2xl px-4 py-2 border gap-2",
            (transportMode === 'CAR' && isOnHighway) ? "grid-cols-3 bg-black/5 border-black/5" : "grid-cols-2 bg-white/5 border-white/5"
          )}>
            <div className="flex flex-col text-left">
              <span className={cn("text-[8px] font-black uppercase", transportMode === 'CAR' ? "text-black/40" : "text-white/30")}>
                {transportMode === 'WALK' ? 'Remaining Steps' : 'Remaining Distance'}
              </span>
              <span className={cn("text-lg font-black italic leading-none mt-0.5", transportMode === 'CAR' ? "text-black" : "text-white")}>
                {(isSafetyDriveMode && destination === "안전운행 안내") ? '실시간 측정' : (transportMode === 'WALK' 
                  ? `${Math.round(navInfo.distance * 1350).toLocaleString()} steps` 
                  : `${navInfo.distance.toFixed(1)} KM`)}
              </span>
            </div>
            
            <div className={cn("flex flex-col text-left", transportMode === 'CAR' ? "border-l pl-3 border-black/10" : "border-l pl-3 border-white/10")}>
              <span className={cn("text-[8px] font-black uppercase", transportMode === 'CAR' ? "text-black/40" : "text-white/30")}>
                Remaining Time
              </span>
              <span className={cn("text-lg font-black italic leading-none mt-0.5", transportMode === 'CAR' ? "text-black" : "text-white")}>
                {(isSafetyDriveMode && destination === "안전운행 안내") ? '주행 중' : `${navInfo.duration} MIN`}
              </span>
            </div>

            {transportMode === 'CAR' && isOnHighway && (
              <div className="flex flex-col text-left border-l pl-3 border-black/10">
                <span className="text-[8px] font-black uppercase text-black/40">
                  Toll Fee
                </span>
                <span className="text-sm font-black italic mt-1 text-black">
                  {(isSafetyDriveMode && destination === "안전운행 안내") ? '실시간 수집' : (((navInfo as any).toll > 0 ? `${(navInfo as any).toll.toLocaleString()}원` : '무료'))}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
