import { useState, useMemo } from 'react';
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
import { Task } from '@/types/taskTypes';
import { useTasks } from '@/context/TasksContext';

export default function TasksScreen() {
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'Today' | 'This Week' | 'Weekend' | 'Next 2 Weeks'
  >('Today');

  const { state } = useTasks();
  const { openTasks, completedTasks } = state;

  const filterOptions = ['Today', 'This Week', 'Weekend', 'Next 2 Weeks'] as const;

  // TODO: add real filter logic later
  const visibleOpenTasks = useMemo(() => openTasks, [openTasks]);
  const visibleCompletedTasks = useMemo(() => completedTasks, [completedTasks]);

  const handleAddTask = () => {
    router.push('/(modals)/AddTaskModal' as any);
  };

  const handleTaskPress = (task: Task) => {
    router.push({
      pathname: '/(modals)/TaskDetailModal' as any,
      params: { id: task.id },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Filters */}
        <View style={styles.filterBar}>
          {filterOptions.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                style={[styles.filterPill, isActive && styles.activeFilterPill]}
                onPress={() => setActiveFilter(filter)}
                hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
              >
                <Text
                  style={[styles.filterText, isActive && styles.activeFilterText]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Open Tasks */}
        <View style={[styles.section, styles.sectionWithGap]}>
          <Text style={styles.sectionTitle}>
            🔓 Open Tasks ({visibleOpenTasks.length})
          </Text>

          {visibleOpenTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={20} color="#6B7280" />
              <Text style={styles.emptyText}>
                Nothing open. Tap + to add your first task.
              </Text>
            </View>
          ) : (
            <View style={styles.tasksContainer}>
              {visibleOpenTasks.map((task) => (
                <TaskCard
                  key={`open-${task.id}`} // 🔑 ensure unique key
                  {...task}
                  assignedTo={task.assignedTo ?? '?'}
                  onPress={() => handleTaskPress(task)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Completed Tasks */}
        <View style={[styles.section, styles.sectionWithGap]}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowCompleted((s) => !s)}
            accessibilityRole="button"
            accessibilityLabel="Toggle completed tasks"
          >
            <Text style={styles.sectionTitle}>
              ✅ Done Tasks ({visibleCompletedTasks.length})
            </Text>
            <Ionicons
              name={showCompleted ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {showCompleted &&
            (visibleCompletedTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="checkmark-done-outline"
                  size={20}
                  color="#6B7280"
                />
                <Text style={styles.emptyText}>No completed tasks yet.</Text>
              </View>
            ) : (
              <View style={styles.tasksContainer}>
                {visibleCompletedTasks.map((task) => (
                  <TaskCard
                    key={`done-${task.id}`} // 🔑 ensure unique key
                    {...task}
                    assignedTo={task.assignedTo ?? '?'}
                    isCompleted
                    onPress={() => handleTaskPress(task)}
                  />
                ))}
              </View>
            ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddTask}
        accessibilityRole="button"
        accessibilityLabel="Add a new task"
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { flex: 1 },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 96, // keeps list clear of FAB
    paddingTop: 8,
    gap: 16,
  },

  // Filters
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  activeFilterPill: { backgroundColor: '#3B82F6' },
  filterText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  activeFilterText: { color: '#FFFFFF' },

  // Sections
  section: { marginBottom: 8 },
  sectionWithGap: { gap: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.2,
  },

  // Tasks
  tasksContainer: { gap: 8 },

  // Empty state
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  emptyText: { color: '#6B7280', fontSize: 14 },

  // FAB
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
    fontWeight: '800',
    lineHeight: 24,
  },
});
