import type { ReactNode } from 'react';
import { Button, Overlay, type OverlayProps } from '@thakicloud/shared';
import { useIsCompact } from '@/lib/useIsCompact';

// useOverlay 스토어가 주입하는 나머지 props(appeared 등)는 restProps로 데스크톱 Template에 전달
type ResponsiveDrawerProps = Omit<
  OverlayProps,
  'onConfirm' | 'title' | 'description' | 'confirmUI' | 'cancelUI'
> & {
  title: string;
  description?: string;
  confirmUI: string;
  cancelUI?: string;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  isLoading?: boolean;
  children: ReactNode;
};

// 데스크톱(웹): TDS drawer-horizontal · 태블릿+모바일: 페이지처럼 꽉 찬 전체화면 시트
export function ResponsiveDrawer({
  title,
  description,
  confirmUI,
  cancelUI = '취소',
  onConfirm,
  onCancel,
  confirmDisabled,
  isLoading,
  children,
  ...restProps
}: ResponsiveDrawerProps) {
  const isCompact = useIsCompact();

  if (!isCompact) {
    return (
      <Overlay.Template
        {...restProps}
        type="drawer-horizontal"
        size="md"
        title={title}
        description={description}
        showDim
        closeOnDimClick
        onCancel={() => onCancel?.()}
        onConfirm={() => onConfirm?.()}
        cancelUI={cancelUI}
        confirmUI={confirmUI}
        confirmDisabled={confirmDisabled}
        isLoading={isLoading}
      >
        {children}
      </Overlay.Template>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-surface">
      <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-18 font-bold text-text">{title}</h2>
          {description && <p className="text-13 text-text-muted">{description}</p>}
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="닫기"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
        >
          ✕
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

      <footer className="flex gap-2 border-t border-border px-5 py-3">
        <Button variant="secondary" appearance="outline" className="flex-1" onClick={onCancel}>
          {cancelUI}
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={onConfirm}
          disabled={confirmDisabled}
          isLoading={isLoading}
        >
          {confirmUI}
        </Button>
      </footer>
    </div>
  );
}
