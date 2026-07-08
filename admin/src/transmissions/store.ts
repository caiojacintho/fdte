import { useEffect, useState } from 'react';

// Feature front-only: as transmissões são persistidas no localStorage do navegador.
// Quando o backend existir, este módulo passa a ler/gravar via API.

export type Group = {
  name: string; // ex.: "Grupo 1"
  url: string; // link de acesso próprio do grupo
};

export type Transmission = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  start: string; // HH:mm
  end: string; // HH:mm
  description: string; // observação livre sobre a sessão
  url: string;
  groups?: Group[]; // formulários do "Jogo do Bairro" criados para esta sessão
  createdAt: number;
};

const KEY = 'planehab.transmissions';
const EVENT = 'planehab:transmissions-changed';

function read(): Transmission[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Transmission[]) : [];
  } catch {
    return [];
  }
}

function write(list: Transmission[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

function makeId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// Ordena por data (mais recente primeiro); empata pela ordem de criação.
export function listTransmissions(): Transmission[] {
  return read().sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}

export function getTransmission(id: string): Transmission | undefined {
  return read().find((t) => t.id === id);
}

export function addTransmission(data: Omit<Transmission, 'id' | 'createdAt'>): Transmission {
  const item: Transmission = { ...data, id: makeId(), createdAt: Date.now() };
  write([item, ...read()]);
  return item;
}

export function updateTransmission(
  id: string,
  patch: Partial<Omit<Transmission, 'id' | 'createdAt'>>
): void {
  write(read().map((t) => (t.id === id ? { ...t, ...patch } : t)));
}

export function deleteTransmission(id: string): void {
  write(read().filter((t) => t.id !== id));
}

export function subscribe(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

// Hook reativo: re-renderiza quando uma transmissão é criada (mesma aba ou outra).
export function useTransmissions(): Transmission[] {
  const [items, setItems] = useState<Transmission[]>(() => listTransmissions());
  useEffect(() => subscribe(() => setItems(listTransmissions())), []);
  return items;
}
