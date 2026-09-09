'use client';
import { useState,useId,isValidElement,cloneElement,type ReactElement, type ReactNode } from 'react';
import { Upload, X } from '@/components/icons';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const id=useId();
  return (
    <label className="editor-field" htmlFor={id}>
      <span>{label}</span>
      {isValidElement(children)?cloneElement(children as ReactElement<{id?:string;'aria-label'?:string}>,{id,'aria-label':label}):children}
    </label>
  );
}
export function IconButton({
  label,
  children,
  onClick,
  disabled = false,
  active = false,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`icon-button ${active ? 'selected' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
export function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="editor-field">
      <span>{label}</span>
      <Select value={value} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger aria-label={label}>
          <SelectValue>{options.find(option=>option.value===value)?.label||value}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem value={o.value} key={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
export function Toggle({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="editor-toggle">
      <span>{label}</span>
      <Switch
        aria-label={label}
        checked={value}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
export function NumberControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit = 'px',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="number-control">
      <div>
        <label>{label}</label>
        <span>
          <input
            type="number"
            aria-label={label}
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              if (e.target.value !== '')
                onChange(Math.min(max, Math.max(min, Number(e.target.value))));
            }}
          />
          {unit}
        </span>
      </div>
      <Slider
        aria-label={`${label}: controle deslizante`}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
      />
    </div>
  );
}
export function ColorControl({
  label,
  value,
  onChange,
  transparent = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  transparent?: boolean;
}) {
  return (
    <div className="editor-field">
      <span>{label}</span>
      <div className="editor-color">
        <input
          type="color"
          aria-label={label}
          value={value === 'transparent' ? '#ffffff' : value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span>
          {value === 'transparent' ? 'Transparente' : value.toUpperCase()}
        </span>
        {transparent && (
          <IconButton
            label="Sem fundo"
            active={value === 'transparent'}
            onClick={() => onChange('transparent')}
          >
            <X size={15} />
          </IconButton>
        )}
      </div>
    </div>
  );
}
export function ImageControl({
  label,
  value,
  onChange,
  onError,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onError: (s: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="editor-field">
      <span>{label}</span>
      <label className="editor-upload">
        {value ? <img src={value} alt={label} /> : <Upload size={23} />}
        <span>
          {loading
            ? 'Enviando…'
            : value
              ? 'Trocar imagem'
              : 'Selecionar imagem'}
          <small>PNG, JPG, WebP · até 400 KB</small>
        </span>
        <input
          aria-label={label}
          disabled={loading}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 400000) {
              onError('A imagem deve ter até 400 KB.');
              return;
            }
            setLoading(true);
            try {
              const form = new FormData();
              form.append('file', file);
              const r = await fetch('/api/media', {
                method: 'POST',
                body: form,
              });
              const data = (await r.json()) as { url: string; error?: string };
              if (!r.ok) throw Error(data.error || 'Erro no upload.');
              onChange(data.url);
            } catch (error) {
              onError((error as Error).message);
            } finally {
              setLoading(false);
            }
          }}
        />
      </label>
      {value && (
        <button
          type="button"
          className="text-button"
          onClick={() => onChange('')}
        >
          Remover imagem
        </button>
      )}
    </div>
  );
}
