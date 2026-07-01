import { Fragment, useState } from 'react';
import { cn, type OverlayProps } from '@thakicloud/shared';
import { ResponsiveDrawer } from '@/components/ResponsiveDrawer';
import {
  ALL_SLOTS,
  HOURS,
  WEEK_DAYS,
  getResponse,
  type Avail,
  type CellResponse,
  type Member,
} from '@/lib/scheduling';

const NEXT: Record<Avail, Avail> = { yes: 'maybe', maybe: 'no', no: 'yes' };

const CELL_STYLE: Record<Avail, { bg: string; text: string; label: string }> = {
  yes: { bg: 'rgba(22,163,74,0.9)', text: '#ffffff', label: '가능' },
  maybe: { bg: 'rgba(217,119,6,0.9)', text: '#ffffff', label: '조율' },
  no: { bg: '#EEF0F2', text: '#94a3b8', label: '불가' },
};

type RespondDrawerProps = Omit<OverlayProps, 'onConfirm'> & {
  member: Member;
  onConfirm?: (responses: Record<string, CellResponse>) => void;
};

export function RespondDrawer({ member, onConfirm, onCancel, ...restProps }: RespondDrawerProps) {
  const [draft, setDraft] = useState<Record<string, Avail>>(() =>
    Object.fromEntries(ALL_SLOTS.map((s) => [s.id, getResponse({}, member.id, s).avail])),
  );

  const cycle = (id: string) => setDraft((prev) => ({ ...prev, [id]: NEXT[prev[id]] }));

  const handleConfirm = () => {
    const result: Record<string, CellResponse> = {};
    for (const s of ALL_SLOTS) result[s.id] = { avail: draft[s.id] };
    onConfirm?.(result);
  };

  return (
    <ResponsiveDrawer
      {...restProps}
      title={`${member.name}님, 가능한 시간을 알려주세요`}
      description="칸을 눌러 가능 → 조율 → 불가로 바꿔요. 캘린더 기반으로 미리 채워뒀어요."
      onCancel={onCancel}
      onConfirm={handleConfirm}
      cancelUI="취소"
      confirmUI="응답 저장"
    >
      <div className="flex flex-col gap-3 pt-3">
        <div className="flex items-center gap-3 text-11 text-text-muted">
          {(['yes', 'maybe', 'no'] as Avail[]).map((a) => (
            <span key={a} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: CELL_STYLE[a].bg }} />
              {CELL_STYLE[a].label}
            </span>
          ))}
        </div>

        <div className="grid gap-1" style={{ gridTemplateColumns: '46px repeat(5, minmax(0, 1fr))' }}>
          <div />
          {WEEK_DAYS.map((d) => (
            <div key={d.key} className="flex flex-col items-center pb-1">
              <span className="text-12 font-semibold text-text">{d.key}</span>
              <span className="text-11 text-text-muted">7/{d.date}</span>
            </div>
          ))}

          {HOURS.map((hour) => (
            <Fragment key={hour}>
              <div className="flex items-center justify-end pr-1 text-11 text-text-muted">
                {hour}:00
              </div>
              {WEEK_DAYS.map((d) => {
                const id = `${d.key}-${hour}`;
                const avail = draft[id];
                const style = CELL_STYLE[avail];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => cycle(id)}
                    style={{ backgroundColor: style.bg, color: style.text }}
                    className={cn(
                      'flex h-9 w-full items-center justify-center rounded-md text-11 font-medium transition-transform active:scale-95',
                    )}
                  >
                    {style.label}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </ResponsiveDrawer>
  );
}
