import { useState, type ReactNode } from 'react';
import { Button, RefreshIcon, cn } from '@thakicloud/shared';
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
  onProfileClick?: () => void;
  onRefresh?: () => void;
  currentUser?: AvatarMember;
  children: ReactNode;
};

export function AppShell({
  activeNav = 'meetings',
  primaryLabel = '회의 잡기',
  onPrimaryAction,
  onNavHome,
  onProfileClick,
  onRefresh,
  currentUser,
  children,
}: AppShellProps) {
  const [spinning, setSpinning] = useState(false);
  const [toast, setToast] = useState(false);

  const handleRefresh = () => {
    setSpinning(true);
    setToast(true);
    onRefresh?.();
    window.setTimeout(() => setSpinning(false), 700);
    window.setTimeout(() => setToast(false), 1800);
  };

  return (
    <div className="flex min-h-full flex-col bg-surface-muted">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center gap-4 px-4 sm:gap-8 sm:px-6">
          {/* 워드마크 */}
          <button type="button" onClick={onNavHome} className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-14 font-bold text-white">
              d
            </span>
            <span className="text-18 font-bold tracking-tight text-text">dayfix</span>
          </button>

          {/* 내비게이션 */}
          <nav className="hidden items-center gap-1 sm:flex">
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
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              aria-label="새로고침"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
            >
              <span className={cn('flex', spinning && 'animate-spin')}>
                <RefreshIcon size="sm" />
              </span>
            </button>
            <Button variant="primary" size="sm" onClick={onPrimaryAction}>
              {primaryLabel}
            </Button>
            {currentUser && (
              <button
                type="button"
                onClick={onProfileClick}
                className="rounded-full transition-transform hover:scale-105"
                aria-label="내 고정 스케줄"
              >
                <Avatar member={currentUser} size="sm" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[1100] -translate-x-1/2 rounded-lg bg-text px-4 py-2 text-13 font-medium text-surface shadow-modal">
          이미 최신이에요
        </div>
      )}
    </div>
  );
}
