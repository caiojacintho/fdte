import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type TipState = { text: string; cx: number; top: number };

// Substitui os tooltips nativos (atributo `title`) por um tooltip estilizado,
// igual ao do botão de exportar. Funciona para qualquer elemento com `title`
// em todo o painel: ao passar o mouse, o `title` é removido (some o nativo) e
// mostramos a nossa versão; ao sair, o `title` é restaurado.
export function GlobalTooltip() {
  const [tip, setTip] = useState<TipState | null>(null);
  const [left, setLeft] = useState(0);
  const tipRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<{ el: HTMLElement; title: string } | null>(null);

  useEffect(() => {
    function show(el: HTMLElement) {
      const title = el.getAttribute('title');
      if (!title) return;
      el.removeAttribute('title');
      activeRef.current = { el, title };
      const r = el.getBoundingClientRect();
      setTip({ text: title, cx: r.left + r.width / 2, top: r.bottom + 8 });
    }
    function hide() {
      if (activeRef.current) {
        activeRef.current.el.setAttribute('title', activeRef.current.title);
        activeRef.current = null;
      }
      setTip(null);
    }
    function onOver(e: MouseEvent) {
      const el = (e.target as HTMLElement)?.closest?.('[title]') as HTMLElement | null;
      if (el && el.getAttribute('title') && activeRef.current?.el !== el) {
        hide();
        show(el);
      }
    }
    function onOut(e: MouseEvent) {
      if (!activeRef.current) return;
      const related = e.relatedTarget as Node | null;
      if (related && activeRef.current.el.contains(related)) return;
      hide();
    }

    document.addEventListener('mouseover', onOver, true);
    document.addEventListener('mouseout', onOut, true);
    window.addEventListener('scroll', hide, true);
    return () => {
      document.removeEventListener('mouseover', onOver, true);
      document.removeEventListener('mouseout', onOut, true);
      window.removeEventListener('scroll', hide, true);
      if (activeRef.current) activeRef.current.el.setAttribute('title', activeRef.current.title);
    };
  }, []);

  // Mantém o tooltip dentro da tela (centralizado sob o elemento).
  useLayoutEffect(() => {
    if (!tip || !tipRef.current) return;
    const half = tipRef.current.offsetWidth / 2;
    setLeft(Math.min(Math.max(tip.cx, half + 8), window.innerWidth - half - 8));
  }, [tip]);

  if (!tip) return null;
  return (
    <div ref={tipRef} className="global-tooltip" style={{ left, top: tip.top }} role="tooltip">
      {tip.text}
    </div>
  );
}
