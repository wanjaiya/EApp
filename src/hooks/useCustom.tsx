import { useTheme } from '../context/ThemeContext';
import { colors } from '../constants/colors';

export const formatToDate = ({ date }) => {
  const date = new Date(dateStr.replace(' ', 'T'));
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};
