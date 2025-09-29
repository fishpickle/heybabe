import { TaskStatus, TaskPriority } from '@/types/taskTypes';

export const getAvatarContent = (name?: string): string =>
  name ? name.charAt(0).toUpperCase() : '?';

export const getAvatarStyle = (name?: string): { backgroundColor: string; color: string } => {
  if (!name || name === '?') return { backgroundColor: '#E5E7EB', color: '#6B7280' };
  const colors = ['#FF6B6B', '#6FA8DC', '#93C47D', '#F6B26B', '#A78BFA'];
  const colorIndex = name.charCodeAt(0) % colors.length;
  return { backgroundColor: colors[colorIndex], color: '#FFFFFF' };
};

export const getStatusChipStyle = (status: TaskStatus): { backgroundColor: string; color: string } => {
  switch (status) {
    case 'unclaimed':
      return { backgroundColor: '#F6B26B', color: '#1F2937' };
    case 'claimed':
      return { backgroundColor: '#6FA8DC', color: '#1F2937' };
    case 'completed':
      return { backgroundColor: '#93C47D', color: '#FFFFFF' };
    default:
      return { backgroundColor: '#E5E7EB', color: '#6B7280' };
  }
};

export const getPriorityIcon = (priority: TaskPriority): { icon: string; color: string } => {
  switch (priority) {
    case 'high':
      return { icon: '↑↑', color: '#FF6B6B' };
    case 'medium':
      return { icon: '=', color: '#FFA500' };
    case 'low':
      return { icon: '↓↓', color: '#1E90FF' };
    default:
      return { icon: '=', color: '#6B7280' };
  }
};

export const handleToggleStatus = (
  status: TaskStatus,
  setStatus: (s: TaskStatus) => void
): void => {
  if (status === 'unclaimed') setStatus('claimed');
  else if (status === 'claimed') setStatus('unclaimed');
};
