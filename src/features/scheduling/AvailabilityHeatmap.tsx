import { Fragment } from 'react';
import { Tooltip, cn } from '@thakicloud/shared';
import { HOURS, WEEK_DAYS, type ScoredSlot } from '@/lib/scheduling';

const GRAY_BLOCKED = '#EEF0F2';

type AvailabilityHeatmapProps = {
  scored: ScoredSlot[];
  topIds: Set<string>;
  selectedSlotId?: string;
  onOpenSlot: (scored: ScoredSlot) => void;
};

function HeatCell({
  sc,
  isTop,
  selected,
  onOpen,
}: {
  sc: ScoredSlot;
  isTop: boolean;
  selected: boolean;
  onOpen: () => void;
}) {
  const blocked = sc.requiredBlocked.length > 0;
  const alpha = Math.max(0.16, sc.score / 100);
  const bg = blocked ? GRAY_BLOCKED : `rgba(22,163,74,${alpha})`;
  const lightText = !blocked && alpha >= 0.55;

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
          'relative flex h-9 w-full items-center justify-center rounded-md text-12 font-semibold transition-all hover:ring-2 hover:ring-primary/60',
          selected && 'ring-2 ring-primary',
          isTop && 'ring-1 ring-[#15803d]',
        )}
      >
        <span className={blocked ? 'text-text-subtle' : lightText ? 'text-white' : 'text-[#166534]'}>
          {sc.availableCount}
        </span>
        {isTop && <span className="absolute -right-1 -top-1.5 text-11 leading-none">⭐</span>}
      </button>
    </Tooltip>
  );
}

export function AvailabilityHeatmap({
  scored,
  topIds,
  selectedSlotId,
  onOpenSlot,
}: AvailabilityHeatmapProps) {
  const byId = new Map(scored.map((s) => [s.slot.id, s]));
  const gridCols = '50px repeat(5, minmax(0, 1fr))';

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-11 text-text-muted">
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="flex h-3 w-8 overflow-hidden rounded-sm">
            <span className="flex-1" style={{ backgroundColor: 'rgba(22,163,74,0.25)' }} />
            <span className="flex-1" style={{ backgroundColor: 'rgba(22,163,74,0.6)' }} />
            <span className="flex-1" style={{ backgroundColor: 'rgba(22,163,74,1)' }} />
          </span>
          적게 → 많이 가능
        </span>
        <span className="flex items-center gap-1 whitespace-nowrap">
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: GRAY_BLOCKED }} /> 필수 불가
        </span>
        <span className="whitespace-nowrap">⭐ 추천 · 숫자 = 가능 인원</span>
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
                  isTop={topIds.has(id)}
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
