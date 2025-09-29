import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/Header';
import TaskCard from '@/components/TaskCard';
import { Task, SelectedTask } from '@/types/taskTypes';
import { useTasks } from '@/context/TasksContext';

export default function TasksScreen() {
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Today');
  
  const { state } = useTasks();
  const { openTasks, completedTasks } = state;

  const filterOptions = ['Today', 'This Week', 'Weekend', 'Next 2 Weeks'];

  // Handlers
  const handleAddTask = () => {
    router.push('/(modals)/AddTaskModal' as any);
  };

  const handleTaskPress = (task: Task, index: number, isCompleted = false) => {
    router.push({
      pathname: '/(modals)/TaskDetailModal' as any,
      params: {
        id: task.id,
      }
    });
  };

  // These handlers are now handled by the context in the modals

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <View style={styles.filterBar}>
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterPill, activeFilter === filter && styles.activeFilterPill]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Open Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔓 Open Tasks ({openTasks.length})</Text>
          <View style={styles.tasksContainer}>
            {openTasks.map((task, i) => (
              <TaskCard key={`open-${i}`} {...task} onPress={() => handleTaskPress(task, i)} />
            ))}
          </View>
        </View>

        {/* Completed Tasks */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowCompleted(!showCompleted)}>
            <Text style={styles.sectionTitle}>✅ Done Tasks ({completedTasks.length})</Text>
            <Ionicons name={showCompleted ? 'chevron-up' : 'chevron-down'} size={20} color="#6B7280" />
          </TouchableOpacity>
          {showCompleted && (
            <View style={styles.tasksContainer}>
              {completedTasks.map((task, i) => (
                <TaskCard key={`completed-${i}`} {...task} isCompleted onPress={() => handleTaskPress(task, i, true)} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAddTask}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterBar: {
    flexDirection: 'row',
    marginVertical: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  activeFilterPill: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  tasksContainer: {
    gap: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  fabIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
