export const DEFAULT_HABITS = [
  'Workout / Exercise',
  '10,000 Steps',
  'Drink 3L Water',
  'No Junk Food',
  'Healthy Meals',
  'Read / Learn',
  'Meditate / Journal',
  'Wake Up Early',
  'Sleep On Time',
  'Be Productive',
];

export const SLEEP_HOURS = [10, 9, 8, 7, 6, 5, '<5'];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const CHART_COLORS = [
  '#E2F163', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899', '#10B981',
  '#F59E0B', '#6366F1', '#14B8A6', '#E11D48',
];

export const getMonthKey = (year, month) =>
  `${year}-${String(month + 1).padStart(2, '0')}`;

export const getDaysInMonth = (year, month) =>
  new Date(year, month + 1, 0).getDate();

export const getDefaultMonthData = () => ({
  mainGoal: '',
  habits: {
    list: [...DEFAULT_HABITS],
    data: {},
  },
  sleep: {},
  weekly: {
    1: { weight: '', wins: '', focus: '' },
    2: { weight: '', wins: '', focus: '' },
    3: { weight: '', wins: '', focus: '' },
    4: { weight: '', wins: '', focus: '' },
  },
  reflection: {
    biggestWin: '',
    biggestLesson: '',
    toImprove: '',
    nextGoal: '',
  },
});
