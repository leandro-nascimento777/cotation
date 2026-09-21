"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw } from "lucide-react";

interface UploadCardProps {
  onExtract: (imageDataUrl: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  previewUrl: string | null;
}

export const UploadCard = ({ onExtract, loading, error, previewUrl }: UploadCardProps) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onExtract(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [onExtract]
  );

  return (
    <div
      className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
        dragOver ? "border-teal-500 bg-teal-50" : "border-slate-300 bg-white"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Print enviado"
          className="mx-auto mb-4 max-h-48 rounded-lg border border-slate-200 object-contain"
        />
      ) : null}

      {loading ? (
        <div className="flex flex-col items-center gap-2 py-4 text-slate-600">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-sm font-medium">Lendo o print e extraindo os voos…</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-4">
          <ImagePlus className="h-8 w-8 text-slate-400" />
          <p className="text-sm text-slate-600">
            Arraste o print da tela de voos aqui, ou
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Escolher imagem
          </button>
        </div>
      )}

      {previewUrl && !loading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline"
        >
          <RefreshCw className="h-3 w-3" /> Trocar imagem
        </button>
      )}

      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
    </div>
  );
}
