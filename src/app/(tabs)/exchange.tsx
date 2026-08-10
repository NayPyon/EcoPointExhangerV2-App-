import { Text, View } from 'react-native';

export default function ExchangeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E0F2FE' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0369A1' }}>
        Halaman Tukar Sampah
      </Text>
      <Text style={{ fontSize: 16, marginTop: 10 }}>
        Nanti QR Code sesi akan muncul di sini.
      </Text>
    </View>
  );
}