import type { ReactNode } from 'react';
import { Button, cn } from '@thakicloud/shared';
import { Avatar, type AvatarMember } from './Avatar';

const NAV_ITEMS = [
  { id: 'meetings', label: '회의' },
  { id: 'calendar', label: '캘린더' },
  { id: 'members', label: '멤버' },
];

type AppShellProps = {
  activeNav?: string;
  primaryLabel?: string;
  onPrimaryAction?: () => void;
  onNavHome?: () => void;
  currentUser?: AvatarMember;
  children: ReactNode;
};

export function AppShell({
  activeNav = 'meetings',
  primaryLabel = '회의 잡기',
  onPrimaryAction,
  onNavHome,
  currentUser,
  children,
}: AppShellProps) {

  return (
    <div className="flex min-h-full flex-col bg-surface-muted">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center gap-8 px-6">
          {/* 워드마크 */}
          <button type="button" onClick={onNavHome} className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-14 font-bold text-white">
              d
            </span>
            <span className="text-18 font-bold tracking-tight text-text">dayfix</span>
          </button>

          {/* 내비게이션 */}
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.id === 'meetings' ? onNavHome : undefined}
                className={cn(
                  'rounded-md px-3 py-1.5 text-14 font-medium transition-colors',
                  item.id === activeNav
                    ? 'bg-surface-muted text-text'
                    : 'text-text-muted hover:text-text',
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* 우측 액션 */}
          <div className="ml-auto flex items-center gap-3">
            <Button variant="primary" size="sm" onClick={onPrimaryAction}>
              {primaryLabel}
            </Button>
            {currentUser && <Avatar member={currentUser} size="sm" />}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
