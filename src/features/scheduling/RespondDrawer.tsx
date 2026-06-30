import { useState } from 'react';
import {
  Checkbox,
  Input,
  Overlay,
  cn,
  type OverlayProps,
} from '@thakicloud/shared';
import {
  INITIAL_RESPONSES,
  SLOTS,
  getResponse,
  presetsForSlot,
  type Avail,
  type CellResponse,
  type Member,
  type Slot,
} from '@/lib/scheduling';

const SEGMENTS: { value: Avail; label: string; active: string }[] = [
  { value: 'yes', label: '가능', active: 'bg-[#16a34a] text-white border-[#16a34a]' },
  { value: 'maybe', label: '조율 가능', active: 'bg-[#d97706] text-white border-[#d97706]' },
  { value: 'no', label: '불가', active: 'bg-[#dc2626] text-white border-[#dc2626]' },
];

function SlotRow({
  slot,
  cell,
  onChange,
}: {
  slot: Slot;
  cell: CellResponse;
  onChange: (next: CellResponse) => void;
}) {
  const presets = presetsForSlot(slot);

  const setAvail = (avail: Avail) => {
    if (avail === 'maybe') onChange({ ...cell, avail });
    else onChange({ avail }); // 가능/불가는 조건·메모 초기화
  };

  const toggleCondition = (id: string) => {
    const set = new Set(cell.conditions ?? []);
    set.has(id) ? set.delete(id) : set.add(id);
    onChange({ ...cell, conditions: [...set] });
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between">
        <span className="text-14 font-semibold text-text">
          {slot.dateLabel} · {slot.time}
        </span>
        {/* 3단계 세그먼트 */}
        <div className="flex overflow-hidden rounded-md border border-border">
          {SEGMENTS.map((seg, i) => (
            <button
              key={seg.value}
              type="button"
              onClick={() => setAvail(seg.value)}
              className={cn(
                'px-2.5 py-1 text-12 font-medium transition-colors',
                i > 0 && 'border-l border-border',
                cell.avail === seg.value ? seg.active : 'bg-surface text-text-muted hover:bg-surface-muted',
              )}
            >
              {seg.label}
            </button>
          ))}
        </div>
      </div>

      {/* '조율 가능'일 때만 조건 + 메모 노출 */}
      {cell.avail === 'maybe' && (
        <div className="flex flex-col gap-2 rounded-md bg-surface-muted p-2.5">
          <span className="text-12 font-medium text-text">어떤 조건이면 될까요?</span>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {presets.map((p) => {
              const checked = (cell.conditions ?? []).includes(p.id);
              return (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleCondition(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') toggleCondition(p.id);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-left text-12 text-text hover:bg-surface"
                >
                  <span className="pointer-events-none">
                    <Checkbox checked={checked} onChange={() => undefined} />
                  </span>
                  <span>{p.label}</span>
                </div>
              );
            })}
          </div>
          <Input
            size="sm"
            value={cell.note ?? ''}
            onChange={(e) => onChange({ ...cell, note: e.target.value })}
            placeholder="직접 입력 (예: 오전 외근, 오후 늦게면 가능)"
          />
        </div>
      )}
    </div>
  );
}

type RespondDrawerProps = Omit<OverlayProps, 'onConfirm'> & {
  member: Member;
  onConfirm?: (responses: Record<string, CellResponse>) => void;
};

export function RespondDrawer({ member, onConfirm, onCancel, ...restProps }: RespondDrawerProps) {
  const [draft, setDraft] = useState<Record<string, CellResponse>>(() =>
    Object.fromEntries(SLOTS.map((s) => [s.id, getResponse(INITIAL_RESPONSES, member.id, s.id)])),
  );

  const setCell = (slotId: string, next: CellResponse) =>
    setDraft((prev) => ({ ...prev, [slotId]: next }));

  return (
    <Overlay.Template
      {...restProps}
      type="drawer-horizontal"
      size="md"
      title={`${member.name}님, 언제 가능하세요?`}
      description="캘린더 기반으로 미리 채워뒀어요. 틀린 것만 바꾸면 돼요."
      showDim
      closeOnDimClick
      onCancel={onCancel}
      onConfirm={() => onConfirm?.(draft)}
      cancelUI="취소"
      confirmUI="응답 저장"
    >
      <div className="flex flex-col gap-2.5 pt-3">
        {SLOTS.map((slot) => (
          <SlotRow key={slot.id} slot={slot} cell={draft[slot.id]} onChange={(n) => setCell(slot.id, n)} />
        ))}
      </div>
    </Overlay.Template>
  );
}
