import { Fragment, useEffect, useRef, useState } from 'react';
import { RefreshIcon, cn, type OverlayProps } from '@thakicloud/shared';
import { ResponsiveDrawer } from '@/components/ResponsiveDrawer';
import { HOURS, WEEK_DAYS } from '@/lib/scheduling';
import { getMySchedule, setMySchedule, type FixedState } from '@/lib/my-schedule';
import {
  CAL_PROVIDERS,
  setConnectedCalendar,
  useConnectedCalendar,
  type CalProvider,
} from '@/lib/calendar-sync';

const NEXT: Record<FixedState, FixedState> = { ok: 'avoid', avoid: 'busy', busy: 'ok' };

const STYLE: Record<FixedState, { bg: string; text: string; label: string }> = {
  ok: { bg: 'transparent', text: '#94a3b8', label: '' },
  avoid: { bg: '#ECC58A', text: '#7C3A06', label: '기피' },
  busy: { bg: '#E2E5E9', text: '#64748b', label: '불가' },
};

type FixedScheduleDrawerProps = Omit<OverlayProps, 'onConfirm'> & {
  onConfirm?: () => void;
};

export function FixedScheduleDrawer({ onConfirm, onCancel, ...restProps }: FixedScheduleDrawerProps) {
  const [draft, setDraft] = useState<Record<string, FixedState>>(() => ({ ...getMySchedule() }));
  const [spinning, setSpinning] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const connected = useConnectedCalendar();

  const handleSave = () => {
    setMySchedule({ ...draft });
    onConfirm?.();
  };

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
    setDraft({ ...getMySchedule() });
    setSpinning(true);
    window.setTimeout(() => setSpinning(false), 500);
  };

  return (
    <ResponsiveDrawer
      {...restProps}
      title="내 고정 스케줄"
      description="반복되는 일정·선호를 등록해두세요."
      onCancel={onCancel}
      onConfirm={handleSave}
      cancelUI="취소"
      confirmUI="저장"
    >
      <div className="flex flex-col gap-3 pt-3">
        {/* 외부 캘린더 연동 */}
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            {connected ? (
              <span
                className="flex h-6 w-6 items-center justify-center rounded-md text-11 font-bold text-white"
                style={{ backgroundColor: CAL_PROVIDERS[connected].color }}
              >
                {CAL_PROVIDERS[connected].short || '📅'}
              </span>
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-surface text-text-muted">
                📅
              </span>
            )}
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-12 font-medium text-text">
                {connected ? `${CAL_PROVIDERS[connected].name} 연동됨` : '연동된 캘린더 없음'}
              </span>
              <span className="text-11 text-text-muted">기존 일정을 자동으로 불러와 응답에 반영해요</span>
            </div>
            <button
              type="button"
              onClick={() => setShowConnect((v) => !v)}
              className="shrink-0 text-11 text-text-muted transition-colors hover:text-text"
            >
              {showConnect ? '닫기' : '관리'}
            </button>
          </div>

          {showConnect && (
            <div className="flex flex-col gap-0.5 border-t border-border pt-2">
              {(['google', 'outlook', 'apple'] as CalProvider[]).map((p) => {
                const isConn = connected === p;
                return (
                  <div key={p} className="flex items-center gap-2.5 rounded-md px-1 py-1.5">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white"
                      style={{ backgroundColor: CAL_PROVIDERS[p].color }}
                    >
                      {CAL_PROVIDERS[p].short || '📅'}
                    </span>
                    <span className="flex-1 text-12 text-text">{CAL_PROVIDERS[p].name}</span>
                    {isConn ? (
                      <button
                        type="button"
                        onClick={() => setConnectedCalendar(null)}
                        className="rounded-md px-2 py-0.5 text-11 font-medium text-text-muted transition-colors hover:text-text"
                      >
                        연결됨
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConnectedCalendar(p)}
                        className="rounded-md bg-primary px-2 py-0.5 text-11 font-medium text-white"
                      >
                        연결
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
