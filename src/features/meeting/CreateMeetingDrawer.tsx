import { useMemo, useState } from 'react';
import {
  Badge,
  Checkbox,
  Dropdown,
  FormField,
  Input,
  Overlay,
  Textarea,
  cn,
  type OverlayProps,
} from '@thakicloud/shared';
import { Avatar } from '@/components/Avatar';
import { MEMBERS, SUGGESTED_SLOTS, type SuggestedSlot } from '@/lib/mock';

type CreateMeetingDrawerProps = Omit<OverlayProps, 'onConfirm'> & {
  onConfirm?: (payload: { title: string; participantIds: string[]; slotId: string }) => void;
};

const DURATIONS = [
  { value: '30', label: '30분' },
  { value: '60', label: '1시간' },
  { value: '90', label: '1시간 30분' },
];

function availabilityTheme(a: number): 'gre' | 'ylw' | 'red' {
  if (a >= 90) return 'gre';
  if (a >= 70) return 'ylw';
  return 'red';
}

function SlotCard({
  slot,
  selected,
  onSelect,
}: {
  slot: SuggestedSlot;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors',
        selected
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-border bg-surface hover:border-primary/40',
      )}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-14 font-semibold text-text">
          {slot.dateLabel} · {slot.timeLabel}
        </span>
        <span className="text-12 text-text-muted">
          {slot.conflictCount === 0 ? '전원 가능' : `${slot.conflictCount}명 일정 충돌`}
        </span>
      </div>
      <Badge theme={availabilityTheme(slot.availability)} size="sm">
        {slot.availability}%
      </Badge>
    </button>
  );
}

export function CreateMeetingDrawer({ onConfirm, onCancel, ...restProps }: CreateMeetingDrawerProps) {
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [duration, setDuration] = useState('60');
  const [participantIds, setParticipantIds] = useState<string[]>(['u1']);
  const [slotId, setSlotId] = useState<string>(SUGGESTED_SLOTS[0].id);

  const toggleParticipant = (id: string) => {
    setParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const canSubmit = useMemo(
    () => title.trim().length > 0 && participantIds.length > 0,
    [title, participantIds],
  );

  return (
    <Overlay.Template
      {...restProps}
      type="drawer-horizontal"
      size="md"
      title="회의 잡기"
      description="참석자와 시간을 정하면 모두가 가능한 시간을 추천해드려요."
      showDim
      closeOnDimClick
      onCancel={onCancel}
      onConfirm={() => onConfirm?.({ title, participantIds, slotId })}
      cancelUI="취소"
      confirmUI="회의 만들기"
      confirmDisabled={!canSubmit}
    >
      <div className="flex flex-col gap-6 pt-3">
        <FormField label="회의 제목" required>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 디자인 시스템 스프린트 킥오프"
          />
        </FormField>

        <FormField label="아젠다" hint="회의에서 다룰 내용을 적어주세요 (선택)">
          <Textarea
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            rows={3}
            placeholder="안건을 적어주세요"
          />
        </FormField>

        <FormField label="소요 시간">
          <Dropdown.Select value={duration} onChange={(v) => setDuration(String(v))}>
            {DURATIONS.map((d) => (
              <Dropdown.Option key={d.value} value={d.value} label={d.label} />
            ))}
          </Dropdown.Select>
        </FormField>

        <FormField label={`참석자 (${participantIds.length}명)`} required>
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-1">
            {MEMBERS.map((m) => {
              const checked = participantIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleParticipant(m.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors',
                    checked ? 'bg-primary/5' : 'hover:bg-surface-muted',
                  )}
                >
                  <Checkbox checked={checked} onChange={() => toggleParticipant(m.id)} />
                  <Avatar member={m} size="sm" />
                  <span className="flex flex-1 flex-col">
                    <span className="text-13 font-medium text-text">{m.name}</span>
                    <span className="text-11 text-text-muted">{m.role}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </FormField>

        <div className="flex flex-col gap-2">
          <span className="text-13 font-medium text-text">추천 시간</span>
          <p className="text-12 text-text-muted">
            선택한 참석자들의 캘린더를 기준으로 모두가 가능한 시간을 추천해요.
          </p>
          <div className="mt-1 flex flex-col gap-2">
            {SUGGESTED_SLOTS.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                selected={slotId === slot.id}
                onSelect={() => setSlotId(slot.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </Overlay.Template>
  );
}
