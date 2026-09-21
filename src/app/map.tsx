import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, useColorScheme, TouchableOpacity, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { VALO_LOGO_BASE64 } from "../constants/logoBase64";
import * as Location from "expo-location";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Feather } from "@expo/vector-icons";
import { Colors, Semantic } from "@/constants/theme";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

interface RVM {
  id: string;
  lokasi: string;
  latitude: number;
  longitude: number;
  status_mesin: string;
  kapasitas_plastik: number;
  kapasitas_logam: number;
}

export default function MapScreen() {
  const isDark = useColorScheme() === "dark";
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rvms, setRvms] = useState<RVM[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "RVM"), (snapshot) => {
      const data: RVM[] = [];
      snapshot.forEach((doc) => {
        const rvmData = doc.data();
        
        // Beri fallback lokasi acak di sekitar Jakarta/Depok jika mesin belum punya koordinat
        const lat = rvmData.latitude || (-6.37 + (Math.random() - 0.5) * 0.1);
        const lng = rvmData.longitude || (106.83 + (Math.random() - 0.5) * 0.1);

        data.push({
          id: doc.id,
          ...rvmData,
          latitude: lat,
          longitude: lng
        } as RVM);
      });
      setRvms(data);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? Colors.obsidian[900] : Colors.obsidian[50], justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Semantic.primary.main} />
        <Text style={{ marginTop: 10, color: isDark ? Semantic.text.light : Semantic.text.primary }}>Mencari lokasi Anda...</Text>
      </View>
    );
  }

  const mapCenterLat = location ? location.coords.latitude : -6.200000;
  const mapCenterLng = location ? location.coords.longitude : 106.816666;
  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; background-color: ${isDark ? "#1a1a1a" : "#ffffff"}; }
        #map { width: 100vw; height: 100vh; }
        
        /* CSS Trick untuk Dark Mode tanpa API Key pihak ke-3 */
        ${isDark ? `
        .leaflet-tile {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
        ` : ""}
        
        .custom-popup .leaflet-popup-content-wrapper {
          background: ${isDark ? "#2a2a2a" : "#ffffff"};
          color: ${isDark ? "#ffffff" : "#000000"};
          border-radius: 8px;
        }
        .custom-popup .leaflet-popup-tip {
          background: ${isDark ? "#2a2a2a" : "#ffffff"};
        }
        .leaflet-container a { color: ${isDark ? "#10b981" : "#059669"}; }
        .rvm-tooltip {
          background-color: ${isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)'};
          border: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          color: ${isDark ? '#fff' : '#000'};
          font-weight: bold;
          font-size: 11px;
          border-radius: 4px;
          padding: 2px 6px;
        }
        .rvm-tooltip::before { display: none; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${mapCenterLat}, ${mapCenterLng}], 13);
        
        L.tileLayer('${tileUrl}', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        ${location ? `
          var userIcon = L.divIcon({
            html: '<div style="background:#3b82f6;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>',
            className: '',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
          L.marker([${location.coords.latitude}, ${location.coords.longitude}], {icon: userIcon}).addTo(map).bindPopup("<b>Lokasi Anda</b>", {className: 'custom-popup'});
        ` : ""}

        var rvms = ${JSON.stringify(rvms)};
        
        var valoIcon = L.icon({
          iconUrl: '${VALO_LOGO_BASE64}',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -18]
        });

        rvms.forEach(function(rvm) {
          var color = rvm.status_mesin === 'aktif' ? '#10b981' : '#ef4444';
          var marker = L.marker([rvm.latitude, rvm.longitude], {
            icon: valoIcon
          }).addTo(map);

          var popupContent = "<b>VALO - " + rvm.lokasi + "</b><br/>" +
                             "<span style='font-size:12px;color:#666;'>" + (rvm.alamat ? rvm.alamat + "<br/>" : "") + "</span>" +
                             "<span style='color:" + color + "; font-weight:bold'>" + rvm.status_mesin.toUpperCase() + "</span><br/>" +
                             "Plastik: " + rvm.kapasitas_plastik + "%<br/>" +
                             "Logam: " + rvm.kapasitas_logam + "%";
                             
          marker.bindPopup(popupContent, {className: 'custom-popup'});
          marker.bindTooltip("VALO - " + rvm.lokasi, {
            permanent: true,
            direction: 'right',
            offset: [15, 0],
            className: 'rvm-tooltip'
          });
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.map}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: isDark ? Colors.obsidian[800] : "#FFF" }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={isDark ? Semantic.text.light : Semantic.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: width, height: height },
  header: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
});
