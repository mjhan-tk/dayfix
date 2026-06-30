// 프로토타입용 mock 데이터. 실제 API 연동 전까지 화면 구성을 위한 더미.

export type Member = {
  id: string;
  name: string;
  role: string;
  /** 아바타 배경 토큰 색 (TDS 팔레트 기반 hex) */
  color: string;
};

export type MeetingStatus = 'confirmed' | 'pending' | 'completed';

export type Meeting = {
  id: string;
  title: string;
  /** 사람이 읽는 날짜 라벨 (프로토타입에서는 문자열로 고정) */
  dateLabel: string;
  timeLabel: string;
  durationMin: number;
  location: string;
  status: MeetingStatus;
  organizerId: string;
  participantIds: string[];
  /** 아직 응답하지 않은 인원 수 */
  awaitingCount: number;
};

export const MEMBERS: Member[] = [
  { id: 'u1', name: '한민정', role: 'Product Designer', color: '#2563eb' },
  { id: 'u2', name: '김도현', role: 'Frontend', color: '#7c3aed' },
  { id: 'u3', name: '이서연', role: 'Backend', color: '#0891b2' },
  { id: 'u4', name: '박지훈', role: 'PM', color: '#db2777' },
  { id: 'u5', name: '최유나', role: 'QA', color: '#ea580c' },
  { id: 'u6', name: '정우성', role: 'Data', color: '#16a34a' },
  { id: 'u7', name: '강하늘', role: 'DevOps', color: '#ca8a04' },
];

export const MEETINGS: Meeting[] = [
  {
    id: 'm1',
    title: '디자인 시스템 스프린트 킥오프',
    dateLabel: '오늘 · 6월 30일 (월)',
    timeLabel: '오후 2:00 – 3:00',
    durationMin: 60,
    location: '회의실 A · 7F',
    status: 'confirmed',
    organizerId: 'u1',
    participantIds: ['u1', 'u2', 'u3', 'u4'],
    awaitingCount: 0,
  },
  {
    id: 'm2',
    title: '주간 프로덕트 싱크',
    dateLabel: '내일 · 7월 1일 (화)',
    timeLabel: '오전 10:30 – 11:00',
    durationMin: 30,
    location: 'Google Meet',
    status: 'pending',
    organizerId: 'u4',
    participantIds: ['u1', 'u4', 'u5', 'u6', 'u7'],
    awaitingCount: 2,
  },
  {
    id: 'm3',
    title: 'API 스펙 리뷰',
    dateLabel: '7월 2일 (수)',
    timeLabel: '오후 4:00 – 5:00',
    durationMin: 60,
    location: '회의실 C · 5F',
    status: 'pending',
    organizerId: 'u3',
    participantIds: ['u2', 'u3', 'u6'],
    awaitingCount: 1,
  },
  {
    id: 'm4',
    title: '6월 회고',
    dateLabel: '6월 27일 (금)',
    timeLabel: '오후 5:00 – 6:00',
    durationMin: 60,
    location: '회의실 A · 7F',
    status: 'completed',
    organizerId: 'u4',
    participantIds: ['u1', 'u2', 'u3', 'u4', 'u5'],
    awaitingCount: 0,
  },
];

export function getMember(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

/** 회의 잡기 드로어에서 보여줄 추천 슬롯 mock */
export type SuggestedSlot = {
  id: string;
  dateLabel: string;
  timeLabel: string;
  /** 0~100, 참석 가능 비율 */
  availability: number;
  conflictCount: number;
};

export const SUGGESTED_SLOTS: SuggestedSlot[] = [
  { id: 's1', dateLabel: '7월 1일 (화)', timeLabel: '오전 10:00', availability: 100, conflictCount: 0 },
  { id: 's2', dateLabel: '7월 1일 (화)', timeLabel: '오후 2:00', availability: 86, conflictCount: 1 },
  { id: 's3', dateLabel: '7월 2일 (수)', timeLabel: '오전 11:00', availability: 71, conflictCount: 2 },
];
