import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';

interface EventCardProps {
  title: string;
  time: string;
  location: string;
  assignedTo: string[];
  type?: string;
}

function EventCard({ title, time, location, assignedTo, type }: EventCardProps) {
  const getAvatarContent = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getAvatarStyle = (name: string) => {
    // Simple color assignment based on name
    const colors = ['#FF6B6B', '#6FA8DC', '#93C47D', '#F6B26B', '#A78BFA'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return { backgroundColor: colors[colorIndex], color: '#FFFFFF' };
  };

  const getTypeChipStyle = () => {
    if (!type) return null;
    
    const typeStyles = {
      'Practice': { backgroundColor: '#DBEAFE', color: '#1E40AF' },
      'Appointment': { backgroundColor: '#FEF3C7', color: '#92400E' },
      'Pickup': { backgroundColor: '#D1FAE5', color: '#065F46' },
    };
    
    return typeStyles[type as keyof typeof typeStyles] || { backgroundColor: '#F3F4F6', color: '#374151' };
  };

  const typeChipStyle = getTypeChipStyle();

  const renderAvatars = () => {
    const maxVisible = 3;
    const visibleAssignees = assignedTo.slice(0, maxVisible);
    const overflowCount = assignedTo.length - maxVisible;

    return (
      <View style={styles.avatarGroup}>
        {visibleAssignees.map((name, index) => {
          const avatarStyle = getAvatarStyle(name);
          return (
            <View 
              key={name} 
              style={[
                styles.avatar, 
                avatarStyle,
                index > 0 && styles.overlappingAvatar
              ]}
            >
              <Text style={[styles.avatarText, { color: avatarStyle.color }]}>
                {getAvatarContent(name)}
              </Text>
            </View>
          );
        })}
        {overflowCount > 0 && (
          <View style={[styles.avatar, styles.overflowAvatar, overflowCount > 0 && styles.overlappingAvatar]}>
            <Text style={styles.overflowText}>+{overflowCount}</Text>
          </View>
        )}
      </View>
    );
  };
  return (
    <View style={styles.eventCard}>
      <View style={styles.titleRow}>
        <Text style={styles.eventTitle}>{title}</Text>
        {type && (
          <View style={[styles.typeChip, typeChipStyle]}>
            <Text style={[styles.typeChipText, { color: typeChipStyle?.color }]}>
              {type}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.metaRow}>
        {renderAvatars()}
        <View style={styles.eventDetails}>
          <Text style={styles.eventMeta}>{time}</Text>
          <Text style={styles.eventMeta}>{location}</Text>
        </View>
      </View>
    </View>
  );
}

export default function CalendarScreen() {
  const [activeFilter, setActiveFilter] = useState('Today');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [selectedEventType, setSelectedEventType] = useState('');
  const [todayEvents, setTodayEvents] = useState([
    {
      title: 'Soccer Practice',
      time: '5:00pm',
      location: 'High School Field',
      assignedTo: ['Joey', 'Dad'],
      type: 'Practice',
    },
    {
      title: 'Grocery Pickup',
      time: '6:30pm',
      location: 'Market',
      assignedTo: ['Mom'],
      type: 'Pickup',
    },
  ]);

  const filterOptions = ['Today', 'This Week', 'Weekend', 'Next 2 Weeks'];

  const familyMembers = [
    { name: 'Sarah', color: '#FF6B6B' },
    { name: 'Mike', color: '#6FA8DC' },
    { name: 'Joey', color: '#93C47D' },
    { name: 'Lisa', color: '#F6B26B' },
  ];

  const tomorrowEvents = [
    {
      title: 'Parent-Teacher Meeting',
      time: '7:00pm',
      location: 'School',
      assignedTo: ['Mom', 'Dad', 'Joey', 'Lisa'],
      type: 'Meeting',
    },
  ];

  const handleAddEvent = () => {
    setShowAddModal(true);
  };

  const handleFilterPress = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleCancelEvent = () => {
    setShowAddModal(false);
    setNewEventTitle('');
    setNewEventLocation('');
    setSelectedParticipants([]);
    setSelectedEventType('');
  };

  const handleSaveEvent = () => {
    if (newEventTitle.trim()) {
      const newEvent = {
        title: newEventTitle,
        time: '12:00 PM', // Default time
        location: newEventLocation || 'TBD',
        assignedTo: selectedParticipants.length > 0 ? selectedParticipants : ['Me'],
        type: selectedEventType || undefined,
      };
      
      setTodayEvents([...todayEvents, newEvent]);
      handleCancelEvent(); // Reset form and close modal
    }
  };

  const toggleParticipant = (name: string) => {
    setSelectedParticipants(prev => 
      prev.includes(name) 
        ? prev.filter(p => p !== name)
        : [...prev, name]
    );
  };

  const getAvatarContent = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getAvatarStyle = (name: string) => {
    const colors = ['#FF6B6B', '#6FA8DC', '#93C47D', '#F6B26B', '#A78BFA'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return { backgroundColor: colors[colorIndex], color: '#FFFFFF' };
  };
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.filterBar}>
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                activeFilter === filter && styles.activeFilterPill
              ]}
              onPress={() => handleFilterPress(filter)}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter && styles.activeFilterText
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionTitle}>Today ({todayEvents.length})</Text>
          <View style={styles.eventsContainer}>
            {todayEvents.map((event, index) => (
              <EventCard
                key={index}
                title={event.title}
                time={event.time}
                location={event.location}
                assignedTo={event.assignedTo}
                type={event.type}
              />
            ))}
          </View>
        </View>

        {/* Tomorrow Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionTitle}>Tomorrow ({tomorrowEvents.length})</Text>
          <View style={styles.eventsContainer}>
            {tomorrowEvents.map((event, index) => (
              <EventCard
                key={index}
                title={event.title}
                time={event.time}
                location={event.location}
                assignedTo={event.assignedTo}
                type={event.type}
              />
            ))}
          </View>
        </View>

        {/* This Weekend Section */}
        <View style={styles.section}>
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionTitle}>This Weekend (3)</Text>
          <View style={styles.eventsContainer}>
            <Text style={styles.placeholderText}>🏖️ Nothing planned this weekend yet!</Text>
          </View>
        </View>
      </ScrollView>
      
      <TouchableOpacity style={styles.fab} onPress={handleAddEvent}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Add Event Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelEvent}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancelEvent}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>➕ Add Event</Text>
              <View style={styles.headerSpacer} />
            </View>
            
            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              {/* Event Title */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Event Title</Text>
                <TextInput
                  style={styles.textInput}
                  value={newEventTitle}
                  onChangeText={setNewEventTitle}
                  placeholder="What's happening?"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Date & Time */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date & Time</Text>
                <TouchableOpacity style={styles.dateButton}>
                  <Text style={styles.dateButtonText}>Today at 12:00 PM</Text>
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Location */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Location</Text>
                <TextInput
                  style={styles.textInput}
                  value={newEventLocation}
                  onChangeText={setNewEventLocation}
                  placeholder="📍 Location"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Participants */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Participants</Text>
                <View style={styles.participantRow}>
                  {familyMembers.map((member) => {
                    const avatarStyle = getAvatarStyle(member.name);
                    const isSelected = selectedParticipants.includes(member.name);
                    return (
                      <TouchableOpacity
                        key={member.name}
                        style={[
                          styles.participantAvatar,
                          avatarStyle,
                          isSelected && styles.selectedParticipant
                        ]}
                        onPress={() => toggleParticipant(member.name)}
                      >
                        <Text style={[styles.participantText, { color: avatarStyle.color }]}>
                          {getAvatarContent(member.name)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Type */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Type (Optional)</Text>
                <View style={styles.typeRow}>
                  {['Practice', 'Appointment', 'Celebration', 'Other'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeChip,
                        selectedEventType === type && styles.selectedTypeChip
                      ]}
                      onPress={() => setSelectedEventType(selectedEventType === type ? '' : type)}
                    >
                      <Text style={[
                        styles.typeChipText,
                        selectedEventType === type && styles.selectedTypeChipText
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEvent}>
                <Text style={styles.saveButtonText}>Save Event</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFE',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 16,
  },
  filterPill: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeFilterPill: {
    backgroundColor: '#FF6B6B',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  section: {
    marginTop: 16,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  eventsContainer: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  typeChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  typeChipText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  overlappingAvatar: {
    marginLeft: -8,
  },
  overflowAvatar: {
    backgroundColor: '#9CA3AF',
  },
  avatarText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  overflowText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  eventDetails: {
    alignItems: 'flex-end',
  },
  eventMeta: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cancelButton: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 50,
  },
  modalForm: {
    flex: 1,
    paddingTop: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  dateButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  participantRow: {
    flexDirection: 'row',
    gap: 12,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedParticipant: {
    borderColor: '#1F2937',
  },
  participantText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  selectedTypeChip: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  typeChipText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  selectedTypeChipText: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});