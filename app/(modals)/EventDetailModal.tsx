// app/(modals)/EventDetailModal.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEvents } from "@/context/EventsContext";
import { EventType } from "@/types/eventTypes";
import { Timestamp } from "firebase/firestore";

export default function EventDetailModal() {
  const { getEventById, updateEvent, deleteEvent } = useEvents();
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = id ? getEventById(id) : undefined;

  if (!event) {
    router.back();
    return null;
  }

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || "");
  const [location, setLocation] = useState(event.location || "");
  const [type, setType] = useState<EventType>(event.type || "Other");
  const [startTime, setStartTime] = useState(event.startTime.toDate());
  const [endTime, setEndTime] = useState(event.endTime.toDate());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("⚠️ Please enter a title");
      return;
    }

    await updateEvent(
      {
        title,
        description: description || undefined,
        location: location || undefined,
        type,
        startTime: Timestamp.fromDate(startTime),
        endTime: Timestamp.fromDate(endTime),
      },
      event.id
    );
    router.back();
  };

  const handleDelete = async () => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteEvent(event.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.modalCancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Event Details</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.modalSaveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalContent}>
        {/* Title */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter event title..."
          />
        </View>

        {/* Description */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, { height: 80 }]}
            multiline
            value={description}
            onChangeText={setDescription}
            placeholder="Enter details..."
          />
        </View>

        {/* Location */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Location</Text>
          <TextInput
            style={styles.textInput}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter location..."
          />
        </View>

        {/* Type */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Type</Text>
          <View style={styles.typeRow}>
            {(
              [
                "Practice",
                "Appointment",
                "Pickup",
                "Meeting",
                "Celebration",
                "Other",
              ] as EventType[]
            ).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeOption, type === t && styles.typeSelected]}
                onPress={() => setType(t)}
              >
                <Text
                  style={type === t ? styles.typeTextSelected : styles.typeText}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Start & End Time */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Start Time</Text>
          <TouchableOpacity onPress={() => setShowStartPicker(true)}>
            <Text style={styles.timeText}>{startTime.toLocaleString()}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startTime}
              mode="datetime"
              onChange={(_, d) => {
                setShowStartPicker(false);
                if (d) setStartTime(d);
              }}
            />
          )}
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>End Time</Text>
          <TouchableOpacity onPress={() => setShowEndPicker(true)}>
            <Text style={styles.timeText}>{endTime.toLocaleString()}</Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endTime}
              mode="datetime"
              onChange={(_, d) => {
                setShowEndPicker(false);
                if (d) setEndTime(d);
              }}
            />
          )}
        </View>
      </ScrollView>

      {/* Danger zone */}
      <View style={styles.deleteBar}>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete Event</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "#F9FAFB" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: { fontSize: 18, fontWeight: "600" },
  modalCancelText: { fontSize: 16, color: "#6B7280" },
  modalSaveText: { fontSize: 16, color: "#3B82F6" },
  modalContent: { padding: 16 },
  inputSection: { marginBottom: 16 },
  inputLabel: { fontSize: 16, fontWeight: "500", marginBottom: 6 },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#FFFFFF",
  },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    backgroundColor: "#F9FAFB",
  },
  typeSelected: { backgroundColor: "#3B82F6", borderColor: "#3B82F6" },
  typeText: { color: "#374151" },
  typeTextSelected: { color: "#FFFFFF" },
  timeText: { fontSize: 16, color: "#111827" },
  deleteBar: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  deleteText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
