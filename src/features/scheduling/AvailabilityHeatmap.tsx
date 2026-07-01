import { Fragment } from 'react';
import { Tooltip, cn } from '@thakicloud/shared';
import { HOURS, WEEK_DAYS, type ScoredSlot } from '@/lib/scheduling';

const GRAY_BLOCKED = '#EEF0F2';

// 가능 인원수 → 색 (파스텔 초록 단일 톤: 1–3 연함 / 4–5 중간 / 6 진함)
const GREEN = {
  light: '#DCF1E4', // 1–3
  medium: '#A6D8B8', // 4–5
  dark: '#6CBF92', // 6
};

function cellBg(count: number): string {
  if (count >= 6) return GREEN.dark;
  if (count >= 4) return GREEN.medium;
  return GREEN.light;
}

type AvailabilityHeatmapProps = {
  scored: ScoredSlot[];
  selectedSlotId?: string;
  onOpenSlot: (scored: ScoredSlot) => void;
};

function HeatCell({
  sc,
  selected,
  onOpen,
}: {
  sc: ScoredSlot;
  selected: boolean;
  onOpen: () => void;
}) {
  const blocked = sc.requiredBlocked.length > 0;
  const bg = blocked ? GRAY_BLOCKED : cellBg(sc.availableCount);

  const tip = `${sc.availableCount}명 가능 · 조율 ${sc.negotiable.length} · 불가 ${
    sc.requiredBlocked.length + sc.optionalBlocked.length
  }`;

  return (
    <Tooltip content={tip} direction="top">
      <button
        type="button"
        onClick={onOpen}
        style={{ backgroundColor: bg }}
        className={cn(
          'flex h-9 w-full items-center justify-center rounded-md text-12 font-semibold transition-all hover:ring-2 hover:ring-primary/60',
          selected && 'ring-2 ring-primary',
        )}
      >
        <span className={blocked ? 'text-text-subtle' : 'font-bold text-[#14532D]'}>
          {sc.availableCount}
        </span>
      </button>
    </Tooltip>
  );
}

export function AvailabilityHeatmap({
  scored,
  selectedSlotId,
  onOpenSlot,
}: AvailabilityHeatmapProps) {
  const byId = new Map(scored.map((s) => [s.slot.id, s]));
  const gridCols = '50px repeat(5, minmax(0, 1fr))';

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-11 text-text-muted">
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="flex h-3 w-10 overflow-hidden rounded-sm">
            <span className="flex-1" style={{ backgroundColor: GREEN.light }} />
            <span className="flex-1" style={{ backgroundColor: GREEN.medium }} />
            <span className="flex-1" style={{ backgroundColor: GREEN.dark }} />
          </span>
          적게 → 많이 가능
        </span>
        <span className="flex items-center gap-1 whitespace-nowrap">
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: GRAY_BLOCKED }} /> 필수 불가
        </span>
        <span className="whitespace-nowrap">숫자 = 가능 인원</span>
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: gridCols }}>
        <div />
        {WEEK_DAYS.map((d) => (
          <div key={d.key} className="flex flex-col items-center pb-1">
            <span className="text-12 font-semibold text-text">{d.key}</span>
            <span className="text-11 text-text-muted">7/{d.date}</span>
          </div>
        ))}

        {HOURS.map((hour) => (
          <Fragment key={hour}>
            <div className="flex items-center justify-end pr-1.5 text-11 text-text-muted">
              {hour}:00
            </div>
            {WEEK_DAYS.map((d) => {
              const id = `${d.key}-${hour}`;
              const sc = byId.get(id);
              if (!sc) return <div key={id} />;
              return (
                <HeatCell
                  key={id}
                  sc={sc}
                  selected={selectedSlotId === id}
                  onOpen={() => onOpenSlot(sc)}
                />
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
