// app/(modals)/AddEventModal.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useEvents } from "@/context/EventsContext";
import { EventType, EventCreate } from "@/types/eventTypes";
import { Timestamp } from "firebase/firestore";

export default function AddEventModal() {
  const { addEvent } = useEvents();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<EventType>("Other");
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(
    new Date(Date.now() + 60 * 60 * 1000)
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleCancel = () => router.back();

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a title for the event.");
      return;
    }

    if (endTime <= startTime) {
      Alert.alert("Invalid Time", "End time must be after the start time.");
      return;
    }

    const newEvent: EventCreate = {
      title,
      description: description || undefined,
      location: location || undefined,
      type,
      startTime: Timestamp.fromDate(startTime),
      endTime: Timestamp.fromDate(endTime),
      assignedTo: [], // reserved for future assignment
      recurrence: undefined,
      source: "manual",
      color: "#FF6B6B",
    };

    try {
      await addEvent(newEvent);
      router.back();
    } catch (err: any) {
      console.error("Error adding event:", err);
      Alert.alert("Error", "There was a problem saving your event.");
    }
  };

  return (
    <SafeAreaView style={styles.modalContainer}>
      {/* Header */}
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.modalCancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Add Event</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.modalSaveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
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

        {/* Start & End time */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Start Time</Text>
          <TouchableOpacity onPress={() => setShowStartPicker(true)}>
            <Text style={styles.timeText}>{startTime.toLocaleString()}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startTime}
              mode="datetime"
              onChange={(event, d) => {
                setShowStartPicker(false);
                if (event.type === "set" && d) {
                  setStartTime(d);
                }
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
              onChange={(event, d) => {
                setShowEndPicker(false);
                if (event.type === "set" && d) {
                  setEndTime(d);
                }
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "#F9FAFB" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: { fontSize: 18, fontWeight: "600" },
  modalCancelText: { fontSize: 16, color: "#6B7280" },
  modalSaveText: { fontSize: 16, color: "#3B82F6" },
  modalContent: { padding: 16 },
  inputSection: { marginVertical: 12 },
  inputLabel: { fontSize: 16, fontWeight: "500", marginBottom: 6 },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#FFFFFF",
  },
  typeRow: { flexDirection: "row", flexWrap: "wrap" },
  typeOption: {
    marginRight: 8,
    marginBottom: 8,
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
});
