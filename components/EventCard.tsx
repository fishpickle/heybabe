// components/EventCard.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { DecoratedEvent } from "@/context/EventsContext";
import { EventType } from "@/types/eventTypes";

interface EventCardProps {
  event: DecoratedEvent;
  onPress?: () => void;
}

export default function EventCard({ event, onPress }: EventCardProps) {
  const { title, location, assignedTo = [], type, startTime } = event;

  const getAvatarContent = (name: string) => name.charAt(0).toUpperCase();
  const getAvatarStyle = (name: string) => {
    const colors = ["#FF6B6B", "#6FA8DC", "#93C47D", "#F6B26B", "#A78BFA"];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return { backgroundColor: colors[colorIndex], color: "#FFFFFF" };
  };

  const typeStyles: Record<EventType, { backgroundColor: string; color: string }> = {
    Practice: { backgroundColor: "#DBEAFE", color: "#1E40AF" },
    Appointment: { backgroundColor: "#FEF3C7", color: "#92400E" },
    Pickup: { backgroundColor: "#D1FAE5", color: "#065F46" },
    Meeting: { backgroundColor: "#F3E8FF", color: "#6B21A8" },
    Celebration: { backgroundColor: "#FEE2E2", color: "#B91C1C" },
    Other: { backgroundColor: "#E5E7EB", color: "#374151" },
  };

  const chipStyle = type ? typeStyles[type] : null;

  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress}>
      <View style={styles.titleRow}>
        <Text style={styles.eventTitle}>{title}</Text>
        {type && chipStyle && (
          <View
            style={[styles.typeChip, { backgroundColor: chipStyle.backgroundColor }]}
          >
            <Text style={[styles.typeChipText, { color: chipStyle.color }]}>
              {type}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.avatarGroup}>
          {assignedTo.map((name, index) => {
            const avatarStyle = getAvatarStyle(name);
            return (
              <View
                key={`${name}-${index}`}
                style={[
                  styles.avatar,
                  { backgroundColor: avatarStyle.backgroundColor },
                  index > 0 && styles.overlappingAvatar,
                ]}
              >
                <Text style={[styles.avatarText, { color: avatarStyle.color }]}>
                  {getAvatarContent(name)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.eventDetails}>
          <Text style={styles.eventMeta}>
            {startTime ? startTime.toDate().toLocaleString() : "TBD"}
          </Text>
          {!!location && <Text style={styles.eventMeta}>{location}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  eventTitle: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  typeChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  typeChipText: { fontSize: 12, fontWeight: "600" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatarGroup: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  overlappingAvatar: { marginLeft: -8 },
  avatarText: { fontSize: 12, fontWeight: "700" },
  eventDetails: { alignItems: "flex-end" },
  eventMeta: { fontSize: 12, color: "#6B7280" },
});
