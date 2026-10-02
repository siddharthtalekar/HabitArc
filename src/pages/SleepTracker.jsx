import { useState, useMemo, useRef } from 'react';
import { Moon, TrendingUp, Clock, BarChart3, Lock } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import MonthSelector from '../components/MonthSelector';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  getMonthKey, getDaysInMonth, getDefaultMonthData, SLEEP_HOURS, CHART_COLORS,
} from '../utils/constants';

const TIP = {
  background: '#1E1E1E',
  border: '1px solid #2A2A2A',
  borderRadius: 8,
  fontSize: 12,
};

export default function SleepTracker() {
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

  const [tooltip, setTooltip] = useState(null);
  const tooltipTimer = useRef(null);

  const sleepData = data.sleep;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isCurrentMonth = month === todayMonth && year === todayYear;
  const isPastMonth = year < todayYear || (year === todayYear && month < todayMonth);

  const getDayState = (d) => {
    if (!isCurrentMonth) return isPastMonth ? 'past' : 'future';
    if (d === todayDate) return 'today';
    return d < todayDate ? 'past' : 'future';
  };

  const showTooltip = (e, text) => {
    clearTimeout(tooltipTimer.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ x: rect.left + rect.width / 2, y: rect.top + window.scrollY - 10, text });
    tooltipTimer.current = setTimeout(() => setTooltip(null), 1600);
  };

  const setSleep = (day, hours, e) => {
    const state = getDayState(day);
    if (state === 'past') { showTooltip(e, '🔒 Past day — read only'); return; }
    if (state === 'future') { showTooltip(e, '⏳ Future day — not yet!'); return; }
    setData((prev) => {
      const s = { ...prev.sleep };
      if (s[day] === hours) delete s[day]; // toggle off
      else s[day] = hours;
      return { ...prev, sleep: s };
    });
  };

  /* Stats */
  const stats = useMemo(() => {
    const vals = Object.values(sleepData).filter((v) => typeof v === 'number');
    if (!vals.length) return { avg: '0', best: 0, worst: 0, tracked: 0 };
    return {
      avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
      best: Math.max(...vals),
      worst: Math.min(...vals),
      tracked: vals.length,
    };
  }, [sleepData]);

  /* Area chart */
  const areaData = useMemo(
    () => days.map((d) => ({ day: d, hours: sleepData[d] || 0 })),
    [sleepData, days],
  );

  /* Pie chart — distribution */
  const pieData = useMemo(() => {
    const dist = {};
    SLEEP_HOURS.forEach((h) => (dist[h] = 0));
    Object.values(sleepData).forEach((h) => {
      const key = h < 5 ? '<5' : h;
      if (dist[key] !== undefined) dist[key]++;
    });
    return SLEEP_HOURS.map((h) => ({
      name: h === '<5' ? '< 5 hrs' : `${h} hrs`,
      value: dist[h],
    })).filter((d) => d.value > 0);
  }, [sleepData]);

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
          <h1 className="page-title">Sleep Tracker</h1>
          <p className="page-subtitle">Monitor your nightly rest</p>
        </div>
        <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      {/* Stats row */}
      <div className="stats-row">
        {[
          { icon: Moon, val: stats.avg, label: 'Avg Hours' },
          { icon: TrendingUp, val: stats.best, label: 'Best Night' },
          { icon: Clock, val: stats.worst || '—', label: 'Worst Night' },
          { icon: BarChart3, val: stats.tracked, label: 'Days Tracked' },
        ].map(({ icon: Icon, val, label }) => (
          <div key={label} className="stat-card">
            <Icon size={20} className="stat-icon" />
            <div className="stat-value">{val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="grid-legend">
        <span className="legend-item">
          <span className="legend-dot legend-today" />Today (editable)
        </span>
        <span className="legend-item">
          <span className="legend-dot legend-done" />Logged
        </span>
        <span className="legend-item">
          <Lock size={11} />&nbsp;Past (locked)
        </span>
        <span className="legend-item">
          <Clock size={11} />&nbsp;Future (locked)
        </span>
      </div>

      {/* Sleep grid */}
      <div className="card">
        <h3 className="card-title"><Moon size={20} />Sleep Log</h3>
        <div className="habit-grid-wrapper">
          <table className="habit-grid sleep-grid">
            <thead>
              <tr>
                <th className="habit-name-col">Hours</th>
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
              </tr>
            </thead>
            <tbody>
              {SLEEP_HOURS.map((hour) => {
                const val = hour === '<5' ? 4 : hour;
                return (
                  <tr key={hour}>
                    <td className="habit-name-cell">
                      <span className="habit-label">
                        {hour === '<5' ? '< 5' : hour} hrs
                      </span>
                    </td>
                    {days.map((d) => {
                      const state = getDayState(d);
                      return (
                        <td
                          key={d}
                          className={[
                            'habit-cell',
                            sleepData[d] === val ? 'active' : '',
                            `habit-cell--${state}`,
                          ].join(' ')}
                          onClick={(e) => setSleep(d, val, e)}
                        />
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card">
          <h3 className="card-title"><TrendingUp size={20} />Sleep Trend</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E2F163" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#E2F163" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="day" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={11} domain={[0, 12]} />
                <Tooltip contentStyle={TIP} labelStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="hours" stroke="#E2F163" fill="url(#sleepGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title"><BarChart3 size={20} />Sleep Distribution</h3>
          <div className="chart-container">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TIP} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <Moon size={40} />
                <p>Log your sleep to see distribution</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
