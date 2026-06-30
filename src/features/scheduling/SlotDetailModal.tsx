import { Badge, Overlay, type OverlayProps } from '@thakicloud/shared';
import { Avatar } from '@/components/Avatar';
import { conditionLabel, slotTimeRange, type ScoredSlot, type SlotConflict } from '@/lib/scheduling';

function reasonText(c: SlotConflict): string {
  return c.response.conditions?.map(conditionLabel).join(', ') ?? c.response.note ?? '';
}

type SlotDetailModalProps = Omit<OverlayProps, 'onConfirm'> & {
  scored: ScoredSlot;
  onConfirm?: () => void;
};

export function SlotDetailModal({ scored, onConfirm, onCancel, ...restProps }: SlotDetailModalProps) {
  const { slot, requiredBlocked, optionalBlocked, negotiable } = scored;
  const blockedSet = new Set([...requiredBlocked, ...optionalBlocked]);
  const issues = [...requiredBlocked, ...negotiable, ...optionalBlocked];

  return (
    <Overlay.Template
      {...restProps}
      type="modal"
      size="sm"
      title={`${slot.dateLabel} · ${slotTimeRange(slot)}`}
      onConfirm={onConfirm}
      onCancel={onCancel}
      cancelUI="닫기"
      confirmUI="이 시간으로 확정"
    >
      <div className="flex flex-col gap-4 pt-1">
        <div className="flex flex-wrap gap-1.5">
          {requiredBlocked.length === 0 ? (
            <Badge theme="gre" size="sm">필수 전원 가능</Badge>
          ) : (
            <Badge theme="red" size="sm">필수 {requiredBlocked.length}명 불가</Badge>
          )}
          {negotiable.length > 0 && (
            <Badge theme="ylw" size="sm">조율 {negotiable.length}</Badge>
          )}
          {optionalBlocked.length > 0 && (
            <Badge theme="gry" size="sm">선택 {optionalBlocked.length}명 불가</Badge>
          )}
        </div>

        {issues.length === 0 ? (
          <p className="text-13 text-text-muted">참석자 모두 가능한 시간이에요. 바로 확정해도 좋아요.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {issues.map((c) => {
              const blocked = blockedSet.has(c);
              const reason = reasonText(c);
              return (
                <div key={c.member.id} className="flex items-start gap-2.5">
                  <Avatar member={c.member} size="sm" className={blocked ? 'opacity-50' : undefined} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 text-13 font-medium text-text">
                      {c.member.name}
                      {c.member.role === 'optional' && (
                        <span className="text-11 text-text-muted">선택</span>
                      )}
                      <Badge theme={blocked ? 'red' : 'ylw'} size="sm">
                        {blocked ? '불가' : '조율 가능'}
                      </Badge>
                    </span>
                    {reason && <span className="text-12 text-text-muted">{reason}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Overlay.Template>
  );
}
