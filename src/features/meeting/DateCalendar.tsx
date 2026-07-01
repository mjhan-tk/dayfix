import { useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, cn } from '@thakicloud/shared';

const DOW = ['일', '월', '화', '수', '목', '금', '토'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
function isoOf(year: number, month0: number, day: number): string {
  return `${year}-${pad(month0 + 1)}-${pad(day)}`;
}
// YYYY-MM-DD 문자열 사이(포함)의 모든 날짜 — 사전순 비교가 곧 날짜순.
function datesBetween(a: string, b: string): string[] {
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  const out: string[] = [];
  const d = new Date(`${lo}T00:00:00`);
  const end = new Date(`${hi}T00:00:00`);
  while (d <= end) {
    out.push(isoOf(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

type DateCalendarProps = {
  value: string[];
  onChange: (dates: string[]) => void;
  initialMonth?: string; // 'YYYY-MM'
};

export function DateCalendar({ value, onChange, initialMonth = '2026-07' }: DateCalendarProps) {
  const [iy, im] = initialMonth.split('-').map(Number);
  const [year, setYear] = useState(iy);
  const [month, setMonth] = useState(im - 1); // 0-indexed

  const selected = new Set(value);
  const todayIso = (() => {
    const t = new Date();
    return isoOf(t.getFullYear(), t.getMonth(), t.getDate());
  })();

  // 드래그(연속 선택) 상태
  const dragging = useRef(false);
  const mode = useRef<'add' | 'erase'>('add');
  const anchor = useRef<string>('');
  const base = useRef<Set<string>>(new Set());

  useEffect(() => {
    const end = () => {
      dragging.current = false;
    };
    window.addEventListener('mouseup', end);
    return () => window.removeEventListener('mouseup', end);
  }, []);

  const applyRange = (to: string) => {
    const range = datesBetween(anchor.current, to);
    const next = new Set(base.current);
    if (mode.current === 'add') range.forEach((d) => next.add(d));
    else range.forEach((d) => next.delete(d));
    onChange([...next].sort());
  };

  const startDrag = (iso: string) => {
    dragging.current = true;
    anchor.current = iso;
    base.current = new Set(value);
    mode.current = selected.has(iso) ? 'erase' : 'add';
    applyRange(iso);
  };
  const enterDrag = (iso: string) => {
    if (dragging.current) applyRange(iso);
  };

  const goMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="select-none rounded-xl border border-border bg-surface p-3">
      {/* 헤더 */}
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goMonth(-1)}
          aria-label="이전 달"
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
        >
          <ChevronLeftIcon size="sm" />
        </button>
        <span className="text-13 font-semibold text-text">
          {year}년 {month + 1}월
        </span>
        <button
          type="button"
          onClick={() => goMonth(1)}
          aria-label="다음 달"
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
        >
          <ChevronRightIcon size="sm" />
        </button>
      </div>

      {/* 요일 */}
      <div className="mb-1 grid grid-cols-7">
        {DOW.map((d, i) => (
          <span
            key={d}
            className={cn(
              'py-1 text-center text-11 font-medium',
              i === 0 ? 'text-[#dc2626]' : 'text-text-muted',
            )}
          >
            {d}
          </span>
        ))}
      </div>

      {/* 날짜 */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <span key={`e${idx}`} />;
          const iso = isoOf(year, month, day);
          const isSel = selected.has(iso);
          const isToday = iso === todayIso;
          return (
            <button
              key={iso}
              type="button"
              onMouseDown={() => startDrag(iso)}
              onMouseOver={() => enterDrag(iso)}
              className={cn(
                'flex h-9 items-center justify-center rounded-lg text-13 transition-colors',
                isSel
                  ? 'bg-primary font-semibold text-white'
                  : 'text-text hover:bg-surface-muted',
                isToday && !isSel && 'font-semibold text-primary',
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
