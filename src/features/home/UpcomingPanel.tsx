import { useMemo, useState } from 'react';
import { CalendarEventIcon, CalendarIcon, cn, ListIcon } from '@thakicloud/shared';
import { AvatarGroup } from '@/components/Avatar';
import { getMemberById } from '@/lib/scheduling';
import { CAL, UPCOMING, WEEKDAY_LABELS, weekdayOf, type UpcomingMeeting } from '@/lib/home';

type UpcomingView = 'list' | 'week' | 'month';

const VIEW_OPTIONS: { id: UpcomingView; label: string; Icon: typeof ListIcon }[] = [
  { id: 'list', label: '리스트', Icon: ListIcon },
  { id: 'week', label: '주간', Icon: CalendarEventIcon },
  { id: 'month', label: '캘린더', Icon: CalendarIcon },
];

function membersOf(meeting: UpcomingMeeting) {
  return meeting.participantIds
    .map((id) => getMemberById(id))
    .filter((m): m is NonNullable<ReturnType<typeof getMemberById>> => Boolean(m));
}

function MeetingRow({ meeting, compact }: { meeting: UpcomingMeeting; compact?: boolean }) {
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
      {!compact && <AvatarGroup members={membersOf(meeting)} max={4} size="xs" />}
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-13 font-semibold text-text-muted">{children}</span>;
}

// ── 리스트 뷰 — 오늘 / 이번 주 ──
function ListView() {
  const today = UPCOMING.filter((m) => m.dateNum === CAL.today);
  const week = UPCOMING.filter((m) => m.dateNum !== CAL.today);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <GroupLabel>오늘</GroupLabel>
        <div className="flex flex-col gap-2.5">
          {today.map((m) => (
            <MeetingRow key={m.id} meeting={m} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <GroupLabel>이번 주</GroupLabel>
        <div className="flex flex-col gap-2.5">
          {week.map((m) => (
            <MeetingRow key={m.id} meeting={m} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 주간 뷰 — 이번 주 월~금, 빈 날도 표시 ──
function WeekView() {
  return (
    <div className="flex flex-col gap-2.5">
      {CAL.weekDays.map((dateNum) => {
        const meetings = UPCOMING.filter((m) => m.dateNum === dateNum);
        const isToday = dateNum === CAL.today;
        const wd = WEEKDAY_LABELS[weekdayOf(dateNum)];
        return (
          <div key={dateNum} className="flex gap-3 rounded-xl border border-border bg-surface p-3">
            <div className="flex w-12 shrink-0 flex-col items-center justify-center">
              <span className="text-11 text-text-muted">{wd}</span>
              <span
                className={`text-15 font-semibold ${isToday ? 'flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white' : 'text-text'}`}
              >
                {dateNum}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
              {meetings.length > 0 ? (
                meetings.map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <span className="text-12 font-medium text-text-muted">
                      {m.time.split(' – ')[0]}
                    </span>
                    <span className="truncate text-13 font-medium text-text">{m.title}</span>
                  </div>
                ))
              ) : (
                <span className="text-12 text-text-muted">일정 없음</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 캘린더(월) 뷰 — 일정 있는 날에 dot ──
function MonthView() {
  const meetingDays = useMemo(() => new Set(UPCOMING.map((m) => m.dateNum)), []);
  const cells: (number | null)[] = [
    ...Array.from({ length: CAL.firstWeekday }, () => null),
    ...Array.from({ length: CAL.daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="mb-3 text-14 font-semibold text-text">{CAL.monthLabel}</p>
      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAY_LABELS.map((wd) => (
          <span key={wd} className="pb-1 text-center text-11 text-text-muted">
            {wd}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`b${i}`} />;
          const isToday = day === CAL.today;
          const hasMeeting = meetingDays.has(day);
          return (
            <div key={day} className="flex flex-col items-center gap-0.5 py-1">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-13 ${
                  isToday ? 'bg-primary font-semibold text-white' : 'text-text'
                }`}
              >
                {day}
              </span>
              <span
                className={`h-1 w-1 rounded-full ${hasMeeting && !isToday ? 'bg-primary' : 'bg-transparent'}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ViewSwitcher({ view, onChange }: { view: UpcomingView; onChange: (v: UpcomingView) => void }) {
  return (
    <div className="flex items-center gap-1">
      {VIEW_OPTIONS.map((opt) => {
        const active = view === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-13 font-medium transition-colors',
              active ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text',
            )}
          >
            <opt.Icon size="xs" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function UpcomingPanel() {
  const [view, setView] = useState<UpcomingView>('list');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-13 font-semibold text-text-muted">예정된 일정</span>
        <ViewSwitcher view={view} onChange={setView} />
      </div>
      {view === 'list' && <ListView />}
      {view === 'week' && <WeekView />}
      {view === 'month' && <MonthView />}
    </div>
  );
}
