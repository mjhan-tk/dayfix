import { cn, Tooltip } from '@thakicloud/shared';
import { Avatar } from '@/components/Avatar';
import {
  conditionLabel,
  getResponse,
  type Avail,
  type Member,
  type Responses,
  type Slot,
} from '@/lib/scheduling';

const AVAIL_GLYPH: Record<Avail, { mark: string; cls: string }> = {
  yes: { mark: '●', cls: 'text-[#16a34a]' },
  maybe: { mark: '◐', cls: 'text-[#d97706]' },
  no: { mark: '✕', cls: 'text-[#dc2626]' },
};

function Cell({
  member,
  slot,
  responses,
  highlighted,
  dim,
}: {
  member: Member;
  slot: Slot;
  responses: Responses;
  highlighted: boolean;
  dim?: boolean;
}) {
  const res = getResponse(responses, member.id, slot.id);
  const glyph = AVAIL_GLYPH[res.avail];
  const hasContext = (res.conditions?.length ?? 0) > 0 || Boolean(res.note);

  const tip =
    res.avail === 'yes'
      ? '가능'
      : [
          res.avail === 'maybe' ? '조율 가능' : '불가',
          ...(res.conditions?.map(conditionLabel) ?? []),
          res.note,
        ]
          .filter(Boolean)
          .join(' · ');

  const inner = (
    <div
      className={cn(
        'flex h-11 items-center justify-center border-b border-l border-border text-15',
        highlighted && 'bg-primary/5',
        dim && 'opacity-50',
      )}
    >
      <span className={cn('relative leading-none', glyph.cls)}>
        {glyph.mark}
        {hasContext && (
          <span className="absolute -right-1.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#d97706]" />
        )}
      </span>
    </div>
  );

  if (res.avail === 'yes') return inner;
  return (
    <Tooltip content={tip} direction="top">
      {inner}
    </Tooltip>
  );
}

function MemberLabel({ member }: { member: Member }) {
  return (
    <div className="sticky left-0 z-10 flex h-11 items-center gap-2 border-b border-r border-border bg-surface pl-3 pr-2">
      <Avatar member={member} size="xs" />
      <div className="flex min-w-0 flex-col">
        <span className="flex items-center gap-1 text-13 font-medium text-text">
          {member.name}
          {member.isOrganizer && <span title="주최자">👑</span>}
        </span>
        {member.context && (
          <span className="truncate text-11 text-text-muted">{member.context}</span>
        )}
      </div>
    </div>
  );
}

type AvailabilityMatrixProps = {
  members: Member[];
  slots: Slot[];
  responses: Responses;
  selectedSlotId?: string;
  onSelectSlot?: (slotId: string) => void;
};

export function AvailabilityMatrix({
  members,
  slots,
  responses,
  selectedSlotId,
  onSelectSlot,
}: AvailabilityMatrixProps) {
  const required = members.filter((m) => m.role === 'required');
  const optional = members.filter((m) => m.role === 'optional');

  const gridCols = `160px repeat(${slots.length}, minmax(60px, 1fr))`;

  const HeaderRow = (
    <div className="grid" style={{ gridTemplateColumns: gridCols }}>
      <div className="sticky left-0 z-20 flex items-end border-b border-r border-border bg-surface px-3 pb-2 text-12 font-medium text-text-muted">
        멤버 \ 시간
      </div>
      {slots.map((slot) => (
        <button
          key={slot.id}
          type="button"
          onClick={() => onSelectSlot?.(slot.id)}
          className={cn(
            'flex flex-col items-center gap-0.5 border-b border-l border-border px-1 py-2 transition-colors hover:bg-surface-muted',
            selectedSlotId === slot.id && 'bg-primary/5',
          )}
        >
          <span className="text-12 font-semibold text-text">{slot.day}</span>
          <span className="whitespace-nowrap text-11 text-text-muted">
            {slot.time.replace('오전 ', '').replace('오후 ', '')}
          </span>
        </button>
      ))}
    </div>
  );

  const renderMemberRows = (group: Member[]) =>
    group.map((member) => (
      <div key={member.id} className="grid" style={{ gridTemplateColumns: gridCols }}>
        <MemberLabel member={member} />
        {slots.map((slot) => (
          <Cell
            key={slot.id}
            member={member}
            slot={slot}
            responses={responses}
            highlighted={selectedSlotId === slot.id}
            dim={member.role === 'optional'}
          />
        ))}
      </div>
    ));

  return (
    <div className="rounded-xl border border-border bg-surface">
      {/* 범례 */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border px-4 py-2.5 text-12 text-text-muted">
        <span className="shrink-0 whitespace-nowrap font-medium text-text">가용성</span>
        <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
          <span className="text-[#16a34a]">●</span> 가능
        </span>
        <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
          <span className="text-[#d97706]">◐</span> 조율 가능
        </span>
        <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
          <span className="text-[#dc2626]">✕</span> 불가
        </span>
        <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
          <span className="h-1.5 w-1.5 rounded-full bg-[#d97706]" /> 조건·메모 있음
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          {HeaderRow}
          {renderMemberRows(required)}

          {optional.length > 0 && (
            <div
              className="grid border-t border-border bg-surface-muted"
              style={{ gridTemplateColumns: gridCols }}
            >
              <div className="col-span-full px-3 py-1.5 text-11 font-medium text-text-muted">
                선택 참여 · 결과에는 후순위로 반영돼요
              </div>
            </div>
          )}
          {renderMemberRows(optional)}
        </div>
      </div>
    </div>
  );
}
