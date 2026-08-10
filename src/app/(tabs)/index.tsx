import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      {/* Header Hijau */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plastic Exchange</Text>
        <Text style={styles.headerSubtitle}>Recycle & Earn</Text>
      </View>

      {/* Card Info Saldo */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Real-time Weight</Text>
        <Text style={styles.weightText}>1.25 kg</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.cardLabel}>Total Reward</Text>
        <Text style={styles.coinText}>6,250 Coins</Text>
      </View>

      {/* Tombol Tukar */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Exchange Now →</Text>
      </TouchableOpacity>
    </View>
  );
}

// Kumpulan gaya (style) untuk mempercantik tampilan
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F4F6', // Latar belakang abu-abu terang
    alignItems: 'center' 
  },
  header: { 
    backgroundColor: '#10B981', // Warna hijau khas eco-friendly
    width: '100%', 
    paddingTop: 60,
    paddingBottom: 50, 
    alignItems: 'center', 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30 
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: 'white' 
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: '#D1FAE5', 
    marginTop: 5 
  },
  card: { 
    backgroundColor: 'white', 
    width: '85%', 
    padding: 30, 
    borderRadius: 20, 
    marginTop: -35, // Efek menumpuk di atas header
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    elevation: 5, 
    alignItems: 'center' 
  },
  cardLabel: { 
    fontSize: 14, 
    color: '#6B7280', 
    marginBottom: 5 
  },
  weightText: { 
    fontSize: 40, 
    fontWeight: 'bold', 
    color: '#111827' 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#E5E7EB', 
    width: '100%', 
    marginVertical: 20 
  },
  coinText: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#10B981' 
  },
  button: { 
    backgroundColor: '#10B981', 
    padding: 18, 
    borderRadius: 15, 
    width: '85%', 
    alignItems: 'center', 
    marginTop: 30 
  },
  buttonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});