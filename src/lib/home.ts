// 홈(메인) 화면용 mock: 예정된 일정(캘린더 통합) + 조율 인박스.

export type UpcomingMeeting = {
  id: string;
  title: string;
  time: string;
  location: string;
  group: 'today' | 'week';
  dayLabel: string;
  participantIds: string[];
};

export const UPCOMING: UpcomingMeeting[] = [
  {
    id: 'up1',
    title: '디자인 시스템 킥오프',
    time: '오후 2:00 – 3:00',
    location: '회의실 A · 7F',
    group: 'today',
    dayLabel: '오늘',
    participantIds: ['u1', 'u2', 'u3', 'u4'],
  },
  {
    id: 'up2',
    title: '디자인 1:1',
    time: '오후 4:30 – 5:00',
    location: 'Google Meet',
    group: 'today',
    dayLabel: '오늘',
    participantIds: ['u1', 'u4'],
  },
  {
    id: 'up3',
    title: '디자인 리뷰',
    time: '오전 10:00 – 11:00',
    location: '회의실 C · 5F',
    group: 'week',
    dayLabel: '수',
    participantIds: ['u2', 'u3', 'u6'],
  },
  {
    id: 'up4',
    title: '스프린트 회고',
    time: '오후 4:00 – 5:00',
    location: '회의실 A · 7F',
    group: 'week',
    dayLabel: '목',
    participantIds: ['u1', 'u2', 'u3', 'u4', 'u5'],
  },
];

export type CoordKind = 'invite' | 'respond' | 'confirm' | 'progress';

export type CoordItem = {
  id: string;
  kind: CoordKind;
  title: string;
  /** 주최자 / 초대한 사람 */
  byId?: string;
  meta?: string;
  /** respond: 마감 정보 */
  deadline?: string;
  deadlineUrgent?: boolean;
  /** confirm / progress: 응답 현황 */
  responded?: number;
  total?: number;
};

export const COORD_ITEMS: CoordItem[] = [
  {
    id: 'c1',
    kind: 'invite',
    title: 'API 스펙 리뷰',
    byId: 'u5',
    meta: '회의 시간을 조율하고 있어요',
  },
  {
    id: 'c2',
    kind: 'respond',
    title: '주간 프로덕트 싱크',
    byId: 'u4',
    deadline: '내일 마감',
    deadlineUrgent: true,
  },
  {
    id: 'c3',
    kind: 'respond',
    title: '스프린트 회고',
    byId: 'u1',
    deadline: '3일 남음',
  },
  {
    id: 'c4',
    kind: 'confirm',
    title: '디자인 시스템 킥오프',
    responded: 5,
    total: 6,
    meta: '응답이 모였어요 · 확정 가능',
  },
  {
    id: 'c5',
    kind: 'progress',
    title: 'API 스펙 리뷰',
    responded: 3,
    total: 6,
  },
];
