import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTH_NAMES } from '../utils/constants';

export default function MonthSelector({ month, year, onChange }) {
  const handlePrev = () => {
    if (month === 0) onChange(11, year - 1);
    else onChange(month - 1, year);
  };

  const handleNext = () => {
    if (month === 11) onChange(0, year + 1);
    else onChange(month + 1, year);
  };

  return (
    <div className="month-selector">
      <button className="month-btn" onClick={handlePrev} aria-label="Previous month">
        <ChevronLeft size={20} />
      </button>
      <span className="month-label">
        {MONTH_NAMES[month]} {year}
      </span>
      <button className="month-btn" onClick={handleNext} aria-label="Next month">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
