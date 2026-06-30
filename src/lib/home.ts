// 홈(메인) 화면용 mock: 정해진 것(예정 일정) + 미정인 것(조율 중) — 두 묶음.

export type UpcomingMeeting = {
  id: string;
  title: string;
  time: string;
  location: string;
  group: 'today' | 'week';
  dayLabel: string;
  /** 이번 달 일(day-of-month) */
  dateNum: number;
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
    dateNum: 6,
    participantIds: ['u1', 'u2', 'u3', 'u4'],
  },
  {
    id: 'up2',
    title: '디자인 1:1',
    time: '오후 4:30 – 5:00',
    location: 'Google Meet',
    group: 'today',
    dayLabel: '오늘',
    dateNum: 6,
    participantIds: ['u1', 'u4'],
  },
  {
    id: 'up3',
    title: '디자인 리뷰',
    time: '오전 10:00 – 11:00',
    location: '회의실 C · 5F',
    group: 'week',
    dayLabel: '수',
    dateNum: 8,
    participantIds: ['u2', 'u3', 'u6'],
  },
  {
    id: 'up4',
    title: '스프린트 회고',
    time: '오후 4:00 – 5:00',
    location: '회의실 A · 7F',
    group: 'week',
    dayLabel: '목',
    dateNum: 9,
    participantIds: ['u1', 'u2', 'u3', 'u4', 'u5'],
  },
];

// 프로토타입용 달력 상수 (7월, 1일이 수요일이라 가정 · 오늘 = 6일 월요일)
export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

export const CAL = {
  monthLabel: '7월',
  daysInMonth: 31,
  /** 1일의 요일 (0=일 … 3=수) */
  firstWeekday: 3,
  today: 6,
  /** 이번 주 월~금 일자 */
  weekDays: [6, 7, 8, 9, 10],
};

/** 일(day-of-month) → 요일 인덱스(0=일) */
export function weekdayOf(dateNum: number): number {
  return (CAL.firstWeekday + dateNum - 1) % 7;
}

// ── 미정(조율 중) — 섹션 없이 한 리스트. 각 항목이 배지·진행·버튼으로 자기를 설명 ──

export type CoordSort = 'recent' | 'deadline';

export type CoordMeeting = {
  id: string;
  title: string;
  byId: string;
  responded: number;
  total: number;
  /** 내가 가용성을 응답했는가 */
  iResponded: boolean;
  /** 내가 주최 + 확정 가능한가 */
  canConfirm: boolean;
  /** 새(미확인) 초대 — 아직 응답 안 했을 때만 의미 */
  isNew?: boolean;
  /** 최신순 정렬 키 (클수록 최근) */
  addedAt: number;
  deadline?: string;
  deadlineUrgent?: boolean;
  /** 마감까지 남은 일수 (없으면 마감 없음) */
  deadlineDays?: number;
};

const COORD: CoordMeeting[] = [
  { id: 'k1', title: '디자인 시스템 킥오프', byId: 'u2', responded: 5, total: 6, iResponded: true, canConfirm: true, addedAt: 2 },
  { id: 'k3', title: '주간 프로덕트 싱크', byId: 'u4', responded: 4, total: 6, iResponded: false, canConfirm: false, addedAt: 4, deadline: '내일 마감', deadlineUrgent: true, deadlineDays: 1 },
  { id: 'k2', title: 'API 스펙 리뷰', byId: 'u5', responded: 3, total: 6, iResponded: false, canConfirm: false, addedAt: 5, isNew: true },
  { id: 'k4', title: '스프린트 회고', byId: 'u1', responded: 2, total: 6, iResponded: false, canConfirm: false, addedAt: 1, deadline: '3일 남음', deadlineDays: 3 },
  { id: 'k5', title: '프로젝트 라운드업', byId: 'u2', responded: 4, total: 6, iResponded: true, canConfirm: false, addedAt: 3 },
];

/** 최신순(추가 역순) 또는 마감순(임박 우선, 마감 없는 건 뒤로) */
export function sortedCoord(mode: CoordSort): CoordMeeting[] {
  const list = [...COORD];
  if (mode === 'deadline') {
    return list.sort((a, b) => {
      const ad = a.deadlineDays ?? Infinity;
      const bd = b.deadlineDays ?? Infinity;
      if (ad !== bd) return ad - bd;
      return b.addedAt - a.addedAt;
    });
  }
  return list.sort((a, b) => b.addedAt - a.addedAt);
}
