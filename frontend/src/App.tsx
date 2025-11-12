import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import MeetingPageTeams from './pages/MeetingPageTeams';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/meeting" replace />} />
      <Route path="/meeting" element={<MeetingPageTeams />} />
      <Route path="/history" element={<MainLayout />}>
        <Route index element={<HistoryPage />} />
      </Route>
      <Route path="/settings" element={<MainLayout />}>
        <Route index element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
