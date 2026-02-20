export const calculateTLPrice = (fiyatUsd, usdKuru) => {
  const result = fiyatUsd * usdKuru;
  return result.toFixed(2);
};

export const analyzeStok = (stok, satisGecmisi) => {
  if (!satisGecmisi || satisGecmisi.length === 0) {
    return { isRisky: false, daysLeft: "Veri Yok", message: "Veri Bekleniyor" };
  }

  const toplamSatis = satisGecmisi.reduce((toplam, gunlukSatis) => {
    return toplam + gunlukSatis;
  }, 0);

  const averageDailySales = toplamSatis / satisGecmisi.length;

  let daysLeft;
  if (averageDailySales === 0) {
    daysLeft = 999;
  } else {
    daysLeft = stok / averageDailySales;
  }

  const isRisky = daysLeft < 3;

  return {
    isRisky: isRisky,
    daysLeft: daysLeft === 999 ? "Sonsuz" : daysLeft.toFixed(1),
    message: isRisky ? "Stok Kritik" : "Stok Yeterli",
  };
};
