import { useMemo, useState } from 'react';
import {
  AdjustmentsAltIcon,
  Badge,
  Button,
  CheckIcon,
  ContextMenu,
  Typography,
  useOverlay,
} from '@thakicloud/shared';
import { AppShell } from '@/components/AppShell';
import { getMemberById, CURRENT_USER_ID } from '@/lib/scheduling';
import { RespondDrawer } from '@/features/scheduling/RespondDrawer';
import { sortCoord, type CoordMeeting, type CoordSort } from '@/lib/home';
import { UpcomingPanel } from './UpcomingPanel';

// 잉크(어두운 무채색) 버튼 — TDS엔 dark solid 변형이 없어 디자인 토큰으로 입힌다.
const INK_BUTTON_STYLE: React.CSSProperties = {
  backgroundColor: 'var(--semantic-color-text)',
  borderColor: 'var(--semantic-color-text)',
  color: 'var(--semantic-color-surface)',
};

// 미정(조율 중) 카드 한 종류 — dot·진행·버튼 위계로 항목이 자기 상태를 설명한다.
function CoordCard({
  item,
  onOpen,
  onRespond,
}: {
  item: CoordMeeting;
  onOpen: () => void;
  onRespond: () => void;
}) {
  const by = getMemberById(item.byId);
  const isMine = item.byId === CURRENT_USER_ID;
  const pct = Math.round((item.responded / item.total) * 100);
  const showNewDot = Boolean(item.isNew) && !item.iResponded;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen();
      }}
      className="flex cursor-pointer flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="flex items-center gap-1.5">
            {showNewDot && (
              <span
                className="inline-flex h-4 min-w-[16px] shrink-0 items-center justify-center rounded bg-primary px-1 text-[10px] font-bold leading-none text-white"
                aria-label="새 초대"
              >
                N
              </span>
            )}
            <span className="truncate text-13 font-semibold text-text">{item.title}</span>
          </span>
          <span className="text-12 text-text-muted">
            {isMine ? '내가 주최' : `주최 ${by?.name ?? '-'}`}
          </span>
        </div>
        {item.deadline && (
          <Badge theme={item.deadlineUrgent ? 'red' : 'gry'} size="sm">
            {item.deadline}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full rounded-full bg-text-muted" style={{ width: `${pct}%` }} />
          </div>
          <span className="shrink-0 text-11 text-text-muted">
            {item.responded}/{item.total} 응답
          </span>
        </div>
        {item.canConfirm ? (
          <Button variant="secondary" appearance="outline" size="sm" style={INK_BUTTON_STYLE}>
            확정하기
          </Button>
        ) : !item.iResponded ? (
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRespond();
            }}
          >
            응답하기
          </Button>
        ) : (
          <Button
            variant="secondary"
            appearance="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRespond();
            }}
          >
            응답 수정
          </Button>
        )}
      </div>
    </div>
  );
}

const SORT_OPTIONS: { id: CoordSort; label: string }[] = [
  { id: 'recent', label: '최신순' },
  { id: 'deadline', label: '마감순' },
];

function SortMenu({ sort, onChange }: { sort: CoordSort; onChange: (s: CoordSort) => void }) {
  return (
    <ContextMenu.Root
      direction="bottom-end"
      trigger={({ toggle }) => (
        <Button variant="secondary" appearance="ghost" size="icon-only" onClick={toggle} aria-label="정렬">
          <AdjustmentsAltIcon size="sm" />
        </Button>
      )}
    >
      {SORT_OPTIONS.map((opt) => (
        <ContextMenu.Item key={opt.id} action={() => onChange(opt.id)}>
          <span className="flex items-center gap-2">
            <CheckIcon size="xs" className={sort === opt.id ? 'opacity-100' : 'opacity-0'} />
            {opt.label}
          </span>
        </ContextMenu.Item>
      ))}
    </ContextMenu.Root>
  );
}

function Section({
  title,
  hint,
  right,
  children,
}: {
  title: string;
  hint?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-13 font-semibold text-text-muted">{title}</span>
          {hint && <span className="text-11 text-text-muted">{hint}</span>}
        </div>
        {right}
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

export function HomePage({
  coord,
  onOpenMeeting,
  onCreate,
  onProfile,
}: {
  coord: CoordMeeting[];
  onOpenMeeting: () => void;
  onCreate: () => void;
  onProfile: () => void;
}) {
  const { openOverlay } = useOverlay();
  const me = getMemberById(CURRENT_USER_ID)!;
  const [sort, setSort] = useState<CoordSort>('recent');
  const sortedList = useMemo(() => sortCoord(coord, sort), [coord, sort]);

  const handleRespond = () => {
    void openOverlay({
      component: RespondDrawer,
      props: { member: me },
      options: { type: 'drawer-horizontal', size: 'md' },
    });
  };

  return (
    <AppShell
      activeNav="meetings"
      primaryLabel="새 회의"
      onPrimaryAction={onCreate}
      onProfileClick={onProfile}
      currentUser={me}
    >
      <div className="flex flex-col gap-6">
        <Typography.Title level={3}>안녕하세요, {me.name}님</Typography.Title>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
          {/* 정해진 것 — 예정된 일정 (리스트 / 주간 / 캘린더 뷰) */}
          <UpcomingPanel />

          {/* 미정 — 조율 중 (한 리스트) */}
          <div className="flex flex-col gap-6">
            <Section title="조율 중" right={<SortMenu sort={sort} onChange={setSort} />}>
              {sortedList.map((c) => (
                <CoordCard key={c.id} item={c} onOpen={onOpenMeeting} onRespond={handleRespond} />
              ))}
            </Section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
