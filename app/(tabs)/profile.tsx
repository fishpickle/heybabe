import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import Header from '@/components/Header';

export default function ProfileScreen() {
  const [displayName, setDisplayName] = useState('Sarah');
  const [familyRole, setFamilyRole] = useState('Mom');
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [defaultPriority, setDefaultPriority] = useState('Medium');

  const colorOptions = [
    '#FF6B6B', // Coral
    '#6FA8DC', // Blue
    '#93C47D', // Green
    '#F6B26B', // Orange
    '#A78BFA', // Purple
    '#F472B6', // Pink
  ];

  const familyMembers = [
    { name: 'Sarah', role: 'Mom', color: '#FF6B6B' },
    { name: 'Mike', role: 'Dad', color: '#6FA8DC' },
    { name: 'Joey', role: 'Kid', color: '#93C47D' },
    { name: 'Lisa', role: 'Kid', color: '#F6B26B' },
  ];

  const getAvatarContent = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const renderColorSwatch = (color: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.colorSwatch,
        { backgroundColor: color },
        selectedColor === color && styles.selectedColorSwatch
      ]}
      onPress={() => setSelectedColor(color)}
    >
      {selectedColor === color && (
        <Text style={styles.colorSwatchCheck}>✓</Text>
      )}
    </TouchableOpacity>
  );

  const renderFamilyMember = (member: typeof familyMembers[0], index: number) => (
    <View key={index} style={styles.familyMemberRow}>
      <View style={[styles.smallAvatar, { backgroundColor: member.color }]}>
        <Text style={styles.smallAvatarText}>{getAvatarContent(member.name)}</Text>
      </View>
      <View style={styles.familyMemberInfo}>
        <Text style={styles.familyMemberName}>{member.name}</Text>
        <Text style={styles.familyMemberRole}>{member.role}</Text>
      </View>
      <TouchableOpacity style={styles.removeButton}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Text style={styles.profileHeading}>👤 Profile</Text>
        <View style={styles.profileHeader}>
          <TouchableOpacity style={[styles.largeAvatar, { backgroundColor: selectedColor }]}>
            <Text style={styles.largeAvatarText}>{getAvatarContent(displayName)}</Text>
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>✏️</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.tagline}>Family Admin</Text>
        </View>

        {/* My Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Info</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              style={styles.textInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Family Role</Text>
            <View style={styles.roleSelector}>
              {['Mom', 'Dad', 'Kid', 'Other'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    familyRole === role && styles.selectedRoleButton
                  ]}
                  onPress={() => setFamilyRole(role)}
                >
                  <Text style={[
                    styles.roleButtonText,
                    familyRole === role && styles.selectedRoleButtonText
                  ]}>
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Family Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👪 Family Settings</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Family Members</Text>
            <View style={styles.familyMembersList}>
              {familyMembers.map(renderFamilyMember)}
              <TouchableOpacity style={styles.addMemberButton}>
                <Text style={styles.addMemberButtonText}>+ Add Family Member</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>🎨 Personal Color</Text>
            <View style={styles.colorPicker}>
              {colorOptions.map(renderColorSwatch)}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.inputLabel}>🔔 Notifications</Text>
                <Text style={styles.toggleSubtext}>Get alerts for tasks and events</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E5E7EB', true: '#FF6B6B' }}
                thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ App Settings</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Info</Text>
            <View style={styles.accountInfo}>
              <Text style={styles.accountEmail}>sarah@example.com</Text>
              <Text style={styles.accountMethod}>Google Sign-in</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📅 Calendar Integrations</Text>
            <View style={styles.integrationsList}>
              <TouchableOpacity style={styles.integrationButton}>
                <Text style={styles.integrationButtonText}>Connect Google Calendar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.integrationButton}>
                <Text style={styles.integrationButtonText}>Connect Outlook</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Task Defaults</Text>
            <View style={styles.prioritySelector}>
              {['Low', 'Medium', 'High'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    defaultPriority === priority && styles.selectedPriorityButton
                  ]}
                  onPress={() => setDefaultPriority(priority)}
                >
                  <Text style={[
                    styles.priorityButtonText,
                    defaultPriority === priority && styles.selectedPriorityButtonText
                  ]}>
                    {priority}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
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
  profileHeading: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  largeAvatarText: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  editBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editBadgeText: {
    fontSize: 12,
  },
  displayName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 12,
  },
  tagline: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
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
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  selectedRoleButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  roleButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  selectedRoleButtonText: {
    color: '#FFFFFF',
  },
  familyMembersList: {
    gap: 12,
  },
  familyMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  smallAvatarText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  familyMemberInfo: {
    flex: 1,
  },
  familyMemberName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  familyMemberRole: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  removeButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
  },
  addMemberButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
  },
  addMemberButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorSwatch: {
    borderColor: '#1F2937',
  },
  colorSwatchCheck: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  accountInfo: {
    paddingVertical: 8,
  },
  accountEmail: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  accountMethod: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  integrationsList: {
    gap: 8,
  },
  integrationButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  integrationButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  selectedPriorityButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  priorityButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  selectedPriorityButtonText: {
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 32,
  },
});