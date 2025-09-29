import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import Header from '@/components/Header';

interface AlertCardProps {
  message: string;
  timestamp: string;
  contextTag: string;
  status: 'Unclaimed' | 'Reminder' | 'Completed' | 'Overdue';
  assignees: string[];
}

function AlertCard({ 
  message, 
  timestamp, 
  contextTag, 
  status, 
  assignees 
}: AlertCardProps) {
  const getStatusChipStyle = () => {
    const statusStyles = {
      'Unclaimed': { backgroundColor: '#FEF3C7', color: '#92400E' },
      'Reminder': { backgroundColor: '#DBEAFE', color: '#1E40AF' },
      'Completed': { backgroundColor: '#D1FAE5', color: '#065F46' },
      'Overdue': { backgroundColor: '#FEE2E2', color: '#991B1B' },
    };
    
    return statusStyles[status];
  };

  const getAvatarContent = (name: string) => {
    if (name === '?') return '?';
    return name.charAt(0).toUpperCase();
  };

  const getAvatarStyle = (name: string) => {
    if (name === '?') {
      return { backgroundColor: '#E5E7EB', color: '#6B7280' };
    }
    
    // Simple color assignment based on name
    const colors = ['#FF6B6B', '#6FA8DC', '#93C47D', '#F6B26B', '#A78BFA'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return { backgroundColor: colors[colorIndex], color: '#FFFFFF' };
  };

  const renderAvatars = () => {
    const maxVisible = 3;
    const visibleAssignees = assignees.slice(0, maxVisible);
    const overflowCount = assignees.length - maxVisible;

    return (
      <View style={styles.avatarGroup}>
        {visibleAssignees.map((assignee, index) => {
          const avatarStyle = getAvatarStyle(assignee);
          return (
            <View 
              key={index} 
              style={[
                styles.avatar, 
                avatarStyle,
                index > 0 && styles.overlappingAvatar
              ]}
            >
              <Text style={[styles.avatarText, { color: avatarStyle.color }]}>
                {getAvatarContent(assignee)}
              </Text>
            </View>
          );
        })}
        {overflowCount > 0 && (
          <View style={[styles.avatar, styles.overflowAvatar, styles.overlappingAvatar]}>
            <Text style={styles.overflowText}>+{overflowCount}</Text>
          </View>
        )}
      </View>
    );
  };

  const statusChipStyle = getStatusChipStyle();

  return (
    <View style={styles.alertCard}>
      <View style={styles.alertRow1}>
        {renderAvatars()}
        <View style={styles.alertContent}>
          <Text style={styles.alertMessage}>{message}</Text>
        </View>
        <View style={[styles.statusChip, statusChipStyle]}>
          <Text style={[styles.statusText, { color: statusChipStyle.color }]}>
            {status}
          </Text>
        </View>
      </View>
      <View style={styles.alertRow2}>
        <Text style={styles.timestamp}>{timestamp}</Text>
        <Text style={styles.contextTag}>{contextTag}</Text>
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filterOptions = ['All', 'Today', 'This Week', 'Missed'];

  const todayAlerts = [
    {
      message: 'Do the dishes is unclaimed, due Today 6pm',
      timestamp: 'Today 6pm',
      contextTag: 'Task • Do the dishes',
      status: 'Unclaimed' as const,
      assignees: ['?'],
    },
    {
      message: 'Soccer Practice starts in 30 minutes',
      timestamp: '5m ago',
      contextTag: 'Event • Soccer Practice',
      status: 'Reminder' as const,
      assignees: ['Joey'],
    },
  ];

  const earlierAlerts = [
    {
      message: 'Mom completed Grocery Pickup',
      timestamp: '2 days ago',
      contextTag: 'Task • Grocery Pickup',
      status: 'Completed' as const,
      assignees: ['Mom'],
    },
  ];

  const handleFilterPress = (filter: string) => {
    setActiveFilter(filter);
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

        {/* Today Alerts Section */}
        {todayAlerts.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>Today ({todayAlerts.length})</Text>
            <View style={styles.alertsContainer}>
              {todayAlerts.map((alert, index) => (
                <AlertCard
                  key={index}
                  message={alert.message}
                  timestamp={alert.timestamp}
                  contextTag={alert.contextTag}
                  status={alert.status}
                  assignees={alert.assignees}
                />
              ))}
            </View>
          </View>
        ) : null}

        {/* Earlier This Week Section */}
        {earlierAlerts.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>Earlier This Week ({earlierAlerts.length})</Text>
            <View style={styles.alertsContainer}>
              {earlierAlerts.map((alert, index) => (
                <AlertCard
                  key={index}
                  message={alert.message}
                  timestamp={alert.timestamp}
                  contextTag={alert.contextTag}
                  status={alert.status}
                  assignees={alert.assignees}
                />
              ))}
            </View>
          </View>
        ) : null}

        {/* Empty State */}
        {todayAlerts.length === 0 && earlierAlerts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              🎉 All caught up — nothing needs your attention right now.
            </Text>
          </View>
        )}
      </ScrollView>
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
  alertsContainer: {
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
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
    backgroundColor: '#6B7280',
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
  alertContent: {
    flex: 1,
    marginRight: 12,
  },
  alertMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  alertRow2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  contextTag: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});