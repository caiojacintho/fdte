import { useCallback, useEffect, useState } from 'react';

// Placements do tabuleiro: mapa slotKey -> cardId.
export type Placements = Record<string, string>;

function keyFor(code: string) {
  return `planehab.bairro.${code}`;
}

function read(code: string): Placements {
  try {
    const raw = localStorage.getItem(keyFor(code));
    return raw ? (JSON.parse(raw) as Placements) : {};
  } catch {
    return {};
  }
}

// Guarda as cartas do tabuleiro por código de acesso, sobrevivendo a recargas.
// (Quando o backend do link /acesso existir, este hook passa a sincronizar via API.)
export function usePlacements(code: string) {
  const [placements, setPlacements] = useState<Placements>(() => read(code));

  useEffect(() => {
    setPlacements(read(code));
  }, [code]);

  useEffect(() => {
    localStorage.setItem(keyFor(code), JSON.stringify(placements));
  }, [code, placements]);

  // Coloca (ou remove, com cardId null) uma carta num slot. Uma carta só pode
  // ocupar um slot por vez — se já estiver em outro, é movida.
  const setCard = useCallback((slotKey: string, cardId: string | null) => {
    setPlacements((prev) => {
      const next: Placements = {};
      for (const [k, v] of Object.entries(prev)) {
        if (cardId && v === cardId) continue; // tira a carta do slot antigo
        if (k === slotKey) continue; // libera o slot alvo
        next[k] = v;
      }
      if (cardId) next[slotKey] = cardId;
      return next;
    });
  }, []);

  const clearSlot = useCallback((slotKey: string) => {
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
  }, []);

  return { placements, setCard, clearSlot };
}
