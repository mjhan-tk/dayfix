import { Badge, cn } from '@thakicloud/shared';
import { slotTimeRange, type ScoredSlot } from '@/lib/scheduling';

function SlotCard({
  scored,
  rank,
  onClick,
}: {
  scored: ScoredSlot;
  rank: number;
  onClick: () => void;
}) {
  const { slot, requiredBlocked, optionalBlocked, negotiable } = scored;
  const allClear =
    requiredBlocked.length === 0 && negotiable.length === 0 && optionalBlocked.length === 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col gap-2.5 rounded-xl border bg-surface p-4 text-left transition-colors hover:border-primary/50',
        rank === 1 ? 'border-primary/40' : 'border-border',
      )}
    >
      <div className="flex items-center gap-1.5">
        {rank === 1 && <span className="text-13">⭐</span>}
        <span className="text-12 text-text-muted">{slot.dateLabel}</span>
      </div>
      <span className="text-16 font-bold text-text">{slotTimeRange(slot)}</span>
      <div className="flex flex-wrap gap-1">
        {requiredBlocked.length === 0 ? (
          <Badge theme="gre" size="sm">{allClear ? '모두 가능' : '필수 전원 가능'}</Badge>
        ) : (
          <Badge theme="red" size="sm">필수 {requiredBlocked.length}명 불가</Badge>
        )}
        {negotiable.length > 0 && <Badge theme="ylw" size="sm">조율 {negotiable.length}</Badge>}
        {optionalBlocked.length > 0 && <Badge theme="gry" size="sm">선택 {optionalBlocked.length}</Badge>}
      </div>
    </button>
  );
}

type SlotRankingProps = {
  scored: ScoredSlot[];
  onOpenSlot: (scored: ScoredSlot) => void;
  limit?: number;
};

export function SlotRanking({ scored, onOpenSlot, limit = 3 }: SlotRankingProps) {
  const visible = scored.slice(0, limit);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {visible.map((s, i) => (
        <SlotCard key={s.slot.id} scored={s} rank={i + 1} onClick={() => onOpenSlot(s)} />
      ))}
    </div>
  );
}
