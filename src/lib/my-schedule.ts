import { useSyncExternalStore } from 'react';
import { HOURS, WEEK_DAYS, type Avail } from './scheduling';

// 고정 스케줄 상태: 가능(default) / 기피(선호 안 함) / 불가(항상 불가)
export type FixedState = 'ok' | 'avoid' | 'busy';
export type FixedSchedule = Record<string, FixedState>;

// 데모 초기값: 점심 직후(13·14시) 기피, 나머지 가능
export function buildInitialSchedule(): FixedSchedule {
  const init: FixedSchedule = {};
  for (const d of WEEK_DAYS) {
    for (const h of HOURS) init[`${d.key}-${h}`] = h === 13 || h === 14 ? 'avoid' : 'ok';
  }
  return init;
}

// 고정 스케줄 → 응답 기본값: 가능→가능 / 기피→조율 / 불가→불가
export function fixedToAvail(state: FixedState): Avail {
  if (state === 'busy') return 'no';
  if (state === 'avoid') return 'maybe';
  return 'yes';
}

// 앱 전역 '내 고정 스케줄' — 저장하면 응답 프리필에 바로 반영된다.
let current: FixedSchedule = buildInitialSchedule();
const listeners = new Set<() => void>();

export function getMySchedule(): FixedSchedule {
  return current;
}
export function setMySchedule(next: FixedSchedule): void {
  current = next;
  listeners.forEach((notify) => notify());
}
function subscribe(notify: () => void): () => void {
  listeners.add(notify);
  return () => listeners.delete(notify);
}
export function useMySchedule(): FixedSchedule {
  return useSyncExternalStore(subscribe, getMySchedule, getMySchedule);
}
