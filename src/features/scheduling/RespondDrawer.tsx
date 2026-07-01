import { Fragment, useEffect, useRef, useState } from 'react';
import { RefreshIcon, Textarea, cn, type OverlayProps } from '@thakicloud/shared';
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
  // 캘린더 기반 초기 응답(되돌리기 기준)
  const initialDraft = (): Record<string, Avail> =>
    Object.fromEntries(ALL_SLOTS.map((s) => [s.id, getResponse({}, member.id, s).avail]));

  const [draft, setDraft] = useState<Record<string, Avail>>(initialDraft);
  const [memo, setMemo] = useState('');
  const [spinning, setSpinning] = useState(false);

  // 드래그: 지나는 칸을 각자 한 단계씩 순환. touched로 드래그당 칸마다 1회만 적용
  const dragging = useRef(false);
  const touched = useRef<Set<string>>(new Set());

  useEffect(() => {
    const end = () => {
      dragging.current = false;
    };
    window.addEventListener('mouseup', end);
    return () => window.removeEventListener('mouseup', end);
  }, []);

  const step = (id: string) => setDraft((prev) => ({ ...prev, [id]: NEXT[prev[id]] }));

  const startPaint = (id: string) => {
    dragging.current = true;
    touched.current = new Set([id]);
    step(id);
  };
  const paintOver = (id: string) => {
    if (!dragging.current || touched.current.has(id)) return;
    touched.current.add(id);
    step(id);
  };

  const reset = () => {
    setDraft(initialDraft());
    setMemo('');
    setSpinning(true);
    window.setTimeout(() => setSpinning(false), 500);
  };

  const handleConfirm = () => {
    const result: Record<string, CellResponse> = {};
    for (const s of ALL_SLOTS) {
      result[s.id] = { avail: draft[s.id], ...(memo.trim() ? { note: memo.trim() } : {}) };
    }
    onConfirm?.(result);
  };

  return (
    <ResponsiveDrawer
      {...restProps}
      title={`${member.name}님, 가능한 시간을 알려주세요`}
      description="드래그해 가능·조율·불가를 표시하세요."
      onCancel={onCancel}
      onConfirm={handleConfirm}
      cancelUI="취소"
      confirmUI="응답 저장"
    >
      <div className="flex flex-col gap-5 pt-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-11 text-text-muted">
            <div className="flex items-center gap-3">
              {(['yes', 'maybe', 'no'] as Avail[]).map((a) => (
                <span key={a} className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: CELL_STYLE[a].bg }} />
                  {CELL_STYLE[a].label}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1 text-text-muted transition-colors hover:text-text"
            >
              <span className={cn('flex', spinning && 'animate-spin')}>
                <RefreshIcon size="xs" />
              </span>
              되돌리기
            </button>
          </div>

          <div
            className="grid select-none gap-1"
            style={{ gridTemplateColumns: '46px repeat(5, minmax(0, 1fr))' }}
          >
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
                      onMouseDown={() => startPaint(id)}
                      onMouseOver={() => paintOver(id)}
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

        <div className="flex flex-col gap-1.5">
          <span className="text-13 font-medium text-text">
            메모 <span className="font-normal text-text-muted">(선택)</span>
          </span>
          <Textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            placeholder="예: 화·목은 외근이라 오전만 가능해요"
          />
        </div>
      </div>
    </ResponsiveDrawer>
  );
}
