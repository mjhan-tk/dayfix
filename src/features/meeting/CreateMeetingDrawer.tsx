import { useState } from 'react';
import { Dropdown, FormField, Input, cn, type OverlayProps } from '@thakicloud/shared';
import { Avatar } from '@/components/Avatar';
import { ResponsiveDrawer } from '@/components/ResponsiveDrawer';
import { CURRENT_USER_ID, MEMBERS, getMemberById, type Role } from '@/lib/scheduling';
import type { NewMeetingInput } from '@/lib/home';
import { DateCalendar } from './DateCalendar';

// 30분 단위, 최대 8시간(법정 1일 근로시간)
function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}
const LENGTH_OPTIONS = Array.from({ length: 16 }, (_, i) => {
  const min = (i + 1) * 30;
  return { value: String(min), label: formatMinutes(min) };
});

type CreateMeetingDrawerProps = Omit<OverlayProps, 'onConfirm'> & {
  onConfirm?: (meeting: NewMeetingInput) => void;
};

export function CreateMeetingDrawer({ onConfirm, onCancel, ...restProps }: CreateMeetingDrawerProps) {
  const [title, setTitle] = useState('');
  const [pickedDates, setPickedDates] = useState<string[]>([]);
  const [duration, setDuration] = useState('60');
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([CURRENT_USER_ID]);
  const [roles, setRoles] = useState<Record<string, Role>>({ [CURRENT_USER_ID]: 'required' });

  const q = query.trim();
  // 포커스 시 검색어가 없으면 미선택 멤버 전체를 보여준다.
  const results = MEMBERS.filter(
    (m) => !selectedIds.includes(m.id) && (q === '' || m.name.includes(q)),
  );
  const showResults = (searchFocused || q !== '') && results.length > 0;

  const addParticipant = (id: string) => {
    setSelectedIds((prev) => [...prev, id]);
    setRoles((prev) => ({ ...prev, [id]: getMemberById(id)?.role ?? 'required' }));
    setQuery('');
  };
  const removeParticipant = (id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const canSubmit = title.trim().length > 0 && selectedIds.length > 0;

  return (
    <ResponsiveDrawer
      {...restProps}
      title="새 회의 만들기"
      description="기본 정보를 입력하면 모두 가능한 시간을 추천해드려요."
      onCancel={onCancel}
      onConfirm={() => onConfirm?.({ title: title.trim(), total: selectedIds.length })}
      cancelUI="취소"
      confirmUI="만들기"
      confirmDisabled={!canSubmit}
    >
      <div className="flex flex-col gap-6 pt-3">
        <FormField label="회의 제목" required>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 디자인 시스템 킥오프"
          />
        </FormField>

        <div className="flex flex-col gap-1.5">
          <span className="text-13 font-medium text-text">조율할 날짜</span>
          <DateCalendar value={pickedDates} onChange={setPickedDates} />
        </div>

        <FormField label="회의 길이">
          <Dropdown.Select value={duration} onChange={(v) => setDuration(String(v))}>
            {LENGTH_OPTIONS.map((o) => (
              <Dropdown.Option key={o.value} value={o.value} label={o.label} />
            ))}
          </Dropdown.Select>
        </FormField>

        <div className="flex flex-col gap-2">
          <span className="text-13 font-medium text-text">참석자 · 필수 / 선택</span>

          <div className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
              placeholder="이름으로 검색하거나 클릭해서 추가"
            />
            {showResults && (
              <div className="absolute z-10 mt-1 flex max-h-60 w-full flex-col gap-0.5 overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-dropdown">
                {results.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addParticipant(m.id)}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-muted"
                  >
                    <Avatar member={m} size="xs" />
                    <span className="flex-1 text-13 text-text">{m.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            {selectedIds.map((id) => {
              const m = getMemberById(id);
              if (!m) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2"
                >
                  <Avatar member={m} size="sm" />
                  <span className="flex-1 truncate text-13 text-text">{m.name}</span>
                  <div className="flex overflow-hidden rounded-md border border-border">
                    {(['required', 'optional'] as Role[]).map((r, i) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRoles((prev) => ({ ...prev, [id]: r }))}
                        className={cn(
                          'px-2.5 py-1 text-12 font-medium transition-colors',
                          i > 0 && 'border-l border-border',
                          roles[id] === r ? 'bg-primary text-white' : 'text-text-muted hover:bg-surface-muted',
                        )}
                      >
                        {r === 'required' ? '필수' : '선택'}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeParticipant(id)}
                    aria-label={`${m.name} 삭제`}
                    className="flex h-6 w-6 items-center justify-center rounded text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ResponsiveDrawer>
  );
}
