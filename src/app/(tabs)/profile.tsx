import { Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E0E7FF' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#4338CA' }}>Profil Pengguna</Text>
    </View>
  );
}