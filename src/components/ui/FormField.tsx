"use client";

import { ChangeEvent, ReactNode, useId, useState } from "react";
import {
  formatMoneyMaskFromDigits,
  moneyMaskToNumber,
  numberToMoneyMask,
  numberToPercentInput,
  percentInputToNumber,
  sanitizePercentInput,
} from "@/lib/format";
import { AlertCircle } from "lucide-react";

interface BaseFieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  className?: string;
  required?: boolean;
  id?: string;
}

export interface FormFieldProps extends BaseFieldProps {
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  disabled?: boolean;
  inputClassName?: string;
  list?: string;
}

const inputBaseStyle =
  "rounded-lg border px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 transition-colors";

export const FormField = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  max,
  maxLength,
  disabled,
  error,
  className = "",
  inputClassName = "",
  list,
  hint,
  id,
  required,
}: FormFieldProps) => {
  const autoId = useId();
  const fieldId = id || autoId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div className={`flex flex-col gap-1 text-xs font-medium text-slate-600 ${className}`}>
      <label htmlFor={fieldId} className="flex items-center gap-1">
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={fieldId}
        type={type}
        value={value}
        min={min}
        max={max}
        maxLength={maxLength}
        disabled={disabled}
        list={list}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className={`${inputBaseStyle} ${
          error
            ? "border-red-400 bg-red-50/20 focus:border-red-500"
            : "border-slate-300 focus:border-teal-500"
        } ${inputClassName}`}
      />
      {error && (
        <span id={errorId} className="flex items-center gap-1 text-[11px] font-normal text-red-600">
          <AlertCircle className="h-3 w-3 shrink-0" /> {error}
        </span>
      )}
      {!error && hint && (
        <span id={hintId} className="text-[11px] font-normal text-slate-400">
          {hint}
        </span>
      )}
    </div>
  );
};

export interface FormTextareaProps extends BaseFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  inputClassName?: string;
}

export const FormTextarea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
  error,
  className = "",
  inputClassName = "",
  hint,
  id,
  required,
}: FormTextareaProps) => {
  const autoId = useId();
  const fieldId = id || autoId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div className={`flex flex-col gap-1 text-xs font-medium text-slate-600 ${className}`}>
      <label htmlFor={fieldId} className="flex items-center gap-1">
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={fieldId}
        rows={rows}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        className={`${inputBaseStyle} resize-y ${
          error
            ? "border-red-400 bg-red-50/20 focus:border-red-500"
            : "border-slate-300 focus:border-teal-500"
        } ${inputClassName}`}
      />
      {error && (
        <span id={errorId} className="flex items-center gap-1 text-[11px] font-normal text-red-600">
          <AlertCircle className="h-3 w-3 shrink-0" /> {error}
        </span>
      )}
      {!error && hint && (
        <span id={hintId} className="text-[11px] font-normal text-slate-400">
          {hint}
        </span>
      )}
    </div>
  );
};

export interface FormSelectProps extends BaseFieldProps {
  value: string;
  onChange: (v: string) => void;
  children?: ReactNode;
  inputClassName?: string;
}

export const FormSelect = ({
  label,
  value,
  onChange,
  children,
  error,
  className = "",
  inputClassName = "",
  hint,
  id,
  required,
}: FormSelectProps) => {
  const autoId = useId();
  const fieldId = id || autoId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div className={`flex flex-col gap-1 text-xs font-medium text-slate-600 ${className}`}>
      <label htmlFor={fieldId} className="flex items-center gap-1">
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={fieldId}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        className={`${inputBaseStyle} bg-white ${
          error
            ? "border-red-400 bg-red-50/20 focus:border-red-500"
            : "border-slate-300 focus:border-teal-500"
        } ${inputClassName}`}
      >
        {children}
      </select>
      {error && (
        <span id={errorId} className="flex items-center gap-1 text-[11px] font-normal text-red-600">
          <AlertCircle className="h-3 w-3 shrink-0" /> {error}
        </span>
      )}
      {!error && hint && (
        <span id={hintId} className="text-[11px] font-normal text-slate-400">
          {hint}
        </span>
      )}
    </div>
  );
};

export interface MoneyFieldProps extends BaseFieldProps {
  value: number;
  onChange: (n: number) => void;
}

/** Campo de dinheiro (R$) com máscara em tempo real e acessibilidade. */
export const MoneyField = ({ label, value, onChange, error, className = "", hint, id }: MoneyFieldProps) => {
  const autoId = useId();
  const fieldId = id || autoId;

  return (
    <div className={`flex flex-col gap-1 text-xs font-medium text-slate-600 ${className}`}>
      <label htmlFor={fieldId}>{label}</label>
      <div
        className={`flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 ${
          error
            ? "border-red-400 bg-red-50/20 focus-within:border-red-500"
            : "border-slate-300 focus-within:border-teal-500"
        }`}
      >
        <span className="text-sm text-slate-400">R$</span>
        <input
          id={fieldId}
          inputMode="numeric"
          value={numberToMoneyMask(value)}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(moneyMaskToNumber(formatMoneyMaskFromDigits(e.target.value)))}
          className="w-full min-w-0 text-sm text-slate-800 outline-none"
        />
      </div>
      {error && (
        <span className="flex items-center gap-1 text-[11px] font-normal text-red-600">
          <AlertCircle className="h-3 w-3 shrink-0" /> {error}
        </span>
      )}
      {!error && hint && <span className="text-[11px] font-normal text-slate-400">{hint}</span>}
    </div>
  );
};

export interface PercentFieldProps extends BaseFieldProps {
  value: number;
  onChange: (n: number) => void;
}

/** Campo de percentual (%) com sanitização de decimais e acessibilidade. */
export const PercentField = ({ label, value, onChange, error, className = "", hint, id }: PercentFieldProps) => {
  const autoId = useId();
  const fieldId = id || autoId;
  const [text, setText] = useState(() => numberToPercentInput(value));

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const cleaned = sanitizePercentInput(e.target.value);
    setText(cleaned);
    onChange(percentInputToNumber(cleaned));
  };

  return (
    <div className={`flex flex-col gap-1 text-xs font-medium text-slate-600 ${className}`}>
      <label htmlFor={fieldId}>{label}</label>
      <div
        className={`flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 ${
          error
            ? "border-red-400 bg-red-50/20 focus-within:border-red-500"
            : "border-slate-300 focus-within:border-teal-500"
        }`}
      >
        <input
          id={fieldId}
          inputMode="decimal"
          value={text}
          aria-invalid={Boolean(error)}
          onChange={handleChange}
          className="w-full min-w-0 text-sm text-slate-800 outline-none"
        />
        <span className="text-sm text-slate-400">%</span>
      </div>
      {error && (
        <span className="flex items-center gap-1 text-[11px] font-normal text-red-600">
          <AlertCircle className="h-3 w-3 shrink-0" /> {error}
        </span>
      )}
      {!error && hint && <span className="text-[11px] font-normal text-slate-400">{hint}</span>}
    </div>
  );
};
