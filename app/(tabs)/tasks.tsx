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
import { DecoratedTask } from '@/types/taskTypes';
import { useTasks } from '@/context/TasksContext';
import { useAuth } from '@/context/AuthContext';

export default function TasksScreen() {
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'Today' | 'This Week' | 'Weekend' | 'Next 2 Weeks' | 'Mine'
  >('Today');

  const { state, familyMembers } = useTasks();
  const { user } = useAuth();
  const { openTasks, completedTasks } = state;

  const filterOptions = ['Today', 'This Week', 'Weekend', 'Next 2 Weeks', 'Mine'] as const;

  // ✅ derive current familyMember id for "Mine"
  const currentMemberId = useMemo(() => {
    if (!user) return undefined;
    const entry = Object.values(familyMembers).find((m) => m.uid === user.uid);
    return entry?.id;
  }, [user, familyMembers]);

  const applyFilter = (tasks: DecoratedTask[]) => {
    const now = new Date();

    switch (activeFilter) {
      case 'Today':
        return tasks.filter((t) => t.isDueToday);
      case 'This Week': {
        const endOfWeek = new Date();
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
        return tasks.filter((t) => {
          if (!t.dueDate) return false;
          const due = new Date(t.dueDate);
          return due <= endOfWeek && due >= now;
        });
      }
      case 'Weekend': {
        // weekend = next Saturday + Sunday
        const day = now.getDay();
        const saturday = new Date(now);
        saturday.setDate(now.getDate() + ((6 - day + 7) % 7));
        saturday.setHours(0, 0, 0, 0);

        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);
        sunday.setHours(23, 59, 59, 999);

        return tasks.filter((t) => {
          if (!t.dueDate) return false;
          const due = new Date(t.dueDate);
          return due >= saturday && due <= sunday;
        });
      }
      case 'Next 2 Weeks': {
        const twoWeeks = new Date();
        twoWeeks.setDate(now.getDate() + 14);
        return tasks.filter((t) => {
          if (!t.dueDate) return false;
          const due = new Date(t.dueDate);
          return due <= twoWeeks && due >= now;
        });
      }
      case 'Mine':
        return currentMemberId
          ? tasks.filter((t) => t.assignedTo === currentMemberId)
          : [];
      default:
        return tasks;
    }
  };

  const visibleOpenTasks = useMemo(
    () => applyFilter(openTasks),
    [openTasks, activeFilter, currentMemberId]
  );
  const visibleCompletedTasks = useMemo(
    () => applyFilter(completedTasks),
    [completedTasks, activeFilter, currentMemberId]
  );

  const handleAddTask = () => {
    router.push('/(modals)/AddTaskModal' as any);
  };

  const handleTaskPress = (task: DecoratedTask) => {
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
                No open tasks. Tap + to add one.
              </Text>
            </View>
          ) : (
            <View style={styles.tasksContainer}>
              {visibleOpenTasks.map((task) => (
                <TaskCard
                  key={`open-${task.id}`}
                  {...task}
                  familyMembers={familyMembers}
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
                    key={`done-${task.id}`}
                    {...task}
                    familyMembers={familyMembers}
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
    paddingBottom: 96,
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
