// dayfix 핵심 도메인: 6명이 다음 주 중 1시간 회의를 잡는 시나리오.
// 설계 원칙
//  - 가용성은 3단계: 가능(yes) / 조율 가능(maybe) / 불가(no)
//  - 선택참여(optional) 멤버의 사정은 "후순위"로 점수에 반영 (가중치 낮음)

export type Role = 'required' | 'optional';
export type Avail = 'yes' | 'maybe' | 'no';

export type Member = {
  id: string;
  name: string;
  role: Role;
  color: string;
  /** 동료의 맥락을 한눈에 보여주는 짧은 태그 (예: '화·목 외근') */
  context?: string;
  isOrganizer?: boolean;
};

export type Slot = {
  id: string;
  day: string;
  dateLabel: string;
  time: string;
  /** 정렬·조건 필터에 쓰는 시작 시각 (24h) */
  hour: number;
};

export type CellResponse = {
  avail: Avail;
  /** '조율 가능'일 때 선택한 조건 preset id 들 */
  conditions?: string[];
  /** 주관식 메모 */
  note?: string;
};

/** memberId -> slotId -> 응답 */
export type Responses = Record<string, Record<string, CellResponse>>;

// ──────────────────────────────────────────────────────────────
// 시나리오 데이터
// ──────────────────────────────────────────────────────────────

export const CURRENT_USER_ID = 'u2'; // 김도현 (점심 직후를 피하고 싶은 사람) 시점으로 응답 데모

export const MEMBERS: Member[] = [
  { id: 'u1', name: '한민정', role: 'required', color: '#2563eb', context: '주최자', isOrganizer: true },
  { id: 'u2', name: '김도현', role: 'required', color: '#7c3aed', context: '점심 직후 비선호' },
  { id: 'u3', name: '이서연', role: 'required', color: '#0891b2' },
  { id: 'u4', name: '최유나', role: 'required', color: '#db2777' },
  { id: 'u5', name: '박지훈', role: 'optional', color: '#ea580c', context: '화·목 외근' },
  { id: 'u6', name: '정우성', role: 'optional', color: '#16a34a' },
];

export const SLOTS: Slot[] = [
  { id: 's1', day: '월', dateLabel: '7/7 (월)', time: '오전 10:00', hour: 10 },
  { id: 's2', day: '월', dateLabel: '7/7 (월)', time: '오후 3:00', hour: 15 },
  { id: 's3', day: '화', dateLabel: '7/8 (화)', time: '오전 11:00', hour: 11 },
  { id: 's4', day: '수', dateLabel: '7/9 (수)', time: '오전 10:00', hour: 10 },
  { id: 's5', day: '수', dateLabel: '7/9 (수)', time: '오후 2:00', hour: 14 },
  { id: 's6', day: '목', dateLabel: '7/10 (목)', time: '오후 1:00', hour: 13 },
  { id: 's7', day: '목', dateLabel: '7/10 (목)', time: '오후 4:00', hour: 16 },
  { id: 's8', day: '금', dateLabel: '7/11 (금)', time: '오전 11:00', hour: 11 },
];

// yes는 기본값이라 생략, non-yes만 명시
export const INITIAL_RESPONSES: Responses = {
  u1: { s2: { avail: 'maybe', note: '앞 회의 끝나고 바로라 빠듯' } },
  u2: {
    s1: { avail: 'no', note: '오전 외부 미팅' },
    s5: { avail: 'maybe', conditions: ['avoid-lunch'], note: '점심 직후라 집중 어려워요' },
    s6: { avail: 'maybe', conditions: ['avoid-lunch'], note: '점심 직후는 피하고 싶어요' },
  },
  u3: {
    s3: { avail: 'no', note: '기존 회의' },
    s7: { avail: 'maybe', note: '앞뒤 일정 빠듯' },
  },
  u4: {
    s2: { avail: 'maybe', note: '월요일 오후 집중업무' },
    s8: { avail: 'no', note: '오전 반차' },
  },
  u5: {
    s3: { avail: 'no', note: '화요일 외근' },
    s6: { avail: 'no', note: '목요일 외근' },
    s7: { avail: 'maybe', conditions: ['remote'], note: '외근 복귀 직후, 원격이면 가능' },
  },
  u6: {
    s1: { avail: 'maybe', note: '오전 집중 시간' },
    s4: { avail: 'no', note: '개인 일정' },
  },
};

export function getResponse(responses: Responses, memberId: string, slotId: string): CellResponse {
  return responses[memberId]?.[slotId] ?? { avail: 'yes' };
}

export function getMemberById(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

// ──────────────────────────────────────────────────────────────
// '조율 가능' 조건 preset — 슬롯 맥락에 맞는 것만 노출 (예측)
// ──────────────────────────────────────────────────────────────

export type ConditionPreset = {
  id: string;
  label: string;
  /** 이 슬롯에서 보여줄지 여부 */
  appliesTo: (slot: Slot) => boolean;
};

export const CONDITION_PRESETS: ConditionPreset[] = [
  { id: 'morning', label: '오전이면 가능', appliesTo: (s) => s.hour >= 13 },
  { id: 'afternoon', label: '오후면 가능', appliesTo: (s) => s.hour < 12 },
  { id: 'avoid-lunch', label: '점심 직후(1–2시)만 피하면', appliesTo: (s) => s.hour >= 13 && s.hour <= 14 },
  { id: 'short', label: '30분이면 가능', appliesTo: () => true },
  { id: 'late-start', label: '5–10분 늦게 시작하면', appliesTo: () => true },
  { id: 'remote', label: '원격이면 가능(외근)', appliesTo: () => true },
  { id: 'if-needed', label: '꼭 필요하면 맞출게요', appliesTo: () => true },
];

export function presetsForSlot(slot: Slot): ConditionPreset[] {
  return CONDITION_PRESETS.filter((p) => p.appliesTo(slot)).slice(0, 6);
}

export function conditionLabel(id: string): string {
  return CONDITION_PRESETS.find((p) => p.id === id)?.label ?? id;
}

// ──────────────────────────────────────────────────────────────
// 점수 알고리즘 — 선택참여는 후순위(가중치↓)
// ──────────────────────────────────────────────────────────────

const ROLE_WEIGHT: Record<Role, number> = { required: 1, optional: 0.25 };
const AVAIL_VALUE: Record<Avail, number> = { yes: 1, maybe: 0.6, no: 0 };

export type SlotConflict = { member: Member; response: CellResponse };

export type ScoredSlot = {
  slot: Slot;
  score: number; // 0–100
  allRequiredAvailable: boolean;
  requiredBlocked: SlotConflict[];
  optionalBlocked: SlotConflict[];
  negotiable: SlotConflict[]; // maybe (필수+선택)
};

export function scoreSlots(members: Member[], slots: Slot[], responses: Responses): ScoredSlot[] {
  const totalWeight = members.reduce((sum, m) => sum + ROLE_WEIGHT[m.role], 0);

  const scored = slots.map<ScoredSlot>((slot) => {
    let weighted = 0;
    const requiredBlocked: SlotConflict[] = [];
    const optionalBlocked: SlotConflict[] = [];
    const negotiable: SlotConflict[] = [];

    for (const m of members) {
      const res = getResponse(responses, m.id, slot.id);
      weighted += AVAIL_VALUE[res.avail] * ROLE_WEIGHT[m.role];

      if (res.avail === 'no') {
        (m.role === 'required' ? requiredBlocked : optionalBlocked).push({ member: m, response: res });
      } else if (res.avail === 'maybe') {
        negotiable.push({ member: m, response: res });
      }
    }

    const allRequiredAvailable = members
      .filter((m) => m.role === 'required')
      .every((m) => getResponse(responses, m.id, slot.id).avail !== 'no');

    return {
      slot,
      score: Math.round((weighted / totalWeight) * 100),
      allRequiredAvailable,
      requiredBlocked,
      optionalBlocked,
      negotiable,
    };
  });

  // 점수 내림차순, 동점이면 필수 전원 가능 우선
  return scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return Number(b.allRequiredAvailable) - Number(a.allRequiredAvailable);
  });
}
