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
import { router } from 'expo-router';
import { Task, TaskPriority } from '@/types/taskTypes';
import { getAvatarStyle, getAvatarContent } from '@/utils/taskHelpers';
import { useTasks } from '@/context/TasksContext';

export default function AddTaskModal() {
  const { addTask } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('?');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>('medium');
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatOption, setRepeatOption] = useState('Daily');

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
    if (!newTaskTitle.trim()) return;
    const newTask = {
      title: newTaskTitle,
      status: selectedAssignee === '?' ? 'unclaimed' : 'claimed',
      priority: selectedPriority,
      assignedTo: selectedAssignee === '?' ? undefined : selectedAssignee,
      dueDate: 'Today',
      isDueToday: true,
    };
    addTask(newTask);
    router.back();
  };

  return (
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.modalCancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Add Task</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.modalSaveText}>Save</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.modalContent}>
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Task Title</Text>
          <TextInput
            style={styles.textInput}
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            placeholder="Enter task title..."
            placeholderTextColor="#9CA3AF"
          />
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
                    selectedAssignee === member.name && styles.selectedAssigneeOption,
                  ]}
                  onPress={() => setSelectedAssignee(member.name)}
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
                selectedAssignee === '?' && styles.selectedAssigneeOption,
              ]}
              onPress={() => setSelectedAssignee('?')}
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
                  selectedPriority === priority && styles.selectedPriorityOption,
                ]}
                onPress={() => setSelectedPriority(priority)}
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
              value={repeatEnabled}
              onValueChange={setRepeatEnabled}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={repeatEnabled ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>
          {repeatEnabled && (
            <View style={styles.repeatOptions}>
              {['Daily', 'Weekly', 'Monthly'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.repeatOption,
                    repeatOption === option && styles.selectedRepeatOption,
                  ]}
                  onPress={() => setRepeatOption(option)}
                >
                  <Text style={styles.repeatOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
});
