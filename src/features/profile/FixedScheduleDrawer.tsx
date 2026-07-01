import { Fragment, useEffect, useRef, useState } from 'react';
import { RefreshIcon, cn, type OverlayProps } from '@thakicloud/shared';
import { ResponsiveDrawer } from '@/components/ResponsiveDrawer';
import { HOURS, WEEK_DAYS } from '@/lib/scheduling';

// 고정 스케줄 상태: 가능(default) / 기피(이 시간대 회의 선호 안 함) / 불가(항상 불가)
type FixedState = 'ok' | 'avoid' | 'busy';

const NEXT: Record<FixedState, FixedState> = { ok: 'avoid', avoid: 'busy', busy: 'ok' };

const STYLE: Record<FixedState, { bg: string; text: string; label: string }> = {
  ok: { bg: 'transparent', text: '#94a3b8', label: '' },
  avoid: { bg: '#ECC58A', text: '#7C3A06', label: '기피' },
  busy: { bg: '#E2E5E9', text: '#64748b', label: '불가' },
};

// 데모 초기값: 점심 직후(13·14시) 기피, 나머지 가능
function buildInitial(): Record<string, FixedState> {
  const init: Record<string, FixedState> = {};
  for (const d of WEEK_DAYS) {
    for (const h of HOURS) init[`${d.key}-${h}`] = h === 13 || h === 14 ? 'avoid' : 'ok';
  }
  return init;
}

type FixedScheduleDrawerProps = Omit<OverlayProps, 'onConfirm'> & {
  onConfirm?: () => void;
};

export function FixedScheduleDrawer({ onConfirm, onCancel, ...restProps }: FixedScheduleDrawerProps) {
  const [draft, setDraft] = useState<Record<string, FixedState>>(buildInitial);
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
    setDraft(buildInitial());
    setSpinning(true);
    window.setTimeout(() => setSpinning(false), 500);
  };

  return (
    <ResponsiveDrawer
      {...restProps}
      title="내 고정 스케줄"
      description="반복되는 일정·선호를 등록해두세요."
      onCancel={onCancel}
      onConfirm={() => onConfirm?.()}
      cancelUI="취소"
      confirmUI="저장"
    >
      <div className="flex flex-col gap-3 pt-3">
        <div className="flex items-center justify-between text-11 text-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm border border-border" /> 가능
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: STYLE.avoid.bg }} /> 기피
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: STYLE.busy.bg }} /> 불가
            </span>
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
            </div>
          ))}

          {HOURS.map((hour) => (
            <Fragment key={hour}>
              <div className="flex items-center justify-end pr-1 text-11 text-text-muted">
                {hour}:00
              </div>
              {WEEK_DAYS.map((d) => {
                const id = `${d.key}-${hour}`;
                const state = draft[id];
                const style = STYLE[state];
                return (
                  <button
                    key={id}
                    type="button"
                    onMouseDown={() => startPaint(id)}
                    onMouseOver={() => paintOver(id)}
                    style={{ backgroundColor: style.bg, color: style.text }}
                    className={cn(
                      'flex h-9 w-full items-center justify-center rounded-md text-11 font-medium transition-transform active:scale-95',
                      state === 'ok' && 'border border-border',
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
