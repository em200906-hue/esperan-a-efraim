import React, { useState } from 'react';
import { X, Copy, Check, Heart, ShieldCheck, QrCode as QrIcon } from 'lucide-react';
import QRCode from 'qrcode';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixKey: string;
  pixReceiver: string;
  pixBank: string;
  pixDescription: string;
}

export const PixModal: React.FC<PixModalProps> = ({
  isOpen,
  onClose,
  pixKey,
  pixReceiver,
  pixBank,
  pixDescription
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  React.useEffect(() => {
    if (isOpen && pixKey) {
      QRCode.toDataURL(pixKey, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Erro QR Pix:', err));
    }
  }, [isOpen, pixKey]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mb-2 border border-amber-500/30">
            <Heart className="w-6 h-6 text-amber-400 fill-amber-400/20" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-wide">
            Dízimos, Ofertas e Missões
          </h3>
          <p className="text-xs text-amber-300 font-medium mt-0.5">
            Comunhão Cristã Efraim
          </p>
          <p className="text-xs text-slate-400 mt-1">
            "Cada um dê conforme determinou em seu coração, não com pesar ou por obrigação, pois Deus ama quem dá com alegria." (2 Co 9:7)
          </p>
        </div>

        {/* QR Code preview */}
        {showQr && (
          <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl shadow-inner mb-4 mx-auto max-w-[220px]">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code Pix Efraim"
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center text-slate-500 text-xs">
                Gerando QR Code Pix...
              </div>
            )}
            <span className="text-[10px] text-slate-600 font-bold mt-1">
              PIX CNPJ: {pixKey}
            </span>
          </div>
        )}

        {/* Informações detalhadas da Conta */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-4 space-y-2.5 text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/70">
            <span className="text-xs text-slate-400">Favorecido / Titular:</span>
            <span className="font-semibold text-white text-right">{pixReceiver}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-800/70">
            <span className="text-xs text-slate-400">Instituição / Banco:</span>
            <span className="text-slate-300 text-right">{pixBank}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-800/70">
            <span className="text-xs text-slate-400">Destinação:</span>
            <span className="text-slate-300 text-right text-xs">{pixDescription}</span>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Chave Pix Oficial (CNPJ):</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 border border-amber-500/30 rounded-lg p-2.5">
              <code className="text-amber-300 font-mono text-base font-bold flex-1 select-all break-all">
                {pixKey}
              </code>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => setShowQr(!showQr)}
            className="text-amber-400 hover:underline flex items-center gap-1"
          >
            <QrIcon className="w-3.5 h-3.5" />
            <span>{showQr ? 'Ocultar QR Code' : 'Exibir QR Code'}</span>
          </button>
          <span>Deus abençoe sua generosidade!</span>
        </div>
      </div>
    </div>
  );
};
