import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { analyzeRiskWithGemini, RiskResult } from "../utils/geminiRiskService";

interface ProductCardProps {
  urunAdi: string;
  fiyatUsd: number;
  fiyatTL: string | number;
  stok: number;
  status: string;
  statusColor: string;
  satisGecmisi: number[];
  usdKuru: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  urunAdi,
  fiyatUsd,
  fiyatTL,
  stok,
  status,
  statusColor,
  satisGecmisi,
  usdKuru,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<RiskResult | null>(null);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiResult(null);

    try {
      const inputData = {
        urunAdi: urunAdi || "Bilinmeyen Ürün",
        stok: stok ?? 0,
        satisGecmisi: satisGecmisi || [],
        usdKuru: usdKuru || 34,
      };

      const result = await analyzeRiskWithGemini(inputData);
      setAiResult(result);
    } catch (error: any) {
      console.error("Kart İçi Analiz Hatası:", error.message);
      setAiResult({
        risk: "HIGH",
        comment:
          "Analiz şu an yapılamıyor. Lütfen internetinizi veya API anahtarınızı kontrol edin.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (risk: string) => {
    if (risk === "HIGH") return "#fef2f2";
    if (risk === "MEDIUM") return "#fffbeb";
    return "#ecfdf5";
  };

  const getRiskTextColor = (risk: string) => {
    if (risk === "HIGH") return "#ef4444";
    if (risk === "MEDIUM") return "#f59e0b";
    return "#10b981";
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.urunAdi} numberOfLines={1}>
          {urunAdi}
        </Text>
        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}
        >
          <Ionicons
            name={statusColor === "#ef4444" ? "warning" : "shield-checkmark"}
            size={14}
            color={statusColor}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {status}
          </Text>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.fiyatTL}>₺{fiyatTL}</Text>
        <Text style={styles.fiyatUsd}>(≈ ${fiyatUsd})</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.stockInfoContainer}>
          <Text style={styles.stokLabel}>Mevcut Stok:</Text>
          <Text style={styles.stokValue}>{stok} Adet</Text>
        </View>

        <View style={styles.aiContainer}>
          {isAnalyzing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#8b5cf6" />
              <Text style={styles.loadingText}>Gemini Analiz Ediyor...</Text>
            </View>
          ) : aiResult ? (
            <View
              style={[
                styles.aiResultBox,
                { backgroundColor: getRiskColor(aiResult.risk) },
              ]}
            >
              <View style={styles.aiResultHeader}>
                <Ionicons
                  name="sparkles"
                  size={14}
                  color={getRiskTextColor(aiResult.risk)}
                />
                <Text
                  style={[
                    styles.aiRiskTitle,
                    { color: getRiskTextColor(aiResult.risk) },
                  ]}
                >
                  Risk Seviyesi: {aiResult.risk}
                </Text>
              </View>
              <Text style={styles.aiCommentText}>{aiResult.comment}</Text>

              <TouchableOpacity
                onPress={() => setAiResult(null)}
                style={{ marginTop: 8 }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    textDecorationLine: "underline",
                  }}
                >
                  Kapat
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.aiButton}
              onPress={handleAiAnalysis}
            >
              <Ionicons
                name="sparkles"
                size={16}
                color="white"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.aiButtonText}>Yapay Zeka Analizi İste</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#1e293b",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  urunAdi: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginRight: 10,
    letterSpacing: -0.3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  fiyatTL: {
    fontSize: 18,
    fontWeight: "700",
    color: "#334155",
    letterSpacing: -0.5,
  },
  fiyatUsd: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
    marginLeft: 6,
  },
  footer: { backgroundColor: "#f8fafc", padding: 12, borderRadius: 10 },
  stockInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stokLabel: { fontSize: 13, color: "#64748b", fontWeight: "500" },
  stokValue: { fontSize: 14, fontWeight: "700", color: "#334155" },
  aiContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 12,
  },
  aiButton: {
    backgroundColor: "#8b5cf6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
  },
  aiButtonText: { color: "white", fontWeight: "600", fontSize: 13 },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: "#8b5cf6",
    fontSize: 13,
    fontWeight: "600",
  },
  aiResultBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  aiResultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  aiRiskTitle: {
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 4,
    textTransform: "uppercase",
  },
  aiCommentText: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
    fontWeight: "500",
  },
});

export default React.memo(ProductCard);
