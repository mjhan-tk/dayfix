import { cn } from '@thakicloud/shared';
import type { Member } from '@/lib/mock';

type AvatarSize = 'xs' | 'sm' | 'md';

const SIZE_MAP: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-12',
  md: 'h-10 w-10 text-14',
};

type AvatarProps = {
  member: Member;
  size?: AvatarSize;
  className?: string;
};

/** TDS에 Avatar가 없어 이니셜 원형으로 구현. 색은 멤버별 토큰 hex 사용. */
export function Avatar({ member, size = 'sm', className }: AvatarProps) {
  const initial = member.name.slice(-2);
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white ring-2 ring-surface',
        SIZE_MAP[size],
        className,
      )}
      style={{ backgroundColor: member.color }}
      title={`${member.name} · ${member.role}`}
    >
      {initial}
    </span>
  );
}

type AvatarGroupProps = {
  members: Member[];
  max?: number;
  size?: AvatarSize;
};

export function AvatarGroup({ members, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible = members.slice(0, max);
  const overflow = members.length - visible.length;
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visible.map((m) => (
          <Avatar key={m.id} member={m} size={size} />
        ))}
      </div>
      {overflow > 0 && (
        <span className="ml-2 text-12 font-medium text-text-muted">+{overflow}</span>
      )}
    </div>
  );
}
