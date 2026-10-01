import { useState, useMemo } from 'react';
import { Plus, X, TrendingUp } from 'lucide-react';
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
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const monthKey = getMonthKey(year, month);
  const daysInMonth = getDaysInMonth(year, month);

  const [data, setData] = useLocalStorage(
    `habitarc_${monthKey}`,
    getDefaultMonthData(),
  );
  const [newHabit, setNewHabit] = useState('');

  const habits = data.habits.list;
  const habitData = data.habits.data;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  /* Toggle a single cell */
  const toggle = (habit, day) => {
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

  /* Bar chart — habits completed per day */
  const barData = useMemo(
    () =>
      days.map((d) => ({
        day: d,
        count: habits.reduce(
          (s, h) => s + (habitData[h]?.[d] ? 1 : 0),
          0,
        ),
      })),
    [habitData, habits, days],
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Habit Tracker</h1>
          <p className="page-subtitle">Build consistency, one day at a time</p>
        </div>
        <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      {/* Grid */}
      <div className="card">
        <div className="habit-grid-wrapper">
          <table className="habit-grid">
            <thead>
              <tr>
                <th className="habit-name-col">Habit</th>
                {days.map((d) => (
                  <th key={d} className="day-col">{d}</th>
                ))}
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
                  {days.map((d) => (
                    <td
                      key={d}
                      className={`habit-cell ${habitData[habit]?.[d] ? 'active' : ''}`}
                      onClick={() => toggle(habit, d)}
                    />
                  ))}
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
