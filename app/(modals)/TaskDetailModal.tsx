import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Task, TaskStatus, TaskPriority } from '@/types/taskTypes';
import { getAvatarStyle, getAvatarContent } from '@/utils/taskHelpers';
import { useTasks } from '@/context/TasksContext';

export default function TaskDetailModal() {
  const { updateTask, deleteTask, getTaskById } = useTasks();

  const params = useLocalSearchParams();
  const rawId = params?.id as string | string[] | undefined;
  const taskId = Array.isArray(rawId) ? rawId[0] : rawId;
  const task = taskId ? getTaskById(taskId) : undefined;

  useEffect(() => {
    if (!task) router.back();
  }, [task]);
  if (!task) return null;

  const [editTaskTitle, setEditTaskTitle] = useState(task.title);
  const [editTaskAssignee, setEditTaskAssignee] = useState(task.assignedTo || '?');
  const [editTaskPriority, setEditTaskPriority] = useState<TaskPriority>(task.priority);
  const [editRepeatEnabled, setEditRepeatEnabled] = useState(false);
  const [editRepeatOption, setEditRepeatOption] = useState('Daily');

  const isCompleted = task.status === 'completed';
  const isUnclaimed = task.status === 'unclaimed';

  const familyMembers = [
    { name: 'Sarah' },
    { name: 'Mike' },
    { name: 'Joey' },
    { name: 'Lisa' },
  ];

  const handleCancel = () => router.back();

  const buildUpdatedTask = (overrides?: Partial<Task>): Task => ({
    ...task,
    title: editTaskTitle.trim(),
    priority: editTaskPriority,
    assignedTo: editTaskAssignee === '?' ? undefined : editTaskAssignee,
    ...overrides,
  });

  const handleSave = () => {
    if (!editTaskTitle.trim()) return;
    updateTask(buildUpdatedTask(), task.id);
    router.back();
  };

  const handleActionCTA = () => {
    if (isCompleted) {
      // Reopen
      updateTask(buildUpdatedTask({ status: 'unclaimed', isCompleted: false }), task.id);
    } else if (isUnclaimed && !task.assignedTo) {
      // Claim
      updateTask(buildUpdatedTask({ status: 'claimed', assignedTo: 'Me' }), task.id);
    } else {
      // Mark complete
      updateTask(buildUpdatedTask({ status: 'completed', isCompleted: true }), task.id);
    }
    router.back();
  };

  const handleDelete = () => {
    deleteTask(task.id);
    router.back();
  };

  // Decide button label & flattened style
  let actionLabel = '';
  let actionStyle: any = { ...styles.primaryButton };

  if (isCompleted) {
    actionLabel = 'Reopen Task';
    actionStyle = { ...styles.primaryButton, ...styles.reopenButton };
  } else if (isUnclaimed && !task.assignedTo) {
    actionLabel = 'Claim Task';
    actionStyle = { ...styles.primaryButton, ...styles.claimButton };
  } else {
    actionLabel = 'Mark as Completed';
  }

  return (
    <SafeAreaView style={styles.modalContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Task Details</Text>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.modalContent}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 120 }}
            >
              {/* Title */}
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

              {/* Assignees */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Assign To</Text>
                <View style={styles.assigneeContainer}>
                  {familyMembers.map((member) => {
                    const avatar = getAvatarStyle(member.name);
                    const selected = editTaskAssignee === member.name;
                    return (
                      <TouchableOpacity
                        key={member.name}
                        style={[
                          styles.assigneeOption,
                          selected && styles.selectedAssigneeOption,
                        ]}
                        onPress={() => setEditTaskAssignee(member.name)}
                      >
                        <View
                          style={[
                            styles.assigneeAvatar,
                            { backgroundColor: avatar.backgroundColor },
                          ]}
                        >
                          <Text
                            style={[
                              styles.assigneeAvatarText,
                              { color: avatar.color },
                            ]}
                          >
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
                    <View
                      style={[
                        styles.assigneeAvatar,
                        { backgroundColor: getAvatarStyle('?').backgroundColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.assigneeAvatarText,
                          { color: getAvatarStyle('?').color },
                        ]}
                      >
                        {getAvatarContent('?')}
                      </Text>
                    </View>
                    <Text style={styles.assigneeName}>Unassigned</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Priority */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Priority</Text>
                <View style={styles.priorityContainer}>
                  {(['high', 'medium', 'low'] as TaskPriority[]).map(
                    (priority) => {
                      const selected = editTaskPriority === priority;
                      return (
                        <TouchableOpacity
                          key={priority}
                          style={[
                            styles.priorityOption,
                            selected && styles.selectedPriorityOption,
                          ]}
                          onPress={() => setEditTaskPriority(priority)}
                        >
                          <Text
                            style={[
                              styles.priorityOptionText,
                              selected && styles.priorityOptionTextSelected,
                            ]}
                          >
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>
              </View>

              {/* Repeat */}
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
                    {['Daily', 'Weekly', 'Monthly'].map((option) => {
                      const selected = editRepeatOption === option;
                      return (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.repeatOption,
                            selected && styles.selectedRepeatOption,
                          ]}
                          onPress={() => setEditRepeatOption(option)}
                        >
                          <Text
                            style={[
                              styles.repeatOptionText,
                              selected && styles.repeatOptionTextSelected,
                            ]}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Bottom action bar */}
            <View style={styles.actionBar}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity style={actionStyle} onPress={handleActionCTA}>
                <Text style={styles.primaryButtonText}>{actionLabel}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  modalCancelText: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  modalContent: { flex: 1, paddingHorizontal: 16 },

  inputSection: { marginVertical: 16 },
  inputLabel: { fontSize: 16, fontWeight: '500', color: '#1F2937', marginBottom: 8 },
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

  // Assignees
  assigneeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  selectedAssigneeOption: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  assigneeAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  assigneeAvatarText: { fontSize: 10, fontWeight: '700' },
  assigneeName: { fontSize: 14, color: '#1F2937', fontWeight: '500' },

  // Priority
  priorityContainer: { flexDirection: 'row', gap: 8 },
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
  selectedPriorityOption: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  priorityOptionText: { fontSize: 14, color: '#1F2937', fontWeight: '500' },
  priorityOptionTextSelected: { color: '#FFFFFF' },

  // Repeat
  repeatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  repeatOptions: { flexDirection: 'row', gap: 8, marginTop: 8 },
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
  selectedRepeatOption: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  repeatOptionText: { fontSize: 14, fontWeight: '500' },
  repeatOptionTextSelected: { color: '#FFFFFF' },

  // Bottom action bar
  actionBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  primaryButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  claimButton: { backgroundColor: '#6366F1' },
  reopenButton: { backgroundColor: '#F59E0B' },
  primaryButtonText: { fontSize: 16, color: '#FFFFFF', fontWeight: '600' },

  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
