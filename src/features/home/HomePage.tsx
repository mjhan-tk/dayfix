import { useMemo } from 'react';
import { Badge, Button, Typography } from '@thakicloud/shared';
import { AppShell } from '@/components/AppShell';
import { Avatar, AvatarGroup } from '@/components/Avatar';
import { getMemberById, CURRENT_USER_ID } from '@/lib/scheduling';
import { COORD_ITEMS, UPCOMING, type CoordItem, type UpcomingMeeting } from '@/lib/home';

function UpcomingRow({ meeting }: { meeting: UpcomingMeeting }) {
  const members = meeting.participantIds
    .map((id) => getMemberById(id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex w-16 shrink-0 flex-col border-r border-border pr-4">
        <span className="text-12 font-medium text-text-muted">{meeting.dayLabel}</span>
        <span className="text-14 font-semibold text-text">{meeting.time.split(' – ')[0]}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-14 font-semibold text-text">{meeting.title}</span>
        <span className="text-12 text-text-muted">{meeting.location}</span>
      </div>
      <AvatarGroup members={members} max={4} size="xs" />
    </div>
  );
}

function CoordCard({ item, onOpen }: { item: CoordItem; onOpen: () => void }) {
  const by = item.byId ? getMemberById(item.byId) : undefined;

  if (item.kind === 'invite') {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-surface p-4">
        <div className="flex items-start gap-3">
          {by && <Avatar member={by} size="sm" />}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-13 font-semibold text-text">{item.title}</span>
            <span className="text-12 text-text-muted">
              {by?.name}님이 {item.meta}
            </span>
          </div>
          <Badge theme="blu" size="sm">
            새 초대
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={onOpen}>
            응답하기
          </Button>
          <Button variant="secondary" appearance="outline" size="sm">
            나중에
          </Button>
        </div>
      </div>
    );
  }

  if (item.kind === 'progress') {
    const pct = item.total ? Math.round(((item.responded ?? 0) / item.total) * 100) : 0;
    return (
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full flex-col gap-2 rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-primary/40"
      >
        <div className="flex items-center justify-between">
          <span className="text-13 font-medium text-text">{item.title}</span>
          <span className="text-12 text-text-muted">
            {item.responded}/{item.total} 응답
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
      </button>
    );
  }

  // respond / confirm
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen();
      }}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-primary/40"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-13 font-medium text-text">{item.title}</span>
        <span className="text-12 text-text-muted">
          {item.kind === 'confirm' ? item.meta : `주최 ${by?.name ?? '-'}`}
        </span>
      </div>
      {item.kind === 'respond' && item.deadline && (
        <Badge theme={item.deadlineUrgent ? 'red' : 'gry'} size="sm">
          {item.deadline}
        </Badge>
      )}
      {item.kind === 'confirm' && (
        <Button variant="primary" size="sm">
          확정
        </Button>
      )}
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-13 font-semibold text-text-muted">{title}</span>
        {hint && <span className="text-11 text-text-muted">{hint}</span>}
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

export function HomePage({
  onOpenMeeting,
  onCreate,
}: {
  onOpenMeeting: () => void;
  onCreate: () => void;
}) {
  const me = getMemberById(CURRENT_USER_ID)!;
  const today = useMemo(() => UPCOMING.filter((m) => m.group === 'today'), []);
  const week = useMemo(() => UPCOMING.filter((m) => m.group === 'week'), []);

  const invites = COORD_ITEMS.filter((c) => c.kind === 'invite');
  const responds = COORD_ITEMS.filter((c) => c.kind === 'respond');
  const confirms = COORD_ITEMS.filter((c) => c.kind === 'confirm');
  const progresses = COORD_ITEMS.filter((c) => c.kind === 'progress');

  return (
    <AppShell activeNav="meetings" primaryLabel="새 회의" onPrimaryAction={onCreate} currentUser={me}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Typography.Title level={2}>안녕하세요, {me.name}님</Typography.Title>
          <Typography.Text variant="paragraph" color="text-muted">
            오늘 일정과 조율 중인 회의를 한눈에 확인하세요.
          </Typography.Text>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
          {/* 예정된 일정 */}
          <div className="flex flex-col gap-6">
            <Section title="예정된 일정 · 오늘">
              {today.map((m) => (
                <UpcomingRow key={m.id} meeting={m} />
              ))}
            </Section>
            <Section title="이번 주">
              {week.map((m) => (
                <UpcomingRow key={m.id} meeting={m} />
              ))}
            </Section>
          </div>

          {/* 조율 인박스 */}
          <div className="flex flex-col gap-6">
            {invites.length > 0 && (
              <Section title="조율 초대">
                {invites.map((c) => (
                  <CoordCard key={c.id} item={c} onOpen={onOpenMeeting} />
                ))}
              </Section>
            )}
            {responds.length > 0 && (
              <Section title="내 응답 대기" hint="내가 응답해야 일정이 잡혀요">
                {responds.map((c) => (
                  <CoordCard key={c.id} item={c} onOpen={onOpenMeeting} />
                ))}
              </Section>
            )}
            {confirms.length > 0 && (
              <Section title="확정할 수 있어요">
                {confirms.map((c) => (
                  <CoordCard key={c.id} item={c} onOpen={onOpenMeeting} />
                ))}
              </Section>
            )}
            {progresses.length > 0 && (
              <Section title="진행 중인 조율">
                {progresses.map((c) => (
                  <CoordCard key={c.id} item={c} onOpen={onOpenMeeting} />
                ))}
              </Section>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
