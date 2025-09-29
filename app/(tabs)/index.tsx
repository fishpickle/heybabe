import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';

export default function HomeScreen() {
  const router = useRouter();

  // Get today's date
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  };
  const todayFormatted = today.toLocaleDateString('en-US', dateOptions);

  // Mock data - in real app this would come from state/API
  const todayStats = {
    events: 2,
    openTasks: 3,
    alerts: 1,
  };

  const upcomingEvents = [
    { title: 'Soccer Practice', time: '5:00pm', assignees: ['Joey', 'Dad'] },
    { title: 'Grocery Pickup', time: '6:30pm', assignees: ['Mom'] },
  ];

  const myOpenTasks = [
    { title: 'Do the dishes', dueTime: 'Today 6pm', priority: 'high' },
    { title: 'Walk the dog', dueTime: 'Daily 7am', priority: 'medium' },
  ];

  const unclaimedTasks = [
    { title: 'Take out trash', dueTime: 'Tomorrow 8am', priority: 'low' },
  ];

  const recentAlert = {
    message: 'Soccer Practice starts in 30 minutes',
    timestamp: '5m ago',
  };

  const getAvatarContent = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getAvatarStyle = (name: string) => {
    const colors = ['#FF6B6B', '#6FA8DC', '#93C47D', '#F6B26B', '#A78BFA'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return { backgroundColor: colors[colorIndex], color: '#FFFFFF' };
  };

  const getPriorityChipStyle = (priority: string) => {
    const styles = {
      'high': { backgroundColor: '#FEE2E2', color: '#991B1B' },
      'medium': { backgroundColor: '#FEF3C7', color: '#92400E' },
      'low': { backgroundColor: '#DBEAFE', color: '#1E40AF' },
    };
    return styles[priority as keyof typeof styles];
  };

  const renderAvatars = (assignees: string[]) => {
    const maxVisible = 2;
    const visibleAssignees = assignees.slice(0, maxVisible);
    const overflowCount = assignees.length - maxVisible;

    return (
      <View style={styles.avatarGroup}>
        {visibleAssignees.map((name, index) => {
          const avatarStyle = getAvatarStyle(name);
          return (
            <View 
              key={name} 
              style={[
                styles.smallAvatar, 
                avatarStyle,
                index > 0 && styles.overlappingAvatar
              ]}
            >
              <Text style={[styles.smallAvatarText, { color: avatarStyle.color }]}>
                {getAvatarContent(name)}
              </Text>
            </View>
          );
        })}
        {overflowCount > 0 && (
          <View style={[styles.smallAvatar, styles.overflowAvatar, styles.overlappingAvatar]}>
            <Text style={styles.overflowText}>+{overflowCount}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>HeyBabe Dashboard</Text>
        <Text style={styles.subtitle}>Welcome to your family hub 💕</Text>
        
        <View style={styles.cardsContainer}>
          {/* Today's Snapshot Card */}
          <View style={styles.snapshotCard}>
            <View style={styles.snapshotHeader}>
              <Text style={styles.snapshotIcon}>⭐</Text>
              <Text style={styles.snapshotTitle}>It's {todayFormatted}</Text>
            </View>
            <Text style={styles.narrativeSummary}>
              Looks like a busy day! Joey has soccer at 5, Mom's picking up groceries, and there are 3 open tasks waiting.
            </Text>
            <Text style={styles.snapshotStats}>
              {todayStats.events} events · {todayStats.openTasks} open tasks · {todayStats.alerts} alert
            </Text>
          </View>
          
          {/* Upcoming Events Card */}
          <TouchableOpacity style={styles.card} onPress={() => router.push('/calendar')}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>📅 Upcoming Events</Text>
              <Text style={styles.ctaLink}>See all</Text>
            </View>
            {upcomingEvents.length > 0 ? (
              <View style={styles.itemsList}>
                {upcomingEvents.slice(0, 2).map((event, index) => (
                  <View key={index} style={styles.eventItem}>
                    <View style={styles.eventInfo}>
                      <Text style={styles.itemTitle}>{event.title}</Text>
                      <Text style={styles.itemTime}>{event.time}</Text>
                    </View>
                    {renderAvatars(event.assignees)}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>📅 Nothing on the calendar today — free time unlocked!</Text>
            )}
          </TouchableOpacity>
          
          {/* My Open Tasks Card */}
          <TouchableOpacity style={styles.card} onPress={() => router.push('/tasks')}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>✅ My Open Tasks</Text>
              <Text style={styles.ctaLink}>See all</Text>
            </View>
            {myOpenTasks.length > 0 ? (
              <View style={styles.itemsList}>
                {myOpenTasks.slice(0, 2).map((task, index) => {
                  const priorityStyle = getPriorityChipStyle(task.priority);
                  return (
                    <View key={index} style={styles.taskItem}>
                      <View style={styles.taskInfo}>
                        <Text style={styles.itemTitle}>{task.title}</Text>
                        <Text style={styles.itemTime}>{task.dueTime}</Text>
                      </View>
                      <View style={[styles.priorityChip, priorityStyle]}>
                        <Text style={[styles.priorityText, { color: priorityStyle.color }]}>
                          {task.priority}
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
          
          {/* Unclaimed Tasks Card */}
          <TouchableOpacity style={styles.card} onPress={() => router.push('/tasks')}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>👐 Unclaimed Tasks</Text>
              <Text style={styles.ctaLink}>See all</Text>
            </View>
            {unclaimedTasks.length > 0 ? (
              <View style={styles.itemsList}>
                {unclaimedTasks.slice(0, 1).map((task, index) => {
                  const priorityStyle = getPriorityChipStyle(task.priority);
                  return (
                    <View key={index} style={styles.taskItem}>
                      <View style={styles.taskInfo}>
                        <Text style={styles.itemTitle}>{task.title}</Text>
                        <Text style={styles.itemTime}>{task.dueTime}</Text>
                      </View>
                      <View style={[styles.priorityChip, priorityStyle]}>
                        <Text style={[styles.priorityText, { color: priorityStyle.color }]}>
                          {task.priority}
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
          
          {/* Recent Alert Card */}
          <TouchableOpacity style={styles.card} onPress={() => router.push('/notifications')}>
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
  container: {
    flex: 1,
    backgroundColor: '#FDFDFE',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#FF6B6B',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  cardsContainer: {
    marginTop: 24,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  snapshotCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  snapshotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  snapshotIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  snapshotTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  narrativeSummary: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  snapshotStats: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    textAlign: 'center',
    paddingVertical: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  ctaLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
  itemsList: {
    gap: 12,
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertItem: {
    gap: 4,
  },
  eventInfo: {
    flex: 1,
  },
  taskInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  itemTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  overlappingAvatar: {
    marginLeft: -6,
  },
  overflowAvatar: {
    backgroundColor: '#6B7280',
  },
  smallAvatarText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  overflowText: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  priorityChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});