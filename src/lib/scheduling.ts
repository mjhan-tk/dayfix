// dayfix 핵심 도메인: 정해진 범위(이번 주 월~금)의 모든 시간대를 열어 응답받고,
// 그 전체 가용성을 집계해 추천/히트맵으로 보여준다.
//  - 가용성 3단계: 가능(yes) / 조율 가능(maybe) / 불가(no)
//  - 선택참여(optional)는 후순위(가중치 낮음)

export type Role = 'required' | 'optional';
export type Avail = 'yes' | 'maybe' | 'no';

export type Member = {
  id: string;
  name: string;
  role: Role;
  color: string;
  context?: string;
  isOrganizer?: boolean;
};

export type CellResponse = {
  avail: Avail;
  conditions?: string[];
  note?: string;
};

/** memberId -> slotId -> 응답(오버라이드). 없으면 규칙 기반 기본값 사용 */
export type Responses = Record<string, Record<string, CellResponse>>;

export const CURRENT_USER_ID = 'u2'; // 김도현 시점

export const MEMBERS: Member[] = [
  { id: 'u1', name: '한민정', role: 'required', color: '#2563eb', context: '주최자', isOrganizer: true },
  { id: 'u2', name: '김도현', role: 'required', color: '#7c3aed', context: '점심 직후 비선호' },
  { id: 'u3', name: '이서연', role: 'required', color: '#0891b2' },
  { id: 'u4', name: '최유나', role: 'required', color: '#db2777' },
  { id: 'u5', name: '박지훈', role: 'optional', color: '#ea580c', context: '화·목 외근' },
  { id: 'u6', name: '정우성', role: 'optional', color: '#16a34a' },
];

export function getMemberById(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

/** 가용성 응답을 마친 멤버 (나머지는 응답 대기) */
export const RESPONDED_IDS = new Set(['u1', 'u2', 'u3', 'u4']);

export function hasResponded(id: string): boolean {
  return RESPONDED_IDS.has(id);
}

// ──────────────────────────────────────────────────────────────
// 주간 그리드 (요일 × 시간) — 범위의 모든 시간대를 연다
// ──────────────────────────────────────────────────────────────

export const WEEK_DAYS = [
  { key: '월', date: 7 },
  { key: '화', date: 8 },
  { key: '수', date: 9 },
  { key: '목', date: 10 },
  { key: '금', date: 11 },
] as const;

/** 업무 시간 (12시 점심 제외) */
export const HOURS = [9, 10, 11, 13, 14, 15, 16, 17];

export type Slot = {
  id: string;
  dayKey: string;
  date: number;
  hour: number;
  dateLabel: string;
};

export const ALL_SLOTS: Slot[] = WEEK_DAYS.flatMap((d) =>
  HOURS.map((hour) => ({
    id: `${d.key}-${hour}`,
    dayKey: d.key,
    date: d.date,
    hour,
    dateLabel: `7/${d.date} (${d.key})`,
  })),
);

function formatHour(h: number): string {
  const period = h < 12 ? '오전' : '오후';
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${display}:00`;
}

/** 회의 길이 1시간 기준 "오전 10:00 - 오전 11:00" */
export function slotTimeRange(slot: Slot): string {
  return `${formatHour(slot.hour)} - ${formatHour(slot.hour + 1)}`;
}

export function hourLabel(hour: number): string {
  return formatHour(hour);
}

// ──────────────────────────────────────────────────────────────
// 규칙 기반 기본 가용성 — 각 멤버의 일정/선호를 패턴으로 생성
// ──────────────────────────────────────────────────────────────

const YES: CellResponse = { avail: 'yes' };

function generateAvail(memberId: string, slot: Slot): CellResponse {
  const { dayKey, hour } = slot;
  switch (memberId) {
    case 'u2': // 김도현 — 월 오전 외부미팅 · 점심 직후 비선호
      if (dayKey === '월' && hour <= 10) return { avail: 'no', note: '오전 외부 미팅' };
      if (hour === 13 || hour === 14)
        return { avail: 'maybe', conditions: ['avoid-lunch'], note: '점심 직후는 피하고 싶어요' };
      return YES;
    case 'u3': // 이서연 — 화 오전 외근 · 목 늦은 오후 빠듯 · 점심 직후 나른
      if (dayKey === '화' && hour <= 11) return { avail: 'no', note: '오전 외근' };
      if (dayKey === '목' && hour >= 16) return { avail: 'maybe', note: '앞뒤 일정 빠듯' };
      if (hour === 13) return { avail: 'maybe', note: '점심 직후 집중 어려움' };
      return YES;
    case 'u4': // 최유나 — 금 오전 반차 · 월 오후 집중업무 · 점심 직후 미팅 준비
      if (dayKey === '금' && hour <= 11) return { avail: 'no', note: '오전 반차' };
      if (dayKey === '월' && (hour === 15 || hour === 16))
        return { avail: 'maybe', note: '집중 업무 시간' };
      if (hour === 13) return { avail: 'maybe', note: '점심 직후 미팅 준비' };
      return YES;
    case 'u5': // 박지훈(선택) — 화·목 외근
      if (dayKey === '화') return { avail: 'no', note: '화요일 외근' };
      if (dayKey === '목' && hour <= 13) return { avail: 'no', note: '목요일 외근' };
      if (dayKey === '목' && hour >= 14)
        return { avail: 'maybe', conditions: ['remote'], note: '외근 복귀, 원격이면 가능' };
      return YES;
    case 'u6': // 정우성(선택) — 수 오전 개인 일정 · 금 늦은 오후 마무리
      if (dayKey === '수' && (hour === 10 || hour === 11)) return { avail: 'no', note: '개인 일정' };
      if (dayKey === '금' && hour >= 16) return { avail: 'maybe', note: '주말 전 마무리' };
      return YES;
    default: // 한민정 — 전부 가능
      return YES;
  }
}

export function getResponse(responses: Responses, memberId: string, slot: Slot): CellResponse {
  return responses[memberId]?.[slot.id] ?? generateAvail(memberId, slot);
}

// ──────────────────────────────────────────────────────────────
// '조율 가능' 조건 preset
// ──────────────────────────────────────────────────────────────

export type ConditionPreset = {
  id: string;
  label: string;
  appliesTo: (hour: number) => boolean;
};

export const CONDITION_PRESETS: ConditionPreset[] = [
  { id: 'morning', label: '오전이면 가능', appliesTo: (h) => h >= 13 },
  { id: 'afternoon', label: '오후면 가능', appliesTo: (h) => h < 12 },
  { id: 'avoid-lunch', label: '점심 직후(1–2시)만 피하면', appliesTo: (h) => h >= 13 && h <= 14 },
  { id: 'short', label: '30분이면 가능', appliesTo: () => true },
  { id: 'remote', label: '원격이면 가능', appliesTo: () => true },
];

export function conditionLabel(id: string): string {
  return CONDITION_PRESETS.find((p) => p.id === id)?.label ?? id;
}

// ──────────────────────────────────────────────────────────────
// 점수 집계 — 선택참여는 후순위(가중치↓)
// ──────────────────────────────────────────────────────────────

const ROLE_WEIGHT: Record<Role, number> = { required: 1, optional: 0.25 };
const AVAIL_VALUE: Record<Avail, number> = { yes: 1, maybe: 0.6, no: 0 };

export type SlotConflict = { member: Member; response: CellResponse };

export type ScoredSlot = {
  slot: Slot;
  score: number; // 0–100
  availableCount: number; // 가능(yes) 인원
  allRequiredAvailable: boolean;
  requiredBlocked: SlotConflict[];
  optionalBlocked: SlotConflict[];
  negotiable: SlotConflict[];
};

export function scoreSlots(members: Member[], slots: Slot[], responses: Responses): ScoredSlot[] {
  const totalWeight = members.reduce((sum, m) => sum + ROLE_WEIGHT[m.role], 0);

  return slots.map<ScoredSlot>((slot) => {
    let weighted = 0;
    let availableCount = 0;
    const requiredBlocked: SlotConflict[] = [];
    const optionalBlocked: SlotConflict[] = [];
    const negotiable: SlotConflict[] = [];

    for (const m of members) {
      const res = getResponse(responses, m.id, slot);
      weighted += AVAIL_VALUE[res.avail] * ROLE_WEIGHT[m.role];
      if (res.avail === 'yes') availableCount += 1;

      if (res.avail === 'no') {
        (m.role === 'required' ? requiredBlocked : optionalBlocked).push({ member: m, response: res });
      } else if (res.avail === 'maybe') {
        negotiable.push({ member: m, response: res });
      }
    }

    const allRequiredAvailable = members
      .filter((m) => m.role === 'required')
      .every((m) => getResponse(responses, m.id, slot).avail !== 'no');

    return {
      slot,
      score: Math.round((weighted / totalWeight) * 100),
      availableCount,
      allRequiredAvailable,
      requiredBlocked,
      optionalBlocked,
      negotiable,
    };
  });
}

/** 전체 격자에서 추천 상위 N개 (점수 → 이른 요일/시간 순) */
export function topSlots(scored: ScoredSlot[], n: number): ScoredSlot[] {
  return [...scored]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.slot.date !== b.slot.date) return a.slot.date - b.slot.date;
      return a.slot.hour - b.slot.hour;
    })
    .slice(0, n);
}
