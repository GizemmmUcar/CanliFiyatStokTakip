import { GEMINI_API_KEY } from "./apiKeys";

export type RiskResult = {
  risk: "LOW" | "MEDIUM" | "HIGH";
  comment: string;
};

export const analyzeRiskWithGemini = async (
  inputData: any,
): Promise<RiskResult> => {
  const apiKey = GEMINI_API_KEY;

  if (!apiKey || apiKey.includes("BURAYA")) {
    throw new Error("Geçerli bir API Key bulunamadı.");
  }

  const prompt = `Sen bir stok risk analiz motorusun. Görevin: Stok, satış hızı ve kur bilgisine göre risk analizi yapıp kısa bir yorum üretmek. 
  Veri: ${JSON.stringify(inputData)}
  KURAL: SADECE şu JSON formatında cevap ver: {"risk": "LOW", "comment": "Yorum"}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",

        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 },
        }),
      },
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(`Google API Hatası: ${data.error.message}`);
    }

    if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      console.log("Gelen Veri Yapısı Hatalı:", data);
      throw new Error("Gemini beklenen veri yapısını döndürmedi.");
    }

    const responseText = data.candidates[0].content.parts[0].text;
    const cleanText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanText) as RiskResult;
  } catch (error) {
    console.error("Gemini Servis Detaylı Hata:", error);
    throw error;
  }
};
