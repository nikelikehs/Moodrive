import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Loader2, Car, ArrowLeft } from 'lucide-react';

interface Make {
  Make_ID: number;
  Make_Name: string;
}

interface Model {
  Model_ID: number;
  Model_Name: string;
}

export const getCarDetails = (make: string, modelName: string) => {
  const normMake = make.toUpperCase();
  const normModel = modelName.toUpperCase();
  
  // Hash function to make specs deterministic
  const hash = modelName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Default values
  let price = "";
  let fuelEfficiency = "";
  let fuelType = "가솔린";
  let engineType = "I4 싱글터보";
  let displacement = "1,998 cc";
  let drivetrain = "전륜구동 (FF)";
  let transmission = "자동 8단";
  let power = "184 hp";
  let torque = "30.0 kg.m";
  let image = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80";

  // Match famous cars
  if (normModel.includes("AVANTE") || normModel.includes("ELANTRA")) {
    price = "1,975만 ~ 2,818만 원";
    fuelEfficiency = "10.5 ~ 15.4 km/ℓ";
    fuelType = "가솔린, LPi, 하이브리드";
    engineType = "I4 자연흡기";
    displacement = "1,598 cc";
    drivetrain = "전륜구동 (FF)";
    transmission = "CVT (무단변속기)";
    power = "123 hp";
    torque = "15.7 kg.m";
    image = "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80";
  } else if (normModel.includes("SONATA")) {
    price = "2,808만 ~ 3,917만 원";
    fuelEfficiency = "9.9 ~ 19.4 km/ℓ";
    fuelType = "가솔린, 하이브리드, LPi";
    engineType = "I4 싱글터보 / 하이브리드";
    displacement = "1,598 cc ~ 2,497 cc";
    drivetrain = "전륜구동 (FF)";
    transmission = "자동 8단";
    power = "160 ~ 290 hp";
    torque = "19.9 ~ 43.0 kg.m";
    image = "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=800&q=80";
  } else if (normModel.includes("GRANDEUR")) {
    price = "3,768만 ~ 5,344만 원";
    fuelEfficiency = "9.0 ~ 18.0 km/ℓ";
    fuelType = "가솔린, 하이브리드, LPi";
    engineType = "I4 싱글터보 / V6 자연흡기";
    displacement = "2,497 cc ~ 3,470 cc";
    drivetrain = "전륜구동 (FF) / AWD";
    transmission = "자동 8단";
    power = "198 ~ 300 hp";
    torque = "25.3 ~ 36.6 kg.m";
    image = "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80";
  } else if (normModel.includes("SANTA FE") || normModel.includes("SANTAFE")) {
    price = "3,546만 ~ 4,790만 원";
    fuelEfficiency = "9.7 ~ 15.5 km/ℓ";
    fuelType = "가솔린, 하이브리드";
    engineType = "I4 싱글터보 / 하이브리드";
    displacement = "1,598 cc ~ 2,497 cc";
    drivetrain = "전륜구동 (FF) / 풀타임 4륜구동 (AWD)";
    transmission = "DCT 8단 / 자동 6단";
    power = "180 ~ 281 hp";
    torque = "27.0 ~ 43.0 kg.m";
    image = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80";
  } else if (normModel.includes("SORENTO")) {
    price = "3,506만 ~ 4,831만 원";
    fuelEfficiency = "9.3 ~ 15.7 km/ℓ";
    fuelType = "가솔린, 디젤, 하이브리드";
    engineType = "I4 싱글터보 / 하이브리드";
    displacement = "1,598 cc ~ 2,497 cc";
    drivetrain = "전륜구동 (FF) / 풀타임 4륜구동 (AWD)";
    transmission = "DCT 8단 / 자동 6단";
    power = "194 ~ 281 hp";
    torque = "27.0 ~ 43.0 kg.m";
    image = "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80";
  } else if (normModel.includes("K5")) {
    price = "2,784만 ~ 3,954만 원";
    fuelEfficiency = "9.8 ~ 19.8 km/ℓ";
    fuelType = "가솔린, 하이브리드, LPi";
    engineType = "I4 싱글터보 / 자연흡기";
    displacement = "1,598 cc ~ 1,999 cc";
    drivetrain = "전륜구동 (FF)";
    transmission = "자동 8단 / 자동 6단";
    power = "146 ~ 180 hp";
    torque = "19.5 ~ 27.0 kg.m";
    image = "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80";
  } else if (normModel.includes("G80")) {
    price = "5,890만 ~ 8,860만 원";
    fuelEfficiency = "8.2 ~ 10.6 km/ℓ";
    fuelType = "가솔린";
    engineType = "I4 싱글터보 / V6 트윈터보";
    displacement = "2,497 cc ~ 3,470 cc";
    drivetrain = "후륜구동 (FR) / 풀타임 4륜구동 (AWD)";
    transmission = "자동 8단";
    power = "304 ~ 380 hp";
    torque = "43.0 ~ 54.0 kg.m";
    image = "https://images.unsplash.com/photo-1627454820516-dc7573617300?auto=format&fit=crop&w=800&q=80";
  } else if (normModel.includes("MODEL 3") || normModel.includes("MODEL3")) {
    price = "5,199만 ~ 6,799만 원";
    fuelEfficiency = "4.8 ~ 5.1 km/kWh";
    fuelType = "전기 (EV)";
    engineType = "듀얼 모터 (영구자석 동기모터)";
    displacement = "없음 (전기차)";
    drivetrain = "후륜구동 (RWD) / 풀타임 4륜구동 (AWD)";
    transmission = "1단 자동";
    power = "283 ~ 460 hp";
    torque = "35.7 ~ 67.3 kg.m";
    image = "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80";
  } else if (normModel.includes("MODEL Y") || normModel.includes("MODELY")) {
    price = "5,299만 ~ 7,199만 원";
    fuelEfficiency = "4.8 ~ 5.1 km/kWh";
    fuelType = "전기 (EV)";
    engineType = "듀얼 모터 (영구자석 동기모터)";
    displacement = "없음 (전기차)";
    drivetrain = "후륜구동 (RWD) / 풀타임 4륜구동 (AWD)";
    transmission = "1단 자동";
    power = "299 ~ 534 hp";
    torque = "35.7 ~ 67.3 kg.m";
    image = "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80";
  } else if (normModel.includes("911") || normModel.includes("CARRERA")) {
    price = "14,790만 ~ 24,780만 원";
    fuelEfficiency = "8.2 ~ 8.6 km/ℓ";
    fuelType = "가솔린";
    engineType = "F6 트윈터보";
    displacement = "2,981 cc ~ 3,745 cc";
    drivetrain = "후륜구동 (RR) / 풀타임 4륜구동 (AWD)";
    transmission = "PDK 8단 (듀얼클러치)";
    power = "392 ~ 662 hp";
    torque = "45.9 ~ 81.6 kg.m";
    image = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80";
  } else if (normMake.includes("BMW") && (normModel.startsWith("3") || normModel.includes("3 SERIES"))) {
    price = "5,530만 ~ 8,570만 원";
    fuelEfficiency = "9.9 ~ 15.0 km/ℓ";
    fuelType = "가솔린, 디젤, PHEV";
    engineType = "I4 싱글터보 / L6 트윈터보";
    displacement = "1,998 cc ~ 2,998 cc";
    drivetrain = "후륜구동 (FR) / 풀타임 4륜구동 (AWD)";
    transmission = "자동 8단";
    power = "184 ~ 387 hp";
    torque = "30.6 ~ 51.0 kg.m";
    image = "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80";
  } else if (normMake.includes("BMW") && (normModel.startsWith("5") || normModel.includes("5 SERIES"))) {
    price = "6,880만 ~ 10,260만 원";
    fuelEfficiency = "11.1 ~ 12.1 km/ℓ";
    fuelType = "가솔린, 디젤, 하이브리드";
    engineType = "I4 싱글터보 / L6 싱글터보";
    displacement = "1,998 cc ~ 2,998 cc";
    drivetrain = "후륜구동 (FR) / 풀타임 4륜구동 (AWD)";
    transmission = "자동 8단";
    power = "190 ~ 258 hp";
    torque = "31.6 ~ 40.8 kg.m";
    image = "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=800&q=80";
  } else {
    // Generate deterministic values based on brand and model name hash
    if (normMake.includes("TESLA") || normModel.includes("EV") || normModel.includes("ELECTRIC")) {
      fuelType = "전기 (EV)";
      price = `${(4500 + (hash % 80) * 100).toLocaleString()}만 ~ ${(8500 + (hash % 120) * 100).toLocaleString()}만 원`;
      fuelEfficiency = `${(4.2 + (hash % 15) * 0.1).toFixed(1)} km/kWh`;
      engineType = hash % 2 === 0 ? "싱글 모터 (영구자석 동기모터)" : "듀얼 모터 (AWD)";
      displacement = "없음 (전기차)";
      drivetrain = hash % 3 === 0 ? "후륜구동 (RWD)" : hash % 3 === 1 ? "전륜구동 (FWD)" : "풀타임 4륜구동 (AWD)";
      transmission = "1단 자동";
      power = `${200 + (hash % 30) * 10} hp`;
      torque = `${35 + (hash % 35)} kg.m`;
      image = "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80";
    } else {
      const isPremium = normMake.includes("FERRARI") || normMake.includes("LAMBORGHINI") || normMake.includes("PORSCHE") || hash % 10 === 0;
      fuelType = hash % 3 === 0 ? "가솔린, 하이브리드" : hash % 3 === 1 ? "가솔린, 디젤" : "가솔린";
      
      if (isPremium) {
        price = `${(12000 + (hash % 200) * 500).toLocaleString()}만 ~ ${(25000 + (hash % 150) * 1000).toLocaleString()}만 원`;
        fuelEfficiency = `${(7.2 + (hash % 20) * 0.1).toFixed(1)} km/ℓ`;
        engineType = hash % 2 === 0 ? "V6 트윈터보" : "V8 바이터보";
        displacement = `${2981 + (hash % 10) * 200} cc`;
        drivetrain = hash % 2 === 0 ? "후륜구동 (FR)" : "풀타임 4륜구동 (AWD)";
        transmission = "DCT 8단 / 자동 8단";
        power = `${380 + (hash % 40) * 10} hp`;
        torque = `${45 + (hash % 45)} kg.m`;
        
        const sportsCars = [
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80"
        ];
        image = sportsCars[hash % sportsCars.length];
      } else {
        price = `${(2300 + (hash % 40) * 100).toLocaleString()}만 ~ ${(3800 + (hash % 60) * 100).toLocaleString()}만 원`;
        fuelEfficiency = `${(10.2 + (hash % 40) * 0.1).toFixed(1)} km/ℓ`;
        engineType = hash % 2 === 0 ? "I4 싱글터보" : "I4 자연흡기";
        displacement = `${1598 + (hash % 4) * 400} cc`;
        drivetrain = hash % 3 === 0 ? "전륜구동 (FF)" : hash % 3 === 1 ? "후륜구동 (FR)" : "풀타임 4륜구동 (AWD)";
        transmission = "자동 8단 / DCT 7단";
        power = `${136 + (hash % 20) * 8} hp`;
        torque = `${16 + (hash % 25)} kg.m`;
        
        const passengerCars = [
          "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1494976388531-d10580905c51?auto=format&fit=crop&w=800&q=80"
        ];
        image = passengerCars[hash % passengerCars.length];
      }
    }
  }

  return { price, fuelEfficiency, fuelType, engineType, displacement, drivetrain, transmission, power, torque, image };
};

export const Garage: React.FC = () => {
  const [makes, setMakes] = useState<Make[]>([]);
  const [filteredMakes, setFilteredMakes] = useState<Make[]>([]);
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMakes();
  }, []);

  const fetchMakes = async () => {
    setLoading(true);
    try {
      const resp = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json');
      const data = await resp.json();
      const popular = ["BMW", "AUDI", "MERCEDES-BENZ", "HYUNDAI", "KIA", "GENESIS", "FERRARI", "LAMBORGHINI", "PORSCHE", "TESLA", "TOYOTA", "HONDA", "FORD", "CHEVROLET"];
      const sorted = data.Results.sort((a: Make, b: Make) => a.Make_Name.localeCompare(b.Make_Name));
      setMakes(sorted);
      setFilteredMakes(sorted.filter((m: Make) => popular.includes(m.Make_Name.toUpperCase())).slice(0, 50));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async (makeName: string) => {
    setLoading(true);
    setSelectedMake(makeName);
    setSelectedModel(null);
    try {
      const resp = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${makeName}?format=json`);
      const data = await resp.json();
      setModels(data.Results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    if (!val) {
      const popular = ["BMW", "AUDI", "MERCEDES-BENZ", "HYUNDAI", "KIA", "GENESIS", "FERRARI", "LAMBORGHINI", "PORSCHE", "TESLA", "TOYOTA", "HONDA", "FORD", "CHEVROLET"];
      setFilteredMakes(makes.filter((m: Make) => popular.includes(m.Make_Name.toUpperCase())).slice(0, 50));
      return;
    }
    const filtered = makes.filter(m => m.Make_Name.toLowerCase().includes(val.toLowerCase())).slice(0, 50);
    setFilteredMakes(filtered);
  };

  if (selectedModel) {
    const details = getCarDetails(selectedMake || "", selectedModel.Model_Name);
    return (
      <div className="w-full h-full flex flex-col bg-[#F5F5F7] text-black px-6 pt-10 pb-24 font-sans transition-colors duration-300">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <button 
            onClick={() => setSelectedModel(null)}
            className="w-10 h-10 bg-white border border-black/10 rounded-full flex items-center justify-center text-black hover:bg-black/5 transition-all active:scale-90"
          >
            <ArrowLeft size={20} className="text-black" />
          </button>
          <div className="flex flex-col items-end text-right">
            <span className="text-[10px] font-mono text-black/40 font-bold tracking-widest uppercase">Specification</span>
            <span className="text-xs font-bold text-black/60">#{selectedModel.Model_ID}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
          {/* Car Image Header */}
          <div className="relative w-full h-48 rounded-3xl overflow-hidden border border-black/10 group shadow-lg shrink-0">
            <img 
              src={details.image} 
              alt={selectedModel.Model_Name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 text-left">
              <span className="text-[9px] font-black uppercase text-white bg-black/40 border border-white/20 px-2 py-0.5 rounded">
                {selectedMake}
              </span>
              <h3 className="text-xl font-black italic text-white uppercase tracking-tighter mt-2 leading-none">
                {selectedModel.Model_Name}
              </h3>
            </div>
          </div>

          {/* Specs List Grid (Naver Car Search Style) */}
          <div className="space-y-3 text-left">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-black/50 border-b border-black/10 pb-2">제원 및 가격 정보</h4>
            
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: '가격 (Price)', value: details.price },
                { label: '구동 방식 (Drivetrain)', value: details.drivetrain },
                { label: '엔진 형식 (Engine)', value: details.engineType },
                { label: '배기량 (Displacement)', value: details.displacement },
                { label: '연료 (Fuel Type)', value: details.fuelType },
                { label: '연비 (Efficiency)', value: details.fuelEfficiency },
                { label: '변속기 (Transmission)', value: details.transmission },
                { label: '최고 출력 (Power)', value: details.power },
                { label: '최대 토크 (Torque)', value: details.torque }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-3.5 rounded-2xl border border-black/5 flex flex-col justify-between min-h-[66px] shadow-sm">
                  <span className="text-[8px] font-bold text-black/40 uppercase tracking-wider">{item.label}</span>
                  <span className="text-[11px] font-black text-black mt-1 leading-tight">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Drive Mode Vibe Suggestion */}
          <div className="bg-white border border-black/10 rounded-2xl p-5 text-left space-y-2 shadow-sm">
            <h5 className="text-[10px] font-black text-black uppercase tracking-wider">MooDrive Vibe 추천 코스</h5>
            <p className="text-xs font-bold text-black/70 leading-relaxed">
              {selectedMake} {selectedModel.Model_Name}의 {details.drivetrain} 및 {details.engineType} 파워트레인은 와인딩 드라이브에 뛰어난 퍼포먼스를 보여줍니다. 
              시원한 가속력과 견고한 트랙션을 체감해 볼 수 있는 <strong>청주 대청호반 드라이브 코스</strong>나 <strong>단양 보발재 고갯길</strong> 와인딩 드라이브 코스를 추천합니다!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#F5F5F7] text-black px-6 pt-10 pb-24 font-sans transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none" style={{ fontFamily: 'Hanken Grotesk' }}>
            {selectedMake ? selectedMake : "Garage"}
          </h2>
          <p className="text-black/40 font-mono text-[10px] mt-1 uppercase tracking-widest font-bold">
            {selectedMake ? "Models Discovery" : "Brand Catalog"}
          </p>
        </div>
        {!selectedMake ? (
           <Car className="text-black" size={32} />
        ) : (
          <button 
            onClick={() => { setSelectedMake(null); setSelectedModel(null); }}
            className="w-10 h-10 bg-white border border-black/10 rounded-full flex items-center justify-center text-black transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
      </div>

      {!selectedMake && (
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-black/40" />
          </div>
          <input 
            type="text"
            placeholder="Search brands..."
            className="w-full h-12 bg-white border border-black/10 rounded-xl px-12 text-sm focus:outline-none focus:border-black/30 transition-all font-bold text-black placeholder:text-black/30"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40">
            <Loader2 className="text-black animate-spin mb-2" size={32} />
            <p className="text-xs font-mono text-black/40 uppercase font-bold">Fetching data...</p>
          </div>
        ) : !selectedMake ? (
          filteredMakes.map((make) => (
            <button 
              key={make.Make_ID}
              onClick={() => fetchModels(make.Make_Name)}
              className="w-full h-16 bg-white border border-black/5 rounded-xl px-5 flex items-center justify-between hover:bg-black/5 transition-all group active:scale-[0.98] shadow-sm text-black"
            >
              <span className="text-sm font-black uppercase tracking-tight text-black transition-colors">
                {make.Make_Name}
              </span>
              <ChevronRight size={20} className="text-black/40 group-hover:text-black transition-colors" />
            </button>
          ))
        ) : (
          models.map((model) => (
            <button 
              key={model.Model_ID}
              onClick={() => setSelectedModel(model)}
              className="w-full p-5 bg-white border border-black/5 rounded-2xl flex flex-col text-left hover:border-black/20 transition-all active:scale-[0.98] group shadow-sm text-black"
            >
              <div className="flex items-center justify-between mb-2 w-full">
                <span className="text-[10px] font-mono text-black/40 font-bold tracking-widest uppercase">
                  Model
                </span>
                <span className="text-[10px] font-mono text-black/30">
                  #{model.Model_ID}
                </span>
              </div>
              <div className="flex justify-between items-center w-full">
                <h3 className="text-lg font-black italic tracking-tighter uppercase text-black transition-colors">
                  {model.Model_Name}
                </h3>
                <ChevronRight size={18} className="text-black/40 group-hover:text-black transition-all group-hover:translate-x-1" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
