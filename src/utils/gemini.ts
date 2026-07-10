"use client";

// ============================================
// Cliente que consome a API route server-side (/api/search).
// Nenhuma chave de API fica exposta no navegador.
// ============================================

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

export async function searchProductsWithGemini(productName: string): Promise<SearchResponse> {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productName }),
  });

  if (!response.ok) {
    throw new Error(`Erro na busca: ${response.status}`);
  }

  return (await response.json()) as SearchResponse;
}
