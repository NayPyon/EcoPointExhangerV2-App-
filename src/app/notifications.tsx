import { AnimatedPress } from "@/components/ui/animated-press";
import {
  BorderRadius,
  Colors,
  Semantic,
  Spacing,
  Typography
} from "@/constants/theme";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Linking,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SkeletonListItem } from "@/components/ui/skeleton";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";

// ── Types ──────────────────────────────────────────────
interface NotificationItem {
  id: string;
  user: string;
  title: string;
  desc: string;
  time: any;
  icon: string;
  color_type: string;
  unread: boolean;
  type: string;
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const getBgColor = () =>
    isDark ? Semantic.background.dark : Semantic.background.secondary;
  const getCardBg = () =>
    isDark ? Colors.obsidian[800] : Semantic.background.primary;
  const getTextColor = () =>
    isDark ? Semantic.text.light : Semantic.text.primary;
  const getMutedColor = () =>
    isDark ? Colors.obsidian[400] : Semantic.text.secondary;
  const getBorderColor = () =>
    isDark ? Colors.obsidian[800] : Semantic.border.light;

  const [notifications, setNotifications] = React.useState<NotificationItem[]>(
    [],
  );
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;

    try {
      const q = query(
        collection(db, "Users", user.uid, "Notifications"),
        orderBy("time", "desc"),
      );

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const data: NotificationItem[] = [];
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() } as NotificationItem);
          });
          setNotifications(data);
          setLoading(false);
        },
        (err) => {
          setErrorMsg(err.message);
          setLoading(false);
        },
      );

      return () => unsub();
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  }, []);

  const formatTime = (timestamp: any) => {
    if (!timestamp || typeof timestamp.toDate !== "function")
      return "Baru saja";
    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Baru saja";
      if (diffMins < 60) return `${diffMins} menit yang lalu`;
      if (diffHours < 24) return `${diffHours} jam yang lalu`;
      if (diffDays === 1) return "Kemarin";
      return `${diffDays} hari yang lalu`;
    } catch (e) {
      return "Baru saja";
    }
  };

  const getColorHex = (colorType: string) => {
    switch (colorType) {
      case "success":
        return Semantic.success.main;
      case "warning":
        return Semantic.warning.main;
      case "primary":
        return Semantic.primary.main;
      case "danger":
        return Semantic.danger.main;
      default:
        return Semantic.primary.main;
    }
  };

  const handlePress = async (item: NotificationItem) => {
    if (item.unread) {
      try {
        await updateDoc(doc(db, "Users", user!.uid, "Notifications", item.id), { unread: false });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: NotificationItem;
    index: number;
  }) => {
    const hexColor = getColorHex(item.color_type);
    return (
      <Animated.View entering={FadeInRight.delay(index * 80).duration(400)}>
        <AnimatedPress
          style={[styles.card, { backgroundColor: getCardBg() }]}
          haptic={false}
          onPress={() => handlePress(item)}
        >
          {/* Unread accent bar */}
          {item.unread && (
            <View style={[styles.unreadBar, { backgroundColor: hexColor }]} />
          )}

          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: isDark ? `${hexColor}20` : `${hexColor}15` },
            ]}
          >
            <FontAwesome name={item.icon as any} size={20} color={hexColor} />
          </View>

          {/* Content */}
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.title, { color: getTextColor() }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {item.unread && (
                <View
                  style={[styles.unreadDot, { backgroundColor: hexColor }]}
                />
              )}
            </View>
            <Text
              style={[styles.desc, { color: getMutedColor() }]}
            >
              {item.desc}
            </Text>
            <Text
              style={[
                styles.time,
                { color: isDark ? Colors.obsidian[500] : Semantic.text.muted },
              ]}
            >
              {formatTime(item.time)}
            </Text>
          </View>
        </AnimatedPress>
      </Animated.View>
    );
  };

  const renderEmpty = () => (
    <Animated.View
      entering={FadeInDown.delay(200).duration(400)}
      style={styles.emptyState}
    >
      <View
        style={[
          styles.emptyIconContainer,
          {
            backgroundColor: isDark
              ? Colors.obsidian[800]
              : Semantic.background.primary,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="bell-off-outline"
          size={48}
          color={getMutedColor()}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: getTextColor() }]}>
        Belum Ada Notifikasi
      </Text>
      <Text style={[styles.emptyDesc, { color: getMutedColor() }]}>
        Notifikasi tentang poin masuk, promo reward, dan status mesin akan
        muncul di sini.
      </Text>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: getBgColor() }]}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(300)}
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.sm,
            backgroundColor: getBgColor(),
            borderBottomColor: getBorderColor(),
          },
        ]}
      >
        <AnimatedPress
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              backgroundColor: isDark
                ? Colors.obsidian[800]
                : Semantic.background.primary,
            },
          ]}
        >
          <FontAwesome name="arrow-left" size={18} color={getTextColor()} />
        </AnimatedPress>
        <Text style={[styles.headerTitle, { color: getTextColor() }]}>
          Notifikasi
        </Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* List */}
      {errorMsg ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: Semantic.danger.main }]}>
            Terjadi Kesalahan
          </Text>
          <Text
            selectable
            style={[
              styles.emptyDesc,
              { color: getMutedColor(), paddingHorizontal: 20 },
            ]}
          >
            {errorMsg}
          </Text>
          {errorMsg.includes("https://console.firebase") && (
            <AnimatedPress
              style={[
                styles.backButton,
                {
                  width: "auto",
                  paddingHorizontal: 20,
                  marginTop: 20,
                  backgroundColor: Semantic.primary.main,
                },
              ]}
              onPress={() => {
                const urlMatch = errorMsg.match(/(https:\/\/[^\s]+)/);
                if (urlMatch) Linking.openURL(urlMatch[0]);
              }}
            >
              <Text
                style={{
                  color: "#FFF",
                  fontFamily: Typography.fontFamily.primary,
                }}
              >
                Buka Link Firebase
              </Text>
            </AnimatedPress>
          )}
        </View>
      ) : loading ? (
        <View style={styles.listContainer}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonListItem key={i} style={{ marginBottom: Spacing.md }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: 18,
  },
  listContainer: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  unreadBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: BorderRadius.xl,
    borderBottomLeftRadius: BorderRadius.xl,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: 15,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  desc: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: 13,
    marginTop: 2,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  time: {
    fontFamily: Typography.fontFamily.interMedium,
    fontSize: 11,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: 16,
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    fontFamily: Typography.fontFamily.inter,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
