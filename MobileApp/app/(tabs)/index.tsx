import { Ionicons } from "@expo/vector-icons";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
  const [usdKuru, setusdKuru] = useState(47.77);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [searchText, setSearchText] = useState("");

  const MY_IP = "192.168.0.228";
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
    } catch (error) {
      console.error("Kur çekilemedi, eski fiyat kalacak:", error);
    }
  };

  const loadFromCache = async () => {
    try {
      const cachedData = await AsyncStorage.getItem("offline_products");
      if (cachedData !== null) {
        setProducts(JSON.parse(cachedData));
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveToCache = async (data: Product[]) => {
    try {
      await AsyncStorage.setItem("offline_products", JSON.stringify(data));
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

  const filteredProducts = products.filter(
    (item) =>
      item.urunAdi &&
      item.urunAdi.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.headerTitle}>Stok Fiyat Takip</Text>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              marginLeft: 8,
              backgroundColor: connection ? "#2ecc71" : "#e74c3c",
            }}
          />
        </View>
        <Text style={styles.rateText}>USD: ₺{usdKuru.toFixed(2)}</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={{ marginRight: 10 }}
        />
        <TextInput
          placeholder="Ürün Ara"
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20, color: "#999" }}>
              Ürün bulunamadı.
            </Text>
          }
          renderItem={({ item }) => {
            const analysis = analyzeStok(item.stok, item.satisGecmisi);
            const priceInTL = calculateTLPrice(item.fiyatUsd, usdKuru);

            return (
              <ProductCard
                urunAdi={item.urunAdi}
                fiyatUsd={item.fiyatUsd}
                fiyatTL={priceInTL}
                stok={item.stok}
                status={`${analysis.message} (${analysis.daysLeft} Gün)`}
                statusColor={analysis.isRisky ? "red" : "green"}
              />
            );
          }}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", paddingTop: 50 },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  rateText: { fontSize: 16, fontWeight: "bold", color: "#2c3e50" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: { flex: 1, height: "100%" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
});
