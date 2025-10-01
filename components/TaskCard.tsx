import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '@/types/taskTypes';
import {
  getAvatarStyle,
  getAvatarContent,
  getStatusChipStyle,
  getPriorityIcon,
} from '@/utils/taskHelpers';

interface TaskCardProps extends Task {
  onPress?: () => void;
}

export default function TaskCard({
  title,
  status,
  priority,
  assignedTo,
  dueDate,
  isOverdue = false,
  isDueToday = false,
  onPress,
}: TaskCardProps) {
  // Normalize completion
  const isCompleted = status === 'completed';

  // Normalize assignee for consistent avatar
  const assignee = assignedTo && assignedTo.trim() !== '' ? assignedTo : '?';
  const avatarStyle = getAvatarStyle(assignee);
  const avatarText = getAvatarContent(assignee);

  const statusStyle = getStatusChipStyle(status);
  const priorityInfo = getPriorityIcon(priority);

  const cardStyle = isCompleted
    ? [styles.taskCard, styles.completedCard]
    : styles.taskCard;
  const titleStyle = isCompleted
    ? [styles.taskTitle, styles.completedText]
    : styles.taskTitle;

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Task: ${title}. Status: ${status}. Priority: ${priority}`}
    >
      {/* Title & status row */}
      <View style={styles.titleRow}>
        <Ionicons
          name={isCompleted ? 'checkbox' : 'square-outline'}
          size={20}
          color={isCompleted ? '#93C47D' : '#6B7280'}
        />
        <Text style={[titleStyle, { flex: 1, marginLeft: 12 }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.statusChip, { backgroundColor: statusStyle.backgroundColor }]}>
          <Text style={[styles.statusText, { color: statusStyle.color }]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
        <Text style={[styles.priorityIcon, { color: priorityInfo.color, marginLeft: 8 }]}>
          {priorityInfo.icon}
        </Text>
      </View>

      {/* Meta row: assignee + due date */}
      <View style={styles.metaRow}>
        <View style={[styles.avatar, { backgroundColor: avatarStyle.backgroundColor }]}>
          <Text style={[styles.avatarText, { color: avatarStyle.color }]}>{avatarText}</Text>
        </View>

        {dueDate && (
          <View style={styles.dueDateContainer}>
            <Text style={styles.clockIcon}>⏰</Text>
            <Text
              style={{
                fontSize: 12,
                color: isOverdue || isDueToday ? '#FF6B6B' : '#6B7280',
                fontWeight: isOverdue || isDueToday ? '700' : '400',
              }}
            >
              {dueDate}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  completedCard: {
    opacity: 0.6,
  },

  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  taskTitle: { fontSize: 16, color: '#1F2937', fontWeight: '500' },
  completedText: { textDecorationLine: 'line-through', color: '#6B7280' },

  statusChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '500' },

  priorityIcon: { fontSize: 14, fontWeight: '700' },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '700' },

  dueDateContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clockIcon: { fontSize: 12 },
});
