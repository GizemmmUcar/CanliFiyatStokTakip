import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ProductCardProps {
  urunAdi: string;
  fiyatUsd: number;
  fiyatTL: string | number;
  stok: number;
  status: string;
  statusColor: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  urunAdi,
  fiyatUsd,
  fiyatTL,
  stok,
  status,
  statusColor,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.infoContainer}>
        <Text style={styles.urunAdi}>{urunAdi}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.fiyatUsd}>${fiyatUsd}</Text>
          <Text style={styles.fiyatTL}>₺{fiyatTL}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.stok}>Stok: {stok}</Text>

          <Text
            style={{ color: statusColor, fontWeight: "bold", fontSize: 13 }}
          >
            {status}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoContainer: { flex: 1 },
  urunAdi: { fontSize: 17, fontWeight: "bold", color: "#333", marginBottom: 6 },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  fiyatUsd: { fontSize: 18, fontWeight: "700", color: "#27ae60" },
  fiyatTL: { fontSize: 15, fontWeight: "600", color: "#95a5a6" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  stok: { fontSize: 14, color: "#7f8c8d" },
});

export default ProductCard;
