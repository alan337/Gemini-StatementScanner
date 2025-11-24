import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

const processFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeStatement = async (file: File): Promise<{ transactions: Transaction[], startDate: string, endDate: string, statementTotal?: number }> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing");
    }

    const ai = new GoogleGenAI({ apiKey });
    const base64Data = await processFile(file);

    const model = "gemini-2.5-flash"; 
    
    // Schema definition for structured output
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        transactions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "Transaction date in Format MMM DD (e.g. Jan. 10)" },
              description: { type: Type.STRING, description: "Merchant name or transaction description" },
              cardLast4: { type: Type.STRING, description: "Last 4 digits of the card used, if visible. Empty string if not." },
              amount: { type: Type.NUMBER, description: "Transaction amount. Positive for expenses/purchases. Negative for payments/refunds." },
              category: { 
                type: Type.STRING, 
                description: "Best fit category: Groceries, Gas, Dining, Shopping, Travel, Transportation, Internet, Cellphone, Donation, Online Services, Utilities, Entertainment, Business, Other" 
              },
            },
            required: ["date", "description", "amount", "category"]
          }
        },
        startDate: { type: Type.STRING, description: "Start date of the statement period (e.g., Dec. 26)" },
        endDate: { type: Type.STRING, description: "End date of the statement period (e.g., Jan. 19)" },
        statementTotal: { type: Type.NUMBER, description: "The 'Total New Charges', 'Total Purchases', or similar total amount listed in the statement summary section. Do not include previous balance." }
      },
      required: ["transactions", "startDate", "endDate"]
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: "Analyze this credit card statement. Extract all transactions into a structured JSON format. Infer the category based on the merchant name. Ensure amounts are numbers (positive for spend)."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are a precise data extraction engine. You extract financial data from PDF statements accurately. Rely on the text layer of the PDF for exact extraction."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text);
    
    // Add IDs to transactions
    const transactionsWithIds = data.transactions.map((t: any, index: number) => ({
      ...t,
      id: `tx-${index}-${Date.now()}`,
      originalCategory: t.category // Store original for reverting logic if needed
    }));

    return {
      transactions: transactionsWithIds,
      startDate: data.startDate || "Unknown",
      endDate: data.endDate || "Unknown",
      statementTotal: data.statementTotal
    };

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};