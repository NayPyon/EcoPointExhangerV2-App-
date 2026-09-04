import { Semantic } from "@/constants/theme";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function NotificationsScreen() {
  const NOTIFICATIONS = [
    {
      id: "1",
      title: "Selamat Datang di EcoPoint!",
      desc: "Terima kasih sudah bergabung. Mari selamatkan bumi bersama-sama.",
      time: "Baru saja",
      icon: "leaf",
      color: Semantic.primary.main,
    },
    {
      id: "2",
      title: "Level Up Terbuka 🌟",
      desc: "Kumpulkan 1000 poin pertamamu untuk naik dari level Eco-Starter.",
      time: "2 jam yang lalu",
      icon: "star",
      color: Semantic.warning.main,
    },
  ];

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View
        style={[styles.iconContainer, { backgroundColor: item.color + "20" }]}
      >
        <FontAwesome name={item.icon} size={20} color={item.color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc}>{item.desc}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome
            name="arrow-left"
            size={20}
            color={Semantic.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifikasi</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Semantic.background.tertiary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: Semantic.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Semantic.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Semantic.background.tertiary,
  },
  headerTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: Semantic.text.primary,
  },
  listContainer: {
    padding: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: Semantic.background.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Semantic.text.primary,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: Semantic.text.primary,
    marginBottom: 4,
  },
  desc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Semantic.text.secondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  time: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Semantic.text.muted,
  },
});
