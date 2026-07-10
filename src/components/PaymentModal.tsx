"use client";

import { useState } from "react";
import { X, QrCode, CheckCircle, Loader2, Copy, Check } from "lucide-react";
import { addPaidRequests } from "@/utils/db";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, userId, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<"info" | "pix" | "processing" | "success">("info");
  const [copied, setCopied] = useState(false);

  const PIX_EMAIL = "temporavel2@gmail.com";
  const PIX_KEY = "temporavel2@gmail.com";
  const PIX_NAME = "Coffee Search";
  const PIX_CITY = "Sao Paulo";
  const PIX_AMOUNT = "5.00";

  // Gera um PIX copia e cola simples (simulado)
  const pixCode = `00020126580014BR.GOV.BCB.PIX0136${PIX_KEY}52040000530398654045.005802BR5913${PIX_NAME}6009${PIX_CITY}62070503***6304`;

  if (!isOpen) return null;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = () => {
    setStep("processing");
    setTimeout(() => {
      addPaidRequests(userId, 10);
      setStep("success");
      onSuccess();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md mx-4 bg-coffee-900 border border-coffee-600 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-coffee-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-coffee-400" />
            Adicionar Requests
          </h2>
          <button onClick={onClose} className="text-coffee-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "info" && (
          <div className="p-6 space-y-5">
            <div className="bg-coffee-800/50 rounded-xl p-5 text-center border border-coffee-700">
              <p className="text-4xl font-bold text-green-400">R$ 5,00</p>
              <p className="text-sm text-coffee-400 mt-2">+10 requests extras para sua conta</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-coffee-800/30 rounded-lg p-3">
                <div className="w-6 h-6 bg-coffee-700 rounded-full flex items-center justify-center text-xs font-bold text-coffee-300 flex-shrink-0 mt-0.5">1</div>
                <p className="text-sm text-coffee-300">Clique em "Pagar com PIX" para ver a chave</p>
              </div>
              <div className="flex items-start gap-3 bg-coffee-800/30 rounded-lg p-3">
                <div className="w-6 h-6 bg-coffee-700 rounded-full flex items-center justify-center text-xs font-bold text-coffee-300 flex-shrink-0 mt-0.5">2</div>
                <p className="text-sm text-coffee-300">Copie a chave PIX e faça o pagamento no seu banco</p>
              </div>
              <div className="flex items-start gap-3 bg-coffee-800/30 rounded-lg p-3">
                <div className="w-6 h-6 bg-coffee-700 rounded-full flex items-center justify-center text-xs font-bold text-coffee-300 flex-shrink-0 mt-0.5">3</div>
                <p className="text-sm text-coffee-300">Após pagar, clique em "Já paguei" para liberar seus requests</p>
              </div>
            </div>

            <button
              onClick={() => setStep("pix")}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Pagar com PIX
            </button>
          </div>
        )}

        {step === "pix" && (
          <div className="p-6 space-y-5">
            <div className="bg-white rounded-xl p-4 flex flex-col items-center">
              <div className="w-48 h-48 bg-coffee-900 rounded-lg flex items-center justify-center mb-3">
                <QrCode className="w-32 h-32 text-white" />
              </div>
              <p className="text-coffee-900 text-xs font-medium">Escaneie com seu app bancário</p>
            </div>

            <div className="bg-coffee-800/50 rounded-lg p-4 border border-coffee-700">
              <p className="text-xs text-coffee-500 uppercase tracking-wider mb-1">Chave PIX (Email)</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-coffee-950 rounded-lg px-3 py-2 text-sm text-green-400 font-mono truncate">
                  {PIX_EMAIL}
                </code>
                <button
                  onClick={handleCopyPix}
                  className="p-2 bg-coffee-700 hover:bg-coffee-600 rounded-lg transition-colors"
                  title="Copiar chave PIX"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-coffee-300" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 text-xs text-coffee-500 bg-coffee-800/30 rounded-lg p-3">
              <span>Beneficiário:</span>
              <span className="text-coffee-300 text-right">{PIX_NAME}</span>
              <span>Valor:</span>
              <span className="text-green-400 text-right font-bold">R$ {PIX_AMOUNT}</span>
              <span>Chave:</span>
              <span className="text-coffee-300 text-right">Email</span>
            </div>

            <button
              onClick={handleConfirmPayment}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Já paguei - Liberar +10 Requests
            </button>

            <p className="text-[10px] text-coffee-600 text-center">
              O pagamento é verificado manualmente. Se houver problema, contate o admin.
            </p>
          </div>
        )}

        {step === "processing" && (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-green-400 animate-spin mb-4" />
            <p className="text-white font-medium">Verificando pagamento...</p>
            <p className="text-sm text-coffee-500 mt-1">Isso pode levar alguns segundos</p>
          </div>
        )}

        {step === "success" && (
          <div className="p-12 flex flex-col items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
            <p className="text-white font-bold text-lg">Pagamento confirmado!</p>
            <p className="text-sm text-coffee-400 mt-1">+10 requests adicionados à sua conta</p>
            <button
              onClick={onClose}
              className="mt-6 bg-coffee-600 hover:bg-coffee-500 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
