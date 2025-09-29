import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Task, TaskStatus, TaskPriority, SelectedTask } from '@/types/taskTypes';
import { getAvatarStyle, getAvatarContent, handleToggleStatus } from '@/utils/taskHelpers';
import { useTasks } from '@/context/TasksContext';

interface TaskDetailParams {
  id: string;
}

export default function TaskDetailModal() {
  const { updateTask, deleteTask, markCompleted, getTaskById, state } = useTasks();
  const params = useLocalSearchParams<TaskDetailParams>();
  
  // Get task by ID from context
  const task = getTaskById(params.id);
  
  if (!task) {
    // Task not found, go back
    router.back();
    return null;
  }
  
  // Determine if task is completed
  const isCompleted = state.completedTasks.some(t => t.id === task.id);

  const [editTaskTitle, setEditTaskTitle] = useState(task.title);
  const [editTaskStatus, setEditTaskStatus] = useState<TaskStatus>(task.status);
  const [editTaskAssignee, setEditTaskAssignee] = useState(task.assignedTo || '?');
  const [editTaskPriority, setEditTaskPriority] = useState<TaskPriority>(task.priority);
  const [editRepeatEnabled, setEditRepeatEnabled] = useState(false);
  const [editRepeatOption, setEditRepeatOption] = useState('Daily');

  const familyMembers = [
    { name: 'Sarah' },
    { name: 'Mike' },
    { name: 'Joey' },
    { name: 'Lisa' },
  ];

  const handleCancel = () => {
    router.back();
  };

  const handleSave = () => {
    if (!editTaskTitle.trim()) return;
    const updatedTask: Task = {
      ...task,
      title: editTaskTitle,
      status: editTaskStatus,
      priority: editTaskPriority,
      assignedTo: editTaskAssignee === '?' ? undefined : editTaskAssignee,
      isCompleted: editTaskStatus === 'completed',
    };
    updateTask(updatedTask, task.id);
    router.back();
  };

  const handleMarkCompleted = () => {
    const completedTask: Task = {
      ...task,
      title: editTaskTitle,
      status: 'completed',
      priority: editTaskPriority,
      assignedTo: editTaskAssignee === '?' ? undefined : editTaskAssignee,
      isCompleted: true,
    };
    markCompleted(completedTask, task.id);
    router.back();
  };

  const handleDelete = () => {
    deleteTask(task.id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.modalCancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Task Details</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.modalSaveText}>Save</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.modalContent}>
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Task Title</Text>
          <TextInput
            style={styles.textInput}
            value={editTaskTitle}
            onChangeText={setEditTaskTitle}
            placeholder="Enter task title..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Status</Text>
          <View style={styles.statusContainer}>
            {(['unclaimed', 'claimed', 'completed'] as TaskStatus[]).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  editTaskStatus === status && styles.selectedStatusOption,
                ]}
                onPress={() => {
                  if (status === 'completed') {
                    setEditTaskStatus(status);
                  } else {
                    handleToggleStatus(editTaskStatus, setEditTaskStatus);
                  }
                }}
              >
                <Text style={styles.statusOptionText}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Assign To</Text>
          <View style={styles.assigneeContainer}>
            {familyMembers.map((member) => {
              const avatarStyle = getAvatarStyle(member.name);
              return (
                <TouchableOpacity
                  key={member.name}
                  style={[
                    styles.assigneeOption,
                    editTaskAssignee === member.name && styles.selectedAssigneeOption,
                  ]}
                  onPress={() => setEditTaskAssignee(member.name)}
                >
                  <View style={[styles.assigneeAvatar, { backgroundColor: avatarStyle.backgroundColor }]}>
                    <Text style={[styles.assigneeAvatarText, { color: avatarStyle.color }]}>
                      {getAvatarContent(member.name)}
                    </Text>
                  </View>
                  <Text style={styles.assigneeName}>{member.name}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[
                styles.assigneeOption,
                editTaskAssignee === '?' && styles.selectedAssigneeOption,
              ]}
              onPress={() => setEditTaskAssignee('?')}
            >
              <View style={[styles.assigneeAvatar, { backgroundColor: getAvatarStyle('?').backgroundColor }]}>
                <Text style={[styles.assigneeAvatarText, { color: getAvatarStyle('?').color }]}>
                  {getAvatarContent('?')}
                </Text>
              </View>
              <Text style={styles.assigneeName}>Unassigned</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Priority</Text>
          <View style={styles.priorityContainer}>
            {(['high', 'medium', 'low'] as TaskPriority[]).map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.priorityOption,
                  editTaskPriority === priority && styles.selectedPriorityOption,
                ]}
                onPress={() => setEditTaskPriority(priority)}
              >
                <Text style={styles.priorityOptionText}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.repeatContainer}>
            <Text style={styles.inputLabel}>Repeat</Text>
            <Switch
              value={editRepeatEnabled}
              onValueChange={setEditRepeatEnabled}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={editRepeatEnabled ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>
          {editRepeatEnabled && (
            <View style={styles.repeatOptions}>
              {['Daily', 'Weekly', 'Monthly'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.repeatOption,
                    editRepeatOption === option && styles.selectedRepeatOption,
                  ]}
                  onPress={() => setEditRepeatOption(option)}
                >
                  <Text style={styles.repeatOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.completeButton} onPress={handleMarkCompleted}>
            <Text style={styles.completeButtonText}>Mark as Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Task</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  inputSection: {
    marginVertical: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    fontWeight: '400',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  selectedStatusOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  assigneeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  assigneeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedAssigneeOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  assigneeAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  assigneeAvatarText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  assigneeName: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  selectedPriorityOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  priorityOptionText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  repeatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  repeatOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  repeatOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  selectedRepeatOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  repeatOptionText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  actionButtons: {
    marginVertical: 24,
    gap: 12,
  },
  completeButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
