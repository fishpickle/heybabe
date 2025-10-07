// app/(tabs)/index.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Header from "@/components/Header";
import { useEvents } from "@/context/EventsContext";
import { useTasks } from "@/context/TasksContext";

export default function HomeScreen() {
  const router = useRouter();
  const { state: eventState } = useEvents();
  const { state: taskState, familyMembers } = useTasks();

  // 📅 Today's date
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "short",
    day: "numeric",
  };
  const todayFormatted = today.toLocaleDateString("en-US", dateOptions);

  // ✅ Stats
  const todayEvents = eventState.events.filter((ev) => {
    const start = ev.startTime.toDate();
    return (
      start.getFullYear() === today.getFullYear() &&
      start.getMonth() === today.getMonth() &&
      start.getDate() === today.getDate()
    );
  });
  const todayStats = {
    events: todayEvents.length,
    openTasks: taskState.openTasks.length,
    alerts: 0, // Placeholder — could be derived from overdue tasks/events
  };

  // ⏩ Upcoming events (next 2)
  const upcomingEvents = [...eventState.events]
    .filter((ev) => ev.startTime.toDate() >= today)
    .slice(0, 2);

  // 👤 My open tasks (assigned to current user)
  // For now we don’t have per-user filtering in TasksContext, so just show first 2 open tasks
  const myOpenTasks = taskState.openTasks.slice(0, 2);

  // 🙌 Unclaimed tasks (no assignedTo)
  const unclaimedTasks = taskState.openTasks.filter((t) => !t.assignedTo || t.assignedTo.length === 0).slice(0, 1);

  // 🔔 Recent alert (placeholder → soonest upcoming event)
  const recentEvent = upcomingEvents[0];
  const recentAlert = recentEvent
    ? {
        message: `${recentEvent.title} starts at ${recentEvent.startTime.toDate().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })}`,
        timestamp: "soon",
      }
    : null;

  // Priority styles
  const getPriorityChipStyle = (priority: string) => {
    const styles = {
      high: { backgroundColor: "#FEE2E2", color: "#991B1B" },
      medium: { backgroundColor: "#FEF3C7", color: "#92400E" },
      low: { backgroundColor: "#DBEAFE", color: "#1E40AF" },
    };
    return styles[priority as keyof typeof styles] || styles.low;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>HeyBabe Dashboard</Text>
        <Text style={styles.subtitle}>Welcome to your family hub 💕</Text>

        <View style={styles.cardsContainer}>
          {/* ⭐ Snapshot Card */}
          <View style={styles.snapshotCard}>
            <View style={styles.snapshotHeader}>
              <Text style={styles.snapshotIcon}>⭐</Text>
              <Text style={styles.snapshotTitle}>It's {todayFormatted}</Text>
            </View>
            <Text style={styles.narrativeSummary}>
              {todayStats.events > 0
                ? `You’ve got ${todayStats.events} events today, plus ${todayStats.openTasks} open tasks.`
                : `Nothing on the schedule yet. Maybe time for a treat?`}
            </Text>
            <Text style={styles.snapshotStats}>
              {todayStats.events} events · {todayStats.openTasks} open tasks · {todayStats.alerts} alerts
            </Text>
          </View>

          {/* 📅 Upcoming Events */}
          <TouchableOpacity style={styles.card} onPress={() => router.push("/(tabs)/calendar")}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>📅 Upcoming Events</Text>
              <Text style={styles.ctaLink}>See all</Text>
            </View>
            {upcomingEvents.length > 0 ? (
              <View style={styles.itemsList}>
                {upcomingEvents.map((ev) => (
                  <View key={ev.id} style={styles.eventItem}>
                    <View style={styles.eventInfo}>
                      <Text style={styles.itemTitle}>{ev.title}</Text>
                      <Text style={styles.itemTime}>
                        {ev.startTime.toDate().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>📅 Nothing on the calendar — free time unlocked!</Text>
            )}
          </TouchableOpacity>

          {/* ✅ My Open Tasks */}
          <TouchableOpacity style={styles.card} onPress={() => router.push("/(tabs)/tasks")}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>✅ My Open Tasks</Text>
              <Text style={styles.ctaLink}>See all</Text>
            </View>
            {myOpenTasks.length > 0 ? (
              <View style={styles.itemsList}>
                {myOpenTasks.map((task) => {
                  const priorityStyle = getPriorityChipStyle(task.priority || "low");
                  return (
                    <View key={task.id} style={styles.taskItem}>
                      <View style={styles.taskInfo}>
                        <Text style={styles.itemTitle}>{task.title}</Text>
                      </View>
                      <View style={[styles.priorityChip, priorityStyle]}>
                        <Text style={[styles.priorityText, { color: priorityStyle.color }]}>
                          {task.priority || "low"}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.emptyText}>✅ You're all caught up!</Text>
            )}
          </TouchableOpacity>

          {/* 👐 Unclaimed Tasks */}
          <TouchableOpacity style={styles.card} onPress={() => router.push("/(tabs)/tasks")}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>👐 Unclaimed Tasks</Text>
              <Text style={styles.ctaLink}>See all</Text>
            </View>
            {unclaimedTasks.length > 0 ? (
              <View style={styles.itemsList}>
                {unclaimedTasks.map((task) => {
                  const priorityStyle = getPriorityChipStyle(task.priority || "low");
                  return (
                    <View key={task.id} style={styles.taskItem}>
                      <View style={styles.taskInfo}>
                        <Text style={styles.itemTitle}>{task.title}</Text>
                      </View>
                      <View style={[styles.priorityChip, priorityStyle]}>
                        <Text style={[styles.priorityText, { color: priorityStyle.color }]}>
                          {task.priority || "low"}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.emptyText}>👐 No unclaimed tasks right now!</Text>
            )}
          </TouchableOpacity>

          {/* 🔔 Recent Alert */}
          <TouchableOpacity style={styles.card} onPress={() => router.push("/(tabs)/notifications")}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>🔔 Recent Alert</Text>
              <Text style={styles.ctaLink}>See all</Text>
            </View>
            {recentAlert ? (
              <View style={styles.alertItem}>
                <Text style={styles.itemTitle}>{recentAlert.message}</Text>
                <Text style={styles.itemTime}>{recentAlert.timestamp}</Text>
              </View>
            ) : (
              <Text style={styles.emptyText}>🎉 No new alerts — all clear!</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFE" },
  content: { flex: 1, paddingHorizontal: 20, marginTop: 16 },
  title: { fontSize: 22, fontFamily: "Inter-Bold", color: "#FF6B6B" },
  subtitle: { fontSize: 16, fontFamily: "Inter-Regular", color: "#6B7280", marginTop: 4 },
  cardsContainer: { marginTop: 24, paddingBottom: 32 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  snapshotCard: {
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  snapshotHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  snapshotIcon: { fontSize: 20, marginRight: 8 },
  snapshotTitle: { fontSize: 18, fontFamily: "Inter-Bold", color: "#1F2937" },
  narrativeSummary: { fontSize: 16, fontFamily: "Inter-Regular", color: "#374151", lineHeight: 24, marginBottom: 16 },
  snapshotStats: { fontSize: 16, fontFamily: "Inter-SemiBold", color: "#374151", textAlign: "center", paddingVertical: 8 },

  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardTitle: { fontSize: 16, fontFamily: "Inter-Bold", color: "#1F2937" },
  ctaLink: { fontSize: 14, fontFamily: "Inter-SemiBold", color: "#3B82F6" },

  itemsList: { gap: 12 },
  eventItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  taskItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  alertItem: { gap: 4 },
  eventInfo: { flex: 1 },
  taskInfo: { flex: 1 },

  itemTitle: { fontSize: 16, fontFamily: "Inter-Bold", color: "#1F2937" },
  itemTime: { fontSize: 14, fontFamily: "Inter-Regular", color: "#6B7280", marginTop: 2 },

  avatarGroup: { flexDirection: "row", alignItems: "center" },
  smallAvatar: {
    width: 20, height: 20, borderRadius: 10,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "#FFFFFF",
  },
  overlappingAvatar: { marginLeft: -6 },
  overflowAvatar: { backgroundColor: "#6B7280" },
  smallAvatarText: { fontSize: 10, fontFamily: "Inter-Bold" },
  overflowText: { fontSize: 8, fontFamily: "Inter-Bold", color: "#FFFFFF" },

  priorityChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  priorityText: { fontSize: 12, fontFamily: "Inter-Bold" },
  emptyText: { fontSize: 14, fontFamily: "Inter-Regular", color: "#6B7280", fontStyle: "italic", textAlign: "center", paddingVertical: 12 },
});
