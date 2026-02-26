import { MY_IP } from '../../utils/apiKeys';
import { Ionicons } from "@expo/vector-icons";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import ProductCard from "../../components/ProductCard";
import { analyzeStok, calculateTLPrice } from "../../utils/calculations";

interface Product {
  id: number;
  urunAdi: string;
  stok: number;
  fiyatUsd: number;
  satisGecmisi: number[];
}

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [usdKuru, setusdKuru] = useState(43);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [searchText, setSearchText] = useState("");

  const API_URL = `http://${MY_IP}:5083/api/Products`;
  const HUB_URL = `http://${MY_IP}:5083/hub/products`;
  const CURRENCY_URL = `http://${MY_IP}:5083/api/Products/currency`;

  useEffect(() => {
    initializeData();

    const newConnection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("SignalR bağlantısı başarılı.");
          connection.on("Currency Updated", (updatedProducts: Product[]) => {
            console.log("Canlı veri geldi:", updatedProducts);
            setProducts(updatedProducts);
            saveToCache(updatedProducts);
            fetchCurrency();
          });
        })
        .catch((e) => console.log("Bağlantı hatası: ", e));
    }
  }, [connection]);

  const initializeData = async () => {
    await loadFromCache();
    await fetchCurrency();
    await fetchProducts();
  };

  const fetchCurrency = async () => {
    try {
      const response = await fetch(CURRENCY_URL);
      const data = await response.json();
      setusdKuru(data.rate);
      await AsyncStorage.setItem("son_usd_kuru", JSON.stringify(data.rate));
    } catch (error) {
      console.error("Kur çekilemedi.", error);
    }
  };

  const loadFromCache = async () => {
    try {
      const [cachedProducts, cachedKur] = await Promise.all([
        AsyncStorage.getItem("cevrimdisi_products"),
        AsyncStorage.getItem("son_usd_kuru"),
      ]);
      if (cachedProducts !== null) {
        setProducts(JSON.parse(cachedProducts));
      }

      if (cachedKur !== null) {
        setusdKuru(JSON.parse(cachedKur));
      }

      if (cachedProducts !== null || cachedKur !== null) {
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveToCache = async (data: Product[]) => {
    try {
      await AsyncStorage.setItem("cevrimdisi_products", JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Hata: ${response.status}`);
      const data = await response.json();
      setProducts(data);
      setLoading(false);
      saveToCache(data);
    } catch (error) {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(
      (item) =>
        item.urunAdi &&
        item.urunAdi.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [products, searchText]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f7fc" />

      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>Canlı Takip Paneli</Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
          >
            <Text style={styles.headerTitle}>Stok & Fiyat</Text>

            <View
              style={[
                styles.liveBadge,
                {
                  backgroundColor: connection ? "#ecfdf5" : "#fef2f2",
                  borderColor: connection ? "#a7f3d0" : "#fecaca",
                },
              ]}
            >
              <View
                style={[
                  styles.statusDotSmall,
                  { backgroundColor: connection ? "#10b981" : "#ef4444" },
                ]}
              />
              <Text
                style={[
                  styles.liveText,
                  { color: connection ? "#059669" : "#dc2626" },
                ]}
              >
                {connection ? "CANLI" : "BAĞLANTI YOK"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.currencyBadge}>
          <Text style={styles.currencyLabel}>1$ =</Text>
          <Text style={styles.rateText}>₺{usdKuru.toFixed(2)}</Text>
        </View>
      </View>

      {!connection && (
        <View style={styles.offlineBanner}>
          <Ionicons
            name="cloud-offline"
            size={16}
            color="white"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.offlineText}>
            Çevrimdışı Mod: Veriler güncel olmayabilir.
          </Text>
        </View>
      )}

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#94a3b8"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Ürün ara..."
          placeholderTextColor="#94a3b8"
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchText("")}
            style={styles.clearIcon}
          >
            <Ionicons name="close-circle" size={18} color="#cbd5e1" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>Ürün bulunamadı.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const analysis = analyzeStok(item.stok, item.satisGecmisi);
            const priceInTL = calculateTLPrice(item.fiyatUsd, usdKuru);
            const toplamSatis = item.satisGecmisi.reduce((a, b) => a + b, 0);
            const hicSatilmadi = toplamSatis === 0;

            const badgeColor = hicSatilmadi
              ? "#3b82f6"
              : analysis.isRisky
                ? "#ef4444"
                : "#10b981";

            const statusText = hicSatilmadi
              ? "Henüz Satış Yok"
              : `${analysis.message} (${analysis.daysLeft} Gün)`;

            return (
              <ProductCard
                urunAdi={item.urunAdi}
                fiyatUsd={item.fiyatUsd}
                fiyatTL={priceInTL}
                stok={item.stok}
                status={statusText}
                statusColor={badgeColor}
                satisGecmisi={item.satisGecmisi}
                usdKuru={usdKuru}
              />
            );
          }}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fc",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 10,
  },
  statusDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  currencyBadge: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#1e293b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  currencyLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    marginRight: 4,
  },
  rateText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  offlineBanner: {
    backgroundColor: "#f59e0b",
    flexDirection: "row",
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  offlineText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 16,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#1e293b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: {
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#334155",
    fontWeight: "500",
  },
  clearIcon: {
    paddingHorizontal: 15,
    height: "100%",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#94a3b8",
  },
});
