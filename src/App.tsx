import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MobileLayout } from './layouts/MobileLayout';
import { Splash } from './screens/Splash';
import { Login } from './screens/Login';
import { MainMap } from './screens/MainMap';
import { RecommendedRoutes } from './screens/RecommendedRoutes';
import { AIAssistant } from './screens/AIAssistant';
import { Community } from './screens/Community';
import { CourseDetail } from './screens/CourseDetail';
import { CourseRegistration } from './screens/CourseRegistration';
import { Settings } from './screens/Settings';
import { Garage } from './screens/Garage';
import { DriveLog } from './screens/DriveLog';

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Auth flow without bottom nav */}
        <Route path="/" element={<Login />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        
        {/* App flow with bottom nav */}
        <Route path="/app" element={<MobileLayout />}>
          <Route path="map" element={<MainMap />} />
          <Route path="routes" element={<RecommendedRoutes />} />
          <Route path="ai" element={<AIAssistant />} />
          <Route path="community" element={<Community />} />
          <Route path="garage" element={<Garage />} />
          <Route path="logs" element={<DriveLog />} />
        </Route>
        
        {/* Sub-screens without bottom nav or with custom nav handling */}
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/course/new" element={<CourseRegistration />} />
        <Route path="/settings" element={<Settings />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
