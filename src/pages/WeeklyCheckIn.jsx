import { useState, useMemo } from 'react';
import { TrendingUp, Trophy, Target } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import MonthSelector from '../components/MonthSelector';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getMonthKey, getDefaultMonthData } from '../utils/constants';

const WEEKS = [
  { key: '1', label: 'Week 1', days: '1 – 7' },
  { key: '2', label: 'Week 2', days: '8 – 14' },
  { key: '3', label: 'Week 3', days: '15 – 21' },
  { key: '4', label: 'Week 4', days: '22 – 28' },
];

export default function WeeklyCheckIn() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const monthKey = getMonthKey(year, month);

  const [data, setData] = useLocalStorage(
    `habitarc_${monthKey}`,
    getDefaultMonthData(),
  );

  const update = (wk, field, val) =>
    setData((p) => ({
      ...p,
      weekly: {
        ...p.weekly,
        [wk]: { ...p.weekly[wk], [field]: val },
      },
    }));

  const weightLine = useMemo(
    () =>
      WEEKS.map((w) => ({
        name: w.label,
        weight: data.weekly[w.key]?.weight
          ? parseFloat(data.weekly[w.key].weight)
          : null,
      })).filter((d) => d.weight !== null),
    [data.weekly],
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Weekly Check-In</h1>
          <p className="page-subtitle">
            Reflect on each week and track your weight
          </p>
        </div>
        <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      {/* Week cards */}
      <div className="week-grid">
        {WEEKS.map((w) => (
          <div key={w.key} className="card week-card">
            <div className="week-header">
              <h3>{w.label}</h3>
              <span className="week-days">Days {w.days}</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor={`weight-${w.key}`}>
                <TrendingUp size={16} /> Weight (kg)
              </label>
              <input
                id={`weight-${w.key}`}
                type="number"
                className="input"
                placeholder="e.g. 75"
                value={data.weekly[w.key]?.weight || ''}
                onChange={(e) => update(w.key, 'weight', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor={`wins-${w.key}`}>
                <Trophy size={16} /> Wins
              </label>
              <textarea
                id={`wins-${w.key}`}
                className="textarea"
                rows={3}
                placeholder="What did you achieve?"
                value={data.weekly[w.key]?.wins || ''}
                onChange={(e) => update(w.key, 'wins', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor={`focus-${w.key}`}>
                <Target size={16} /> Focus for Next Week
              </label>
              <textarea
                id={`focus-${w.key}`}
                className="textarea"
                rows={2}
                placeholder="What to focus on?"
                value={data.weekly[w.key]?.focus || ''}
                onChange={(e) => update(w.key, 'focus', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Weight chart */}
      {weightLine.length > 0 && (
        <div className="card">
          <h3 className="card-title">
            <TrendingUp size={20} /> Weight Progress
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={weightLine}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{ background: '#1E1E1E', border: '1px solid #2A2A2A', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="weight" stroke="#E2F163" strokeWidth={3} dot={{ fill: '#E2F163', r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
