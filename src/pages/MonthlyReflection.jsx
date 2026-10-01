import { useState } from 'react';
import { Trophy, Lightbulb, ArrowUpCircle, Target } from 'lucide-react';
import MonthSelector from '../components/MonthSelector';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getMonthKey, getDefaultMonthData } from '../utils/constants';

const FIELDS = [
  {
    key: 'biggestWin',
    label: 'Biggest Win This Month',
    icon: Trophy,
    placeholder: 'What was your greatest achievement?',
  },
  {
    key: 'biggestLesson',
    label: 'Biggest Lesson',
    icon: Lightbulb,
    placeholder: 'What did you learn this month?',
  },
  {
    key: 'toImprove',
    label: 'What I Need To Improve',
    icon: ArrowUpCircle,
    placeholder: 'What areas need more work?',
  },
  {
    key: 'nextGoal',
    label: "Next Month's Goal",
    icon: Target,
    placeholder: 'What will you focus on next month?',
  },
];

export default function MonthlyReflection() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const monthKey = getMonthKey(year, month);

  const [data, setData] = useLocalStorage(
    `habitarc_${monthKey}`,
    getDefaultMonthData(),
  );

  const updateField = (key, value) =>
    setData((p) => ({
      ...p,
      reflection: { ...p.reflection, [key]: value },
    }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Monthly Reflection</h1>
          <p className="page-subtitle">
            Reflect on your progress and set intentions
          </p>
        </div>
        <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      <div className="reflection-grid">
        {FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key} className="card reflection-card">
            <h3 className="card-title">
              <Icon size={20} />
              {label}
            </h3>
            <textarea
              id={`reflection-${key}`}
              className="textarea reflection-textarea"
              rows={6}
              placeholder={placeholder}
              value={data.reflection[key] || ''}
              onChange={(e) => updateField(key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
