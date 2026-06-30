import { Badge, Button, cn } from '@thakicloud/shared';
import {
  conditionLabel,
  type ScoredSlot,
  type SlotConflict,
} from '@/lib/scheduling';

function scoreColor(score: number): string {
  if (score >= 90) return '#16a34a';
  if (score >= 70) return '#d97706';
  return '#dc2626';
}

function conflictText(c: SlotConflict): string {
  const reason =
    c.response.conditions?.map(conditionLabel).join(', ') ?? c.response.note ?? '';
  const tail = reason ? ` · ${reason}` : '';
  const optTag = c.member.role === 'optional' ? '(선택)' : '';
  return `${c.member.name}${optTag}${tail}`;
}

function RankRow({ scored, rank, selected, onSelect, onPick }: {
  scored: ScoredSlot;
  rank: number;
  selected: boolean;
  onSelect: () => void;
  onPick: () => void;
}) {
  const { slot, score, allRequiredAvailable, requiredBlocked, optionalBlocked, negotiable } = scored;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect();
      }}
      className={cn(
        'flex w-full cursor-pointer items-center gap-4 rounded-xl border p-4 text-left transition-colors',
        selected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/40',
        rank === 1 && !selected && 'border-primary/30',
      )}
    >
      {/* 점수 링 */}
      <div
        className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full text-white"
        style={{ backgroundColor: scoreColor(score) }}
      >
        <span className="text-15 font-bold leading-none">{score}</span>
        <span className="text-[9px] leading-none opacity-90">점</span>
      </div>

      {/* 시간 + 사유 */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          {rank === 1 && <span className="text-14">⭐</span>}
          <span className="text-15 font-semibold text-text">
            {slot.dateLabel} · {slot.time}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-12 text-text-muted">
          {requiredBlocked.length === 0 ? (
            <Badge theme="gre" size="sm">필수 전원 가능</Badge>
          ) : (
            <Badge theme="red" size="sm">필수 {requiredBlocked.length}명 불가</Badge>
          )}
          {negotiable.length > 0 && (
            <Badge theme="ylw" size="sm">조율 {negotiable.length}</Badge>
          )}
          {optionalBlocked.length > 0 && (
            <Badge theme="gry" size="sm">선택 {optionalBlocked.length}명 불가</Badge>
          )}
        </div>
        {(requiredBlocked.length > 0 || negotiable.length > 0 || optionalBlocked.length > 0) && (
          <p className="truncate text-12 text-text-muted">
            {[...requiredBlocked, ...negotiable, ...optionalBlocked].map(conflictText).join('  ·  ')}
          </p>
        )}
        {allRequiredAvailable && negotiable.length === 0 && optionalBlocked.length === 0 && (
          <p className="text-12 text-text-muted">모두 가능한 시간이에요.</p>
        )}
      </div>

      <Button
        variant={rank === 1 ? 'primary' : 'secondary'}
        appearance={rank === 1 ? 'solid' : 'outline'}
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onPick();
        }}
      >
        이 시간으로
      </Button>
    </div>
  );
}

type SlotRankingProps = {
  scored: ScoredSlot[];
  selectedSlotId?: string;
  onSelectSlot?: (slotId: string) => void;
  onPickSlot?: (slotId: string) => void;
  limit?: number;
};

export function SlotRanking({ scored, selectedSlotId, onSelectSlot, onPickSlot, limit = 4 }: SlotRankingProps) {
  const visible = scored.slice(0, limit);
  return (
    <div className="flex flex-col gap-2.5">
      {visible.map((s, i) => (
        <RankRow
          key={s.slot.id}
          scored={s}
          rank={i + 1}
          selected={selectedSlotId === s.slot.id}
          onSelect={() => onSelectSlot?.(s.slot.id)}
          onPick={() => onPickSlot?.(s.slot.id)}
        />
      ))}
    </div>
  );
}
