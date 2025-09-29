import { View, Text, StyleSheet } from 'react-native';

export default function Header() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>HeyBabe</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: '#FDFDFE',
    paddingLeft: 16,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logo: {
    fontFamily: 'Pacifico-Regular',
    fontSize: 20,
    color: '#89CFF0',
  },
});