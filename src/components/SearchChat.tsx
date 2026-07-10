"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ShoppingCart, ExternalLink, Star, Sparkles, Loader2 } from "lucide-react";
import { searchProductsWithGemini, SearchResponse } from "@/utils/gemini";
import { canMakeRequest, incrementRequest, findUserById, addPaidRequests } from "@/utils/db";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: SearchResponse["products"];
  bestDeal?: SearchResponse["bestDeal"];
  summary?: string;
  timestamp: Date;
}

interface SearchChatProps {
  userId: string;
  username: string;
  isAdmin: boolean;
  onRequestUsed: () => void;
}

export default function SearchChat({ userId, username, isAdmin, onRequestUsed }: SearchChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Olá, ${username}! ☕

Sou o Coffee Search, seu comparador de preços inteligente. Me diga qual produto você quer comprar e eu vou encontrar os melhores preços, avaliações e links para você!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateRemaining();
  }, []);

  const updateRemaining = () => {
    const user = findUserById(userId);
    if (user) {
      const { remaining } = canMakeRequest(user);
      setRemaining(remaining);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const user = findUserById(userId);
    if (!user) return;

    if (!isAdmin) {
      const { allowed, remaining: rem } = canMakeRequest(user);
      if (!allowed) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: "⚠️ Você atingiu o limite diário de 5 requests.

Quer mais? Pague R$ 5,00 para ter +10 requests extras!",
            timestamp: new Date(),
          },
        ]);
        return;
      }
      setRemaining(rem - 1);
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const result = await searchProductsWithGemini(input);

      incrementRequest(userId, input, true);
      onRequestUsed();

      const assistantMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: result.summary,
        products: result.products,
        bestDeal: result.bestDeal,
        summary: result.summary,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      incrementRequest(userId, input, false);
      onRequestUsed();

      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "❌ Desculpe, não consegui buscar os preços agora. Tente novamente em alguns segundos.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      updateRemaining();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-80px)]">
      {/* Header info */}
      <div className="flex items-center justify-between px-4 py-3 bg-coffee-800/50 border-b border-coffee-700">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-coffee-400" />
          <span className="text-sm font-medium text-coffee-200">Coffee Search AI</span>
        </div>
        {!isAdmin && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-coffee-400">Requests restantes hoje:</span>
            <span className={`font-bold px-2 py-0.5 rounded-full ${
              remaining > 2 ? "bg-green-900/50 text-green-400" : remaining > 0 ? "bg-yellow-900/50 text-yellow-400" : "bg-red-900/50 text-red-400"
            }`}>
              {remaining}
            </span>
          </div>
        )}
        {isAdmin && (
          <span className="text-xs text-coffee-400 bg-coffee-800 px-2 py-0.5 rounded-full">
            👑 Admin - Ilimitado
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-fade-in ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === "user" ? "bg-coffee-600" : "bg-coffee-500"
            }`}>
              {msg.role === "user" ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-coffee-600 text-white rounded-br-md"
                  : "bg-coffee-800 border border-coffee-700 text-coffee-100 rounded-bl-md"
              }`}>
                <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
              </div>

              {/* Product Cards */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-3 space-y-3">
                  {msg.products.map((product, idx) => (
                    <div
                      key={idx}
                      className={`bg-coffee-800 border rounded-xl p-4 transition-all hover:border-coffee-400 ${
                        msg.bestDeal?.name === product.name
                          ? "border-yellow-600/50 shadow-lg shadow-yellow-900/20"
                          : "border-coffee-700"
                      }`}
                    >
                      {msg.bestDeal?.name === product.name && (
                        <div className="flex items-center gap-1 mb-2 text-yellow-400 text-xs font-bold">
                          <Sparkles className="w-3 h-3" />
                          MELHOR CUSTO-BENEFÍCIO
                        </div>
                      )}
                      <div className="flex gap-3">
                        <div className="w-20 h-20 bg-coffee-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ShoppingCart className="w-8 h-8 text-coffee-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">{product.name}</h4>
                          <p className="text-lg font-bold text-green-400 mt-0.5">{product.price}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-coffee-400">{product.store}</span>
                            <span className="text-coffee-600">•</span>
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs text-coffee-300">{product.rating}</span>
                            </div>
                            <span className="text-xs text-coffee-500">({product.reviews})</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {product.features.map((feat, i) => (
                              <span key={i} className="text-[10px] bg-coffee-700 text-coffee-300 px-2 py-0.5 rounded-full">
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center justify-center gap-2 w-full bg-coffee-600 hover:bg-coffee-500 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ver na loja
                      </a>
                    </div>
                  ))}
                </div>
              )}

              <span className="text-[10px] text-coffee-600 mt-1 block">
                {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-coffee-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-coffee-800 border border-coffee-700 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-coffee-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Buscando os melhores preços...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-coffee-700 bg-coffee-900/80 backdrop-blur px-4 py-3">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Qual produto você quer comprar?"
              className="w-full bg-coffee-800 border border-coffee-600 rounded-xl px-4 py-3 pr-4 text-white placeholder-coffee-500 focus:outline-none focus:border-coffee-400 focus:ring-1 focus:ring-coffee-400 resize-none transition-all"
              rows={1}
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 bg-coffee-500 hover:bg-coffee-400 disabled:bg-coffee-700 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-coffee-600 text-center mt-2">
          Pressione Enter para enviar • Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}
