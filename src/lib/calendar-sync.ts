// 외부 캘린더 연동 (프로토타입) — Google / Outlook / Apple
import { useSyncExternalStore } from 'react';

export type CalProvider = 'google' | 'outlook' | 'apple';

export const CAL_PROVIDERS: Record<
  CalProvider,
  { name: string; short: string; color: string; url: string }
> = {
  google: { name: 'Google Calendar', short: 'G', color: '#4285F4', url: 'https://calendar.google.com' },
  outlook: { name: 'Outlook', short: 'O', color: '#0F6CBD', url: 'https://outlook.office.com/calendar' },
  apple: { name: 'Apple 캘린더', short: '', color: '#111111', url: 'https://www.icloud.com/calendar' },
};

// 현재 연동된 캘린더 (프로토타입: 기본 Google 연동). 연결/해제하면 UI에 반영.
let connected: CalProvider | null = 'google';
const listeners = new Set<() => void>();

export function getConnectedCalendar(): CalProvider | null {
  return connected;
}
export function setConnectedCalendar(next: CalProvider | null): void {
  connected = next;
  listeners.forEach((notify) => notify());
}
function subscribe(notify: () => void): () => void {
  listeners.add(notify);
  return () => listeners.delete(notify);
}
export function useConnectedCalendar(): CalProvider | null {
  return useSyncExternalStore(subscribe, getConnectedCalendar, getConnectedCalendar);
}
