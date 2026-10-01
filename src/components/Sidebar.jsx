import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  Moon,
  Calendar,
  BookOpen,
  Flame,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/habits', label: 'Habits', icon: Target },
  { path: '/sleep', label: 'Sleep', icon: Moon },
  { path: '/weekly', label: 'Weekly', icon: Calendar },
  { path: '/reflection', label: 'Reflection', icon: BookOpen },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Flame size={28} className="brand-icon" />
        <div className="brand-text">
          <h1 className="brand-title">HABITARC</h1>
          <p className="brand-subtitle">Self-Improvement Tracker</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
