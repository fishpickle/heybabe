// app/(tabs)/calendar.tsx
import { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Header from "@/components/Header";
import { useEvents, DecoratedEvent } from "@/context/EventsContext";
import EventCard from "@/components/EventCard";

type EventFilter = "All" | "Today" | "This Week" | "This Weekend";

export default function CalendarScreen() {
  const { state } = useEvents();
  const [activeFilter, setActiveFilter] = useState<EventFilter>("All");

  const filterOptions: EventFilter[] = ["All", "Today", "This Week", "This Weekend"];

  const applyFilter = (events: DecoratedEvent[]) => {
    const now = new Date();

    switch (activeFilter) {
      case "Today": {
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        return events.filter((e) => {
          const start = e.startTime.toDate();
          return start >= todayStart && start <= todayEnd;
        });
      }
      case "This Week": {
        const weekStart = new Date(now);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + (7 - weekStart.getDay())); // Sunday
        weekEnd.setHours(23, 59, 59, 999);
        return events.filter((e) => {
          const start = e.startTime.toDate();
          return start >= weekStart && start <= weekEnd;
        });
      }
      case "This Weekend": {
        const day = now.getDay();
        const saturday = new Date(now);
        saturday.setDate(now.getDate() + ((6 - day + 7) % 7));
        saturday.setHours(0, 0, 0, 0);

        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);
        sunday.setHours(23, 59, 59, 999);

        return events.filter((e) => {
          const start = e.startTime.toDate();
          return start >= saturday && start <= sunday;
        });
      }
      case "All":
      default:
        return events;
    }
  };

  // ✅ Filter then sort chronologically
  const visibleEvents = useMemo(() => {
    const filtered = applyFilter(state.events);
    return [...filtered].sort(
      (a, b) => a.startTime.toMillis() - b.startTime.toMillis()
    );
  }, [state.events, activeFilter]);

  const handleAddEvent = () => {
    router.push("/(modals)/AddEventModal" as any);
  };

  const handleEventPress = (id: string) => {
    router.push({ pathname: "/(modals)/EventDetailModal" as any, params: { id } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      {/* Filters */}
      <View style={styles.filterBar}>
        {filterOptions.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterPill, isActive && styles.activeFilterPill]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>
          {activeFilter} Events ({visibleEvents.length})
        </Text>

        <View style={styles.eventsContainer}>
          {visibleEvents.length === 0 ? (
            <Text style={styles.placeholderText}>📅 No events.</Text>
          ) : (
            <View>
              {visibleEvents.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  onPress={() => handleEventPress(ev.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAddEvent}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFE" },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  eventsContainer: { gap: 12 },

  placeholderText: { textAlign: "center", color: "#6B7280", marginVertical: 20 },

  // Filters
  filterBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  activeFilterPill: { backgroundColor: "#FF6B6B" },
  filterText: { fontSize: 14, color: "#374151", fontWeight: "500" },
  activeFilterText: { color: "#FFFFFF" },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  fabIcon: { color: "#FFFFFF", fontSize: 28, fontWeight: "bold" },
});
