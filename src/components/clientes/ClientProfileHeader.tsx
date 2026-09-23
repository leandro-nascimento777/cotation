"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Client } from "@/lib/store/types";
import { formatCpf, formatPassport, formatPhoneWithDdi } from "@/lib/format";
import { Mail, Phone, Pencil, Trash2, Camera, X, Plus } from "lucide-react";
import { toast } from "sonner";

interface ClientProfileHeaderProps {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateAvatar?: (avatarUrl: string) => void;
}

function getInitials(name: string): string {
  if (!name) return "CL";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ClientProfileHeader({
  client,
  onEdit,
  onDelete,
  onUpdateAvatar,
}: ClientProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const initials = getInitials(client.nomeCompleto);

  const formattedCpf = formatCpf(client.cpf);
  const formattedPassport = formatPassport(client.passaporte);
  const formattedPhone = formatPhoneWithDdi(client.telefone);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onUpdateAvatar?.(base64);
      toast.success("Foto do perfil atualizada!");
      setUploading(false);
    };
    reader.onerror = () => {
      toast.error("Erro ao carregar a imagem.");
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateAvatar?.("");
    toast.success("Foto removida. Exibindo iniciais do cliente.");
  };

  return (
    <div className="relative flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Avatar Circular Interativo com Upload / Iniciais */}
      <div className="relative z-20 shrink-0 -mb-6 sm:mb-0 sm:-mr-12 flex items-center justify-center">
        <div
          onClick={() => fileInputRef.current?.click()}
          title="Clique para adicionar ou trocar a foto do cliente"
          className="group relative h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 rounded-full border-4 border-white bg-gradient-to-br from-blue-100 via-sky-50 to-indigo-100 shadow-xl overflow-hidden ring-2 ring-slate-800/15 cursor-pointer flex items-center justify-center transition transform hover:scale-[1.02] active:scale-95"
        >
          {client.avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={client.avatarUrl}
              alt={client.nomeCompleto}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center select-none w-full h-full bg-gradient-to-tr from-[#bfdbfe] via-[#dbeafe] to-[#eff6ff]">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wider text-[#1d4ed8]">
                {initials}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-center p-2">
            <Camera className="h-6 w-6 sm:h-7 sm:w-7 mb-1 text-white" />
            <span className="text-[10px] sm:text-xs font-bold leading-tight uppercase tracking-wider">
              {client.avatarUrl ? "Trocar foto" : "Subir foto"}
            </span>
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
              Carregando...
            </div>
          )}
        </div>

        {client.avatarUrl ? (
          <button
            type="button"
            onClick={handleRemovePhoto}
            title="Remover foto e usar iniciais"
            className="absolute -top-1 -right-1 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600 transition cursor-pointer border-2 border-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            title="Adicionar foto"
            className="absolute bottom-0 right-1 z-30 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#1d82f5] text-white shadow-md hover:bg-blue-600 transition cursor-pointer border-2 border-white"
          >
            <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        )}
      </div>

      {/* Banner Azul do Cliente */}
      <div className="relative z-10 flex-1 overflow-hidden rounded-3xl bg-[#1d82f5] p-5 sm:p-6 sm:pl-16 md:pl-20 text-white shadow-lg flex flex-col justify-between gap-3 sm:gap-4 min-h-[140px] sm:min-h-[150px]">
        {/* Traços e ondas decorativas translúcidas no canto direito */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-1/2 opacity-25 overflow-hidden">
          <svg
            viewBox="0 0 300 150"
            preserveAspectRatio="none"
            className="h-full w-full"
            fill="none"
          >
            <path
              d="M 50 150 Q 150 20 300 40 L 300 150 Z"
              fill="currentColor"
              opacity="0.2"
            />
            <path
              d="M 120 150 Q 200 60 300 80 L 300 150 Z"
              fill="currentColor"
              opacity="0.25"
            />
          </svg>
        </div>

        {/* Topo do Banner: Nome e Ações de Edição/Exclusão */}
        <div className="relative z-10 flex items-start justify-between gap-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight drop-shadow-xs leading-tight">
            {client.nomeCompleto}
          </h1>

          <div className="flex items-center gap-1 opacity-90 hover:opacity-100 transition shrink-0">
            <button
              type="button"
              onClick={onEdit}
              title="Editar dados do cliente"
              className="rounded-lg bg-white/15 hover:bg-white/25 p-1.5 text-white transition cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              title="Excluir cliente"
              className="rounded-lg bg-white/15 hover:bg-red-500/80 p-1.5 text-white transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Linha dos Documentos (CPF e Passaporte Formatados) */}
        <div className="relative z-10 flex flex-wrap items-center gap-x-8 gap-y-1 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white/95">
          <span>CPF: {formattedCpf || "020.071.591-71"}</span>
          <span>PASSAPORTE: {formattedPassport || "N02978256"}</span>
        </div>

        {/* Linha dos Contatos e Botão de Cotação no CANTO INFERIOR do Header Azul */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold tracking-wide text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1d82f5] shadow-xs shrink-0">
                <Mail className="h-4 w-4 text-[#1d82f5]" />
              </span>
              <span className="uppercase">{client.email || "LEANDRO@LARIAN.COM.BR"}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1d82f5] shadow-xs shrink-0">
                <Phone className="h-4 w-4 text-[#1d82f5]" />
              </span>
              <span>{formattedPhone || "+55 (11) 98723-8273"}</span>
            </div>
          </div>

          {/* Botão de Cotação posicionado no CANTO INFERIOR direito */}
          <Link
            href={`/cotacoes/nova?clientId=${client.id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-bold text-[#1d82f5] hover:bg-blue-50 shadow-md transition transform active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" /> Nova cotação
          </Link>
        </div>
      </div>
    </div>
  );
}