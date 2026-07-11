import { NextRequest, NextResponse } from "next/server";

// ============================================
// GEMINI API - ROTAÇÃO DE CHAVES (SERVER-SIDE)
// As chaves ficam só no servidor, nunca no navegador.
// Configure no seu .env.local (NÃO usar prefixo NEXT_PUBLIC_):
//   GEMINI_API_KEY_1=...
//   GEMINI_API_KEY_2=...
// ============================================

const API_KEYS = [process.env.GEMINI_API_KEY_1, process.env.GEMINI_API_KEY_2].filter(
  (key): key is string => Boolean(key)
);

let currentKeyIndex = 0;

function getNextKey(): string {
  if (API_KEYS.length === 0) {
    throw new Error("Nenhuma chave Gemini configurada no servidor.");
  }
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}

export interface ProductResult {
  name: string;
  price: string;
  store: string;
  link: string;
  rating: string;
  reviews: string;
  imageUrl: string;
  features: string[];
}

export interface SearchResponse {
  products: ProductResult[];
  summary: string;
  bestDeal: ProductResult | null;
}

function getFallbackResults(productName: string): SearchResponse {
  const products: ProductResult[] = [
    {
      name: `${productName} - Modelo Premium`,
      price: "R$ 1.299,00",
      store: "Mercado Livre",
      link: "https://www.mercadolivre.com.br",
      rating: "4.7",
      reviews: "2.341 avaliações",
      imageUrl: "https://via.placeholder.com/300x200?text=Premium",
      features: ["Alta qualidade", "Garantia de 1 ano", "Frete grátis"],
    },
    {
      name: `${productName} - Modelo Standard`,
      price: "R$ 899,00",
      store: "Amazon Brasil",
      link: "https://www.amazon.com.br",
      rating: "4.5",
      reviews: "1.876 avaliações",
      imageUrl: "https://via.placeholder.com/300x200?text=Standard",
      features: ["Bom custo-benefício", "Entrega rápida", "Avaliações positivas"],
    },
    {
      name: `${productName} - Modelo Econômico`,
      price: "R$ 599,00",
      store: "Magazine Luiza",
      link: "https://www.magazineluiza.com.br",
      rating: "4.2",
      reviews: "987 avaliações",
      imageUrl: "https://via.placeholder.com/300x200?text=Economico",
      features: ["Preço acessível", "Básico mas funcional", "Parcelamento"],
    },
    {
      name: `${productName} - Edição Especial`,
      price: "R$ 1.599,00",
      store: "Casas Bahia",
      link: "https://www.casasbahia.com.br",
      rating: "4.8",
      reviews: "543 avaliações",
      imageUrl: "https://via.placeholder.com/300x200?text=Especial",
      features: ["Edição limitada", "Acessórios inclusos", "Design premium"],
    },
    {
      name: `${productName} - Modelo Pro`,
      price: "R$ 2.199,00",
      store: "Americanas",
      link: "https://www.americanas.com.br",
      rating: "4.9",
      reviews: "321 avaliações",
      imageUrl: "https://via.placeholder.com/300x200?text=Pro",
      features: ["Top de linha", "Garantia estendida", "Suporte VIP"],
    },
  ];

  return {
    products,
    summary: `Encontramos ${products.length} opções de "${productName}". A melhor relação custo-benefício é o modelo Standard por R$ 899,00 na Amazon Brasil, com excelentes avaliações e entrega rápida.`,
    bestDeal: products[1],
  };
}

async function searchProductsWithGemini(productName: string): Promise<SearchResponse> {
  const key = getNextKey();

  const prompt = `Você é um comparador de preços inteligente. O usuário quer comprar: "${productName}".

IMPORTANTE: Retorne APENAS um JSON válido no seguinte formato (sem markdown, sem explicações):

{
  "products": [
    {
      "name": "Nome completo do produto",
      "price": "R$ X.XXX,XX",
      "store": "Nome da loja",
      "link": "https://www.loja.com.br/produto",
      "rating": "4.5",
      "reviews": "1.234 avaliações",
      "imageUrl": "https://via.placeholder.com/300x200?text=Produto",
      "features": ["Feature 1", "Feature 2", "Feature 3"]
    }
  ],
  "summary": "Resumo em 2-3 frases sobre o produto e melhor opção",
  "bestDeal": { ... }
}

Use a busca do Google para encontrar produtos reais, com preços atuais e links DIRETOS para a página do produto específico (não a homepage da loja). Gere até 5 opções reais com preços realistas para o Brasil.

O campo "bestDeal" deve ser o produto com melhor custo-benefício.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errText.slice(0, 200)}`);
  }

  const data = await response.json();

  const finishReason = data.candidates?.[0]?.finishReason;
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!text) {
    throw new Error(`Resposta vazia do Gemini (finishReason: ${finishReason || "desconhecido"})`);
  }

  // Remove possíveis cercas de markdown (```json ... ```)
  const cleaned = text.replace(/```json\s*|```\s*/g, "").trim();

  try {
    return JSON.parse(cleaned) as SearchResponse;
  } catch (parseError) {
    // Tenta extrair o maior bloco JSON válido possível como último recurso
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as SearchResponse;
      } catch {
        // segue para o erro abaixo
      }
    }
    const msg = parseError instanceof Error ? parseError.message : "erro de parsing";
    throw new Error(
      `JSON inválido do Gemini (finishReason: ${finishReason || "?"}): ${msg}`
    );
  }
}

export async function GET() {
  try {
    if (API_KEYS.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma chave Gemini configurada no servidor." },
        { status: 500 }
      );
    }
    const key = API_KEYS[0];
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
    );
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erro ao listar modelos: ${response.status}`, details: data },
        { status: response.status }
      );
    }

    const models = (data.models || []).map((m: { name: string; supportedGenerationMethods?: string[] }) => ({
      name: m.name,
      supportsGenerateContent: m.supportedGenerationMethods?.includes("generateContent") ?? false,
    }));

    return NextResponse.json({ models });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { productName } = await req.json();

  if (!productName || typeof productName !== "string") {
    return NextResponse.json({ error: "productName é obrigatório" }, { status: 400 });
  }

  try {
    const result = await searchProductsWithGemini(productName);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro Gemini:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: `Falha ao consultar a API do Gemini: ${message}` },
      { status: 502 }
    );
  }
}
