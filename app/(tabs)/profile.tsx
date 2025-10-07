import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebaseConfig';
import { doc, getDoc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [familyRole, setFamilyRole] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [defaultPriority, setDefaultPriority] = useState('Medium');
  const [loading, setLoading] = useState(true);

  // Redirect to login if user becomes null (after sign-out)
  useEffect(() => {
    if (user === null && !loading) {
      console.log("🚪 User signed out, redirecting to login");
      router.replace('/auth/login');
    }
  }, [user, loading]);

  const [familyId, setFamilyId] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);

  const colorOptions = ['#FF6B6B', '#6FA8DC', '#93C47D', '#F6B26B', '#A78BFA', '#F472B6'];

  const getAvatarContent = (name: string) => name.charAt(0).toUpperCase();

  // 🔥 Load profile & family join code
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Set default values for anonymous users
        if (user.isAnonymous) {
          setDisplayName('Guest User');
          setFamilyRole('Guest');
          setSelectedColor('#FF6B6B');
          setFamilyId(user.uid); // Use user ID as family ID for guests
          setJoinCode(user.uid); // Use user ID as join code for guests
          setLoading(false);
          return;
        }

        const profileRef = doc(db, 'users', user.uid, 'profile', 'main');
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          const data = snap.data();
          setDisplayName(data.displayName || '');
          setFamilyRole(data.familyRole || '');
          setSelectedColor(data.selectedColor || '#FF6B6B');
          setFamilyId(data.familyId || null);

          // fetch joinCode from families/{familyId}
          if (data.familyId) {
            const familyRef = doc(db, 'families', data.familyId);
            const famSnap = await getDoc(familyRef);
            if (famSnap.exists()) {
              setJoinCode(famSnap.data().joinCode || data.familyId);
            }
          }
        } else {
          // No profile exists, set defaults
          setDisplayName(user.email || 'New User');
          setFamilyRole('Member');
          setSelectedColor('#FF6B6B');
        }
      } catch (e) {
        console.error('Error loading profile:', e);
        // Set fallback values on error
        setDisplayName(user.email || 'User');
        setFamilyRole('Member');
        setSelectedColor('#FF6B6B');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // 🔥 Live subscription to family members
  useEffect(() => {
    if (!familyId) return;
    
    try {
      const membersRef = collection(db, 'families', familyId, 'members');
      const unsub = onSnapshot(membersRef, (snap) => {
        const members: any[] = [];
        snap.forEach((doc) => members.push({ id: doc.id, ...doc.data() }));
        setFamilyMembers(members);
      });
      return () => unsub();
    } catch (error) {
      console.error('Error subscribing to family members:', error);
      // For anonymous users, create a default member entry
      if (user?.isAnonymous) {
        setFamilyMembers([{
          id: user.uid,
          displayName: 'Guest User',
          role: 'Guest',
          color: '#FF6B6B'
        }]);
      }
    }
  }, [familyId, user]);

  // Save profile to Firestore
  const saveProfile = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'profile', 'main');
      await setDoc(
        docRef,
        {
          displayName,
          familyRole,
          selectedColor,
        },
        { merge: true }
      );
      Alert.alert('✅ Profile saved');
    } catch (e) {
      console.error('Error saving profile:', e);
      Alert.alert('⚠️ Failed to save profile');
    }
  };

  const copyJoinCode = async () => {
    if (joinCode) {
      await Clipboard.setStringAsync(joinCode);
      Alert.alert('📋 Copied!', 'Join code copied to clipboard');
    }
  };

  const handleSignOut = async () => {
    try {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              try {
                await signOut();
                // Small delay to ensure auth state is updated
                setTimeout(() => {
                  router.replace('/auth/login');
                }, 100);
              } catch (error) {
                console.error('Sign out error:', error);
                Alert.alert('Error', 'Failed to sign out. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const renderFamilyMember = (member: any) => (
    <View key={member.id} style={styles.familyMemberRow}>
      <View style={[styles.smallAvatar, { backgroundColor: member.color || '#6FA8DC' }]}>
        <Text style={styles.smallAvatarText}>{getAvatarContent(member.displayName || '?')}</Text>
      </View>
      <View style={styles.familyMemberInfo}>
        <Text style={styles.familyMemberName}>{member.displayName || 'Unnamed'}</Text>
        <Text style={styles.familyMemberRole}>{member.role || 'Member'}</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => Alert.alert('Not implemented', 'Remove coming soon')}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Text style={styles.profileHeading}>👤 Profile</Text>
        <View style={styles.profileHeader}>
          <TouchableOpacity style={[styles.largeAvatar, { backgroundColor: selectedColor }]}>
            <Text style={styles.largeAvatarText}>{getAvatarContent(displayName || 'U')}</Text>
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>✏️</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.displayName}>{displayName || 'Unnamed User'}</Text>
          <Text style={styles.tagline}>{familyRole || 'Family Member'}</Text>
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
                  style={[styles.roleButton, familyRole === role && styles.selectedRoleButton]}
                  onPress={() => setFamilyRole(role)}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      familyRole === role && styles.selectedRoleButtonText,
                    ]}
                  >
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
            <Text style={styles.saveButtonText}>💾 Save Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Family Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👪 Family Settings</Text>

          {/* Join Code */}
          {joinCode && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Family Join Code</Text>
              <View style={styles.joinCodeRow}>
                <Text style={styles.joinCodeValue}>{joinCode}</Text>
                <TouchableOpacity style={styles.copyButton} onPress={copyJoinCode}>
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Live Family Members */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Family Members</Text>
            <View style={styles.familyMembersList}>
              {familyMembers.length === 0 ? (
                <Text style={{ color: '#6B7280', fontSize: 14 }}>No members yet.</Text>
              ) : (
                familyMembers.map(renderFamilyMember)
              )}
            </View>
          </View>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ App Settings</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Info</Text>
            <View style={styles.accountInfo}>
              <Text style={styles.accountEmail}>{user?.email ?? 'Guest User'}</Text>
              <Text style={styles.accountMethod}>
                {user?.isAnonymous ? 'Anonymous' : 'Email/Password'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>🚪 Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFDFE' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  profileHeading: { fontSize: 18, fontFamily: 'Inter-Bold', color: '#1F2937', marginTop: 8, marginBottom: 16 },
  profileHeader: { alignItems: 'center', marginBottom: 32 },
  largeAvatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  largeAvatarText: { fontSize: 32, fontFamily: 'Inter-Bold', color: '#FFFFFF' },
  editBadge: { position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  editBadgeText: { fontSize: 12 },
  displayName: { fontSize: 18, fontFamily: 'Inter-Bold', color: '#1F2937', marginTop: 12 },
  tagline: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#6B7280', marginTop: 4 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter-Bold', color: '#1F2937', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#374151', marginBottom: 8 },
  textInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, fontFamily: 'Inter-Regular', color: '#1F2937', backgroundColor: '#FFFFFF' },
  roleSelector: { flexDirection: 'row', gap: 8 },
  roleButton: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#FFFFFF', alignItems: 'center' },
  selectedRoleButton: { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  roleButtonText: { fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#374151' },
  selectedRoleButtonText: { color: '#FFFFFF' },
  accountInfo: { paddingVertical: 8 },
  accountEmail: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#1F2937' },
  accountMethod: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#6B7280', marginTop: 2 },
  familyMembersList: { gap: 12 },
  familyMemberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  smallAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  smallAvatarText: { fontSize: 14, fontFamily: 'Inter-Bold', color: '#FFFFFF' },
  familyMemberInfo: { flex: 1 },
  familyMemberName: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#1F2937' },
  familyMemberRole: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#6B7280' },
  removeButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#FEE2E2' },
  removeButtonText: { fontSize: 12, fontFamily: 'Inter-SemiBold', color: '#DC2626' },
  joinCodeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  joinCodeValue: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#1F2937' },
  copyButton: { marginLeft: 12, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#6FA8DC' },
  copyButtonText: { color: '#fff', fontFamily: 'Inter-SemiBold' },
  saveButton: { marginTop: 8, paddingVertical: 12, borderRadius: 8, backgroundColor: '#6FA8DC', alignItems: 'center' },
  saveButtonText: { fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#FFFFFF' },
  signOutButton: { marginTop: 16, paddingVertical: 12, borderRadius: 8, backgroundColor: '#FEE2E2', alignItems: 'center' },
  signOutButtonText: { fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#DC2626' },
  bottomSpacing: { height: 32 },
});
