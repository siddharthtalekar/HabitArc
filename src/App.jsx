import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import HabitTracker from './pages/HabitTracker';
import SleepTracker from './pages/SleepTracker';
import WeeklyCheckIn from './pages/WeeklyCheckIn';
import MonthlyReflection from './pages/MonthlyReflection';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="habits" element={<HabitTracker />} />
          <Route path="sleep" element={<SleepTracker />} />
          <Route path="weekly" element={<WeeklyCheckIn />} />
          <Route path="reflection" element={<MonthlyReflection />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
