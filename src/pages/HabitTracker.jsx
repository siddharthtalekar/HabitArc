import { useState, useMemo, useRef } from 'react';
import { Plus, X, TrendingUp, Lock, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import MonthSelector from '../components/MonthSelector';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  DEFAULT_HABITS, getMonthKey, getDaysInMonth, getDefaultMonthData,
} from '../utils/constants';

export default function HabitTracker() {
  const now = new Date();
  const todayDate = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  const [month, setMonth] = useState(todayMonth);
  const [year, setYear] = useState(todayYear);
  const monthKey = getMonthKey(year, month);
  const daysInMonth = getDaysInMonth(year, month);

  const [data, setData] = useLocalStorage(
    `habitarc_${monthKey}`,
    getDefaultMonthData(),
  );
  const [newHabit, setNewHabit] = useState('');
  const [tooltip, setTooltip] = useState(null);
  const tooltipTimer = useRef(null);

  const habits = data.habits.list;
  const habitData = data.habits.data;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isCurrentMonth = month === todayMonth && year === todayYear;
  const isPastMonth = year < todayYear || (year === todayYear && month < todayMonth);

  /* Day state: 'today' | 'past' | 'future' */
  const getDayState = (d) => {
    if (!isCurrentMonth) return isPastMonth ? 'past' : 'future';
    if (d === todayDate) return 'today';
    return d < todayDate ? 'past' : 'future';
  };

  /* Show floating tooltip near clicked cell */
  const showTooltip = (e, text) => {
    clearTimeout(tooltipTimer.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ x: rect.left + rect.width / 2, y: rect.top + window.scrollY - 10, text });
    tooltipTimer.current = setTimeout(() => setTooltip(null), 1600);
  };

  /* Toggle — only today is editable */
  const toggle = (habit, day, e) => {
    const state = getDayState(day);
    if (state === 'past') { showTooltip(e, '🔒 Past day — read only'); return; }
    if (state === 'future') { showTooltip(e, '⏳ Future day — not yet!'); return; }
    setData((prev) => {
      const hd = { ...prev.habits.data };
      const dayMap = { ...(hd[habit] || {}) };
      dayMap[day] = !dayMap[day];
      hd[habit] = dayMap;
      return { ...prev, habits: { ...prev.habits, data: hd } };
    });
  };

  /* Add / remove custom habits */
  const addHabit = () => {
    const name = newHabit.trim();
    if (!name || habits.length >= 12 || habits.includes(name)) return;
    setData((p) => ({
      ...p,
      habits: { ...p.habits, list: [...p.habits.list, name] },
    }));
    setNewHabit('');
  };

  const removeHabit = (habit) => {
    if (DEFAULT_HABITS.includes(habit)) return;
    setData((p) => {
      const list = p.habits.list.filter((h) => h !== habit);
      const d = { ...p.habits.data };
      delete d[habit];
      return { ...p, habits: { list, data: d } };
    });
  };

  /* Row completion % */
  const pct = (habit) => {
    const done = Object.values(habitData[habit] || {}).filter(Boolean).length;
    return Math.round((done / daysInMonth) * 100);
  };

  /* Bar chart */
  const barData = useMemo(
    () =>
      days.map((d) => ({
        day: d,
        count: habits.reduce((s, h) => s + (habitData[h]?.[d] ? 1 : 0), 0),
      })),
    [habitData, habits, days],
  );

  return (
    <div className="page">
      {/* Floating cell tooltip */}
      {tooltip && (
        <div className="cell-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.text}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Habit Tracker</h1>
          <p className="page-subtitle">Build consistency, one day at a time</p>
        </div>
        <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      {/* Legend */}
      <div className="grid-legend">
        <span className="legend-item">
          <span className="legend-dot legend-today" />Today (editable)
        </span>
        <span className="legend-item">
          <span className="legend-dot legend-done" />Completed
        </span>
        <span className="legend-item">
          <Lock size={11} />&nbsp;Past (locked)
        </span>
        <span className="legend-item">
          <Clock size={11} />&nbsp;Future (locked)
        </span>
      </div>

      {/* Grid */}
      <div className="card">
        <div className="habit-grid-wrapper">
          <table className="habit-grid">
            <thead>
              <tr>
                <th className="habit-name-col">Habit</th>
                {days.map((d) => {
                  const state = getDayState(d);
                  return (
                    <th key={d} className={`day-col day-col--${state}`}>
                      {state === 'past' && <Lock size={7} className="day-icon" />}
                      {state === 'future' && <Clock size={7} className="day-icon" />}
                      <span>{d}</span>
                    </th>
                  );
                })}
                <th className="stat-col">%</th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => (
                <tr key={habit}>
                  <td className="habit-name-cell">
                    <span className="habit-label">{habit}</span>
                    {!DEFAULT_HABITS.includes(habit) && (
                      <button
                        className="remove-habit-btn"
                        onClick={() => removeHabit(habit)}
                        aria-label={`Remove ${habit}`}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </td>
                  {days.map((d) => {
                    const state = getDayState(d);
                    const isActive = habitData[habit]?.[d];
                    return (
                      <td
                        key={d}
                        className={[
                          'habit-cell',
                          isActive ? 'active' : '',
                          `habit-cell--${state}`,
                        ].join(' ')}
                        onClick={(e) => toggle(habit, d, e)}
                      />
                    );
                  })}
                  <td className="stat-cell">
                    <span className="completion-badge">{pct(habit)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add custom habit */}
        {habits.length < 12 && (
          <div className="add-habit">
            <input
              id="new-habit"
              type="text"
              className="input"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
              placeholder="Add custom habit…"
            />
            <button className="btn btn-accent" onClick={addHabit}>
              <Plus size={18} /> Add
            </button>
          </div>
        )}
      </div>

      {/* Bar chart */}
      <div className="card">
        <h3 className="card-title">
          <TrendingUp size={20} />
          Daily Completion Count
        </h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="day" stroke="#888" fontSize={11} />
              <YAxis stroke="#888" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1E1E1E', border: '1px solid #2A2A2A', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#E2F163" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
