import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  EmptyUI,
  StatusIndicator,
  Tab,
  Tabs,
  Typography,
} from '@thakicloud/shared';
import { AvatarGroup } from '@/components/Avatar';
import {
  MEETINGS,
  getMember,
  type Meeting,
  type MeetingStatus,
} from '@/lib/mock';

const STATUS_META: Record<
  MeetingStatus,
  { label: string; variant: 'active' | 'pending' | 'suspended'; theme: 'gre' | 'ylw' | 'gry' }
> = {
  confirmed: { label: '확정', variant: 'active', theme: 'gre' },
  pending: { label: '응답 대기', variant: 'pending', theme: 'ylw' },
  completed: { label: '완료', variant: 'suspended', theme: 'gry' },
};

type StatCard = {
  key: string;
  label: string;
  value: number;
  hint: string;
};

function StatCards({ meetings }: { meetings: Meeting[] }) {
  const stats: StatCard[] = useMemo(() => {
    const upcoming = meetings.filter((m) => m.status !== 'completed');
    const awaiting = meetings.reduce((sum, m) => sum + m.awaitingCount, 0);
    const today = meetings.filter((m) => m.dateLabel.startsWith('오늘')).length;
    return [
      { key: 'upcoming', label: '예정된 회의', value: upcoming.length, hint: '확정 + 대기' },
      { key: 'awaiting', label: '응답 대기 인원', value: awaiting, hint: '아직 미응답' },
      { key: 'today', label: '오늘 회의', value: today, hint: '오늘 일정' },
      { key: 'total', label: '전체 회의', value: meetings.length, hint: '이번 주' },
    ];
  }, [meetings]);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.key}
          className="rounded-xl border border-border bg-surface p-4"
        >
          <p className="text-13 font-medium text-text-muted">{s.label}</p>
          <p className="mt-2 text-28 font-bold leading-none text-text">{s.value}</p>
          <p className="mt-1.5 text-12 text-text-muted">{s.hint}</p>
        </div>
      ))}
    </div>
  );
}

function MeetingRow({ meeting }: { meeting: Meeting }) {
  const meta = STATUS_META[meeting.status];
  const organizer = getMember(meeting.organizerId);
  const participants = meeting.participantIds
    .map((id) => getMember(id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/40">
      {/* 날짜 블록 */}
      <div className="flex w-24 shrink-0 flex-col items-start gap-0.5 border-r border-border pr-4">
        <span className="text-12 font-medium text-text-muted">{meeting.dateLabel.split(' · ')[0]}</span>
        <span className="text-14 font-semibold text-text">
          {meeting.timeLabel.split(' – ')[0]}
        </span>
        <span className="text-11 text-text-muted">{meeting.durationMin}분</span>
      </div>

      {/* 본문 */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <StatusIndicator variant={meta.variant} layout="iconOnly" />
          <span className="truncate text-15 font-semibold text-text">{meeting.title}</span>
        </div>
        <div className="flex items-center gap-2 text-12 text-text-muted">
          <span>{meeting.location}</span>
          <span aria-hidden>·</span>
          <span>주최 {organizer?.name ?? '-'}</span>
          {meeting.awaitingCount > 0 && (
            <>
              <span aria-hidden>·</span>
              <span className="text-warning">{meeting.awaitingCount}명 응답 대기</span>
            </>
          )}
        </div>
      </div>

      {/* 참석자 + 상태 */}
      <div className="flex shrink-0 items-center gap-4">
        <AvatarGroup members={participants} max={4} />
        <Badge theme={meta.theme} size="sm">
          {meta.label}
        </Badge>
        <Button variant="secondary" appearance="outline" size="sm">
          상세
        </Button>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'upcoming', label: '예정' },
  { id: 'past', label: '지난' },
  { id: 'all', label: '전체' },
] as const;

export function MeetingDashboard({ onCreateMeeting }: { onCreateMeeting?: () => void }) {
  const [activeTab, setActiveTab] = useState<string>('upcoming');

  const filtered = useMemo(() => {
    if (activeTab === 'upcoming') return MEETINGS.filter((m) => m.status !== 'completed');
    if (activeTab === 'past') return MEETINGS.filter((m) => m.status === 'completed');
    return MEETINGS;
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-6">
      {/* 페이지 헤더 */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <Typography.Title level={2}>회의</Typography.Title>
          <Typography.Text variant="paragraph" color="text-muted">
            팀의 회의 일정을 한눈에 보고, 모두가 가능한 시간을 빠르게 잡으세요.
          </Typography.Text>
        </div>
        <Button variant="primary" size="md" onClick={onCreateMeeting}>
          회의 잡기
        </Button>
      </div>

      <StatCards meetings={MEETINGS} />

      {/* 목록 */}
      <div className="flex flex-col gap-4">
        <Tabs activeTabId={activeTab} onChange={setActiveTab} size="sm">
          {TABS.map((t) => (
            <Tab key={t.id} id={t.id} label={t.label}>
              <div className="flex flex-col gap-2.5 pt-4">
                {filtered.length > 0 ? (
                  filtered.map((m) => <MeetingRow key={m.id} meeting={m} />)
                ) : (
                  <EmptyUI
                    content={{
                      title: '회의가 없어요',
                      description: '새 회의를 잡아 팀과 시간을 맞춰보세요.',
                    }}
                  />
                )}
              </div>
            </Tab>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
