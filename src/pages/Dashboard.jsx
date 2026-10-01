import { useState, useMemo } from 'react';
import {
  Target, Moon, Flame, TrendingUp, CheckCircle2, Award,
  BarChart3, Activity,
} from 'lucide-react';
import {
  PieChart, Pie, Cell,
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import MonthSelector from '../components/MonthSelector';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  getMonthKey, getDaysInMonth, getDefaultMonthData, CHART_COLORS,
} from '../utils/constants';

const TIP = {
  background: '#1E1E1E',
  border: '1px solid #2A2A2A',
  borderRadius: 8,
  fontSize: 12,
};

export default function Dashboard() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const monthKey = getMonthKey(year, month);
  const daysInMonth = getDaysInMonth(year, month);

  const [data, setData] = useLocalStorage(
    `habitarc_${monthKey}`,
    getDefaultMonthData(),
  );

  const updateGoal = (v) => setData((p) => ({ ...p, mainGoal: v }));

  /* ---------- aggregated stats ---------- */
  const stats = useMemo(() => {
    const { habits, sleep } = data;
    let totalDone = 0;
    const totalPossible = habits.list.length * daysInMonth;

    habits.list.forEach((h) => {
      totalDone += Object.values(habits.data[h] || {}).filter(Boolean).length;
    });

    const sleepVals = Object.values(sleep).filter((v) => typeof v === 'number');
    const avgSleep =
      sleepVals.length > 0
        ? (sleepVals.reduce((a, b) => a + b, 0) / sleepVals.length).toFixed(1)
        : '0';

    const activeDays = new Set();
    habits.list.forEach((h) => {
      Object.entries(habits.data[h] || {}).forEach(([d, v]) => {
        if (v) activeDays.add(d);
      });
    });

    let best = 0;
    let cur = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (activeDays.has(String(d))) { cur++; best = Math.max(best, cur); }
      else cur = 0;
    }

    const rate = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
    return { totalDone, rate, avgSleep, active: activeDays.size, streak: best };
  }, [data, daysInMonth]);

  /* ---------- chart data ---------- */
  const donut = [
    { name: 'Done', value: stats.rate },
    { name: 'Left', value: 100 - stats.rate },
  ];

  const sleepChart = useMemo(
    () =>
      Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        hours: data.sleep[i + 1] || 0,
      })),
    [data.sleep, daysInMonth],
  );

  const habitRank = useMemo(
    () =>
      data.habits.list
        .map((h) => ({
          name: h.length > 18 ? h.slice(0, 18) + '…' : h,
          count: Object.values(data.habits.data[h] || {}).filter(Boolean).length,
        }))
        .sort((a, b) => b.count - a.count),
    [data.habits],
  );

  const weightLine = useMemo(() => {
    const labels = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];
    return labels
      .map((n, i) => ({
        name: n,
        weight: data.weekly[i + 1]?.weight
          ? parseFloat(data.weekly[i + 1].weight)
          : null,
      }))
      .filter((d) => d.weight !== null);
  }, [data.weekly]);

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your monthly overview at a glance</p>
        </div>
        <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      {/* Goal */}
      <div className="card goal-card">
        <div className="goal-label">
          <Target size={20} />
          <span>Main Goal</span>
        </div>
        <input
          id="main-goal"
          type="text"
          className="goal-input"
          placeholder="Set your main goal for this month…"
          value={data.mainGoal || ''}
          onChange={(e) => updateGoal(e.target.value)}
        />
      </div>

      {/* Stat cards */}
      <div className="stats-row">
        {[
          { icon: CheckCircle2, val: stats.totalDone, label: 'Habits Done' },
          { icon: Moon, val: `${stats.avgSleep}h`, label: 'Avg Sleep' },
          { icon: Activity, val: stats.active, label: 'Days Active' },
          { icon: Flame, val: stats.streak, label: 'Best Streak' },
        ].map(({ icon: Icon, val, label }) => (
          <div key={label} className="stat-card">
            <Icon size={20} className="stat-icon" />
            <div className="stat-value">{val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Row 1: Donut + Sleep */}
      <div className="charts-grid">
        <div className="card">
          <h3 className="card-title"><Award size={20} />Completion Rate</h3>
          <div className="chart-container donut-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={donut} cx="50%" cy="50%" innerRadius={70} outerRadius={95} startAngle={90} endAngle={-270} paddingAngle={2} dataKey="value">
                  <Cell fill="#E2F163" />
                  <Cell fill="#2A2A2A" />
                </Pie>
                <Tooltip contentStyle={TIP} />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <span className="donut-value">{stats.rate}%</span>
              <span className="donut-label">Complete</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title"><Moon size={20} />Sleep Trend</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={sleepChart}>
                <defs>
                  <linearGradient id="dSleep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="day" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={11} domain={[0, 12]} />
                <Tooltip contentStyle={TIP} labelStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="hours" stroke="#8B5CF6" fill="url(#dSleep)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Habits Ranking + Weight */}
      <div className="charts-grid">
        <div className="card">
          <h3 className="card-title"><BarChart3 size={20} />Habits Ranking</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={habitRank} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" horizontal={false} />
                <XAxis type="number" stroke="#888" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#888" fontSize={11} width={120} />
                <Tooltip contentStyle={TIP} labelStyle={{ color: '#fff' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {habitRank.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title"><TrendingUp size={20} />Weight Progress</h3>
          <div className="chart-container">
            {weightLine.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={weightLine}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis dataKey="name" stroke="#888" fontSize={11} />
                  <YAxis stroke="#888" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip contentStyle={TIP} labelStyle={{ color: '#fff' }} />
                  <Line type="monotone" dataKey="weight" stroke="#06B6D4" strokeWidth={3} dot={{ fill: '#06B6D4', r: 6 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <TrendingUp size={40} />
                <p>Log your weight in Weekly Check-In to see progress</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
