import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, QrCode as QrIcon, Download, ExternalLink, Check, Copy, MessageCircle } from 'lucide-react';
import { cleanPhoneForWhatsApp } from '../utils/storage';

interface WhatsAppQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  defaultMessage: string;
  churchName: string;
}

export const WhatsAppQrModal: React.FC<WhatsAppQrModalProps> = ({
  isOpen,
  onClose,
  phone,
  defaultMessage,
  churchName
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  const cleanPhone = cleanPhoneForWhatsApp(phone) || '5542999683585';
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultMessage)}`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(waUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Erro gerando QR Code:', err));
    }
  }, [isOpen, waUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(waUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qrcode-whatsapp-efraim-${cleanPhone}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mb-3 border border-emerald-500/30">
            <QrIcon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-wide">
            QR Code Oficial do WhatsApp
          </h3>
          <p className="text-xs text-amber-300 font-medium mt-1">
            {churchName} • Ponta Grossa/PR
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Aponte a câmera do celular para abrir o contato no número <strong className="text-slate-200">{phone}</strong>
          </p>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-inner mb-5 mx-auto max-w-[260px]">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code WhatsApp Efraim"
              className="w-full h-auto rounded-lg"
            />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-slate-400">
              Carregando QR Code...
            </div>
          )}
          <span className="text-[10px] text-slate-600 font-semibold mt-2 flex items-center gap-1">
            <MessageCircle className="w-3 h-3 text-emerald-600" /> WhatsApp Oficial Comunhão Cristã Efraim
          </span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Link Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Link</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Imagem</span>
          </button>
        </div>

        <div className="mt-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors shadow-lg shadow-emerald-900/40"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Abrir no WhatsApp Agora</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
