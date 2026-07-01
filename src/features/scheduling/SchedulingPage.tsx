import { useMemo, useState } from 'react';
import { Button, CheckIcon, Typography, useOverlay } from '@thakicloud/shared';
import { AppShell } from '@/components/AppShell';
import { Avatar } from '@/components/Avatar';
import {
  ALL_SLOTS,
  CURRENT_USER_ID,
  MEMBERS,
  RESPONDED_IDS,
  getMemberById,
  hasResponded,
  scoreSlots,
  slotTimeRange,
  topSlots,
  type CellResponse,
  type Responses,
  type ScoredSlot,
} from '@/lib/scheduling';
import { AvailabilityHeatmap } from './AvailabilityHeatmap';
import { RespondDrawer } from './RespondDrawer';
import { SlotDetailModal } from './SlotDetailModal';
import { SlotRanking } from './SlotRanking';

export function SchedulingPage({
  onBack,
  onCreate,
  onProfile,
}: {
  onBack?: () => void;
  onCreate?: () => void;
  onProfile?: () => void;
}) {
  const { openOverlay } = useOverlay();
  const [responses, setResponses] = useState<Responses>({});
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>();
  const [confirmedSlotId, setConfirmedSlotId] = useState<string | undefined>();
  const [savedHint, setSavedHint] = useState(false);

  // 집계·추천은 실제 응답한 사람만 반영(미응답자 기본값으로 인원을 부풀리지 않음)
  const respondedMembers = useMemo(() => MEMBERS.filter((m) => hasResponded(m.id)), []);
  const votingComplete = respondedMembers.length === MEMBERS.length;
  const scored = useMemo(
    () => scoreSlots(respondedMembers, ALL_SLOTS, responses),
    [respondedMembers, responses],
  );
  const top = useMemo(() => topSlots(scored, 3), [scored]);

  const requiredCount = MEMBERS.filter((m) => m.role === 'required').length;
  const optionalCount = MEMBERS.length - requiredCount;
  const respondedCount = RESPONDED_IDS.size;
  const me = getMemberById(CURRENT_USER_ID)!;

  const handleRespond = async () => {
    const result = (await openOverlay({
      component: RespondDrawer,
      props: { member: me },
      options: { type: 'drawer-horizontal', size: 'md' },
    })) as Record<string, CellResponse> | undefined;

    if (result) {
      setResponses((prev) => ({ ...prev, [me.id]: result }));
      setSavedHint(true);
    }
  };

  const handlePick = (slotId: string) => {
    setSelectedSlotId(slotId);
    setConfirmedSlotId(slotId);
  };

  const openSlotDetail = async (target: ScoredSlot) => {
    setSelectedSlotId(target.slot.id);
    const confirmed = await openOverlay({
      component: SlotDetailModal,
      props: { scored: target },
      options: { type: 'modal', size: 'sm' },
    });
    if (confirmed) handlePick(target.slot.id);
  };

  const confirmedSlot = confirmedSlotId
    ? ALL_SLOTS.find((s) => s.id === confirmedSlotId)
    : undefined;

  return (
    <AppShell
      activeNav="meetings"
      primaryLabel="새 회의"
      onPrimaryAction={onCreate}
      onNavHome={onBack}
      onProfileClick={onProfile}
      currentUser={me}
    >
      <div className="flex flex-col gap-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex w-fit items-center gap-1 text-13 text-text-muted transition-colors hover:text-text"
          >
            <span aria-hidden>←</span> 회의 목록
          </button>
        )}

        {/* 확정 / 저장 배너 */}
        {confirmedSlot && (
          <div className="flex items-center gap-2 rounded-lg border border-[#16a34a]/30 bg-[#16a34a]/5 px-4 py-2.5 text-13">
            <span className="text-[#16a34a]">✓</span>
            <span className="font-medium text-text">
              {confirmedSlot.dateLabel} {slotTimeRange(confirmedSlot)}(으)로 회의를 확정했어요.
            </span>
            <span className="text-text-muted">참석자에게 캘린더 초대가 발송됩니다.</span>
          </div>
        )}
        {savedHint && !confirmedSlot && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-13">
            <span className="text-primary">✓</span>
            <span className="font-medium text-text">내 응답을 저장했어요.</span>
            <span className="text-text-muted">바뀐 사정이 추천·히트맵에 바로 반영됐어요.</span>
          </div>
        )}

        {/* 회의 헤더 */}
        <div className="flex flex-col gap-3">
          <Typography.Title level={3}>디자인 시스템 스프린트 킥오프</Typography.Title>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {MEMBERS.map((m) => {
                const voted = hasResponded(m.id);
                return (
                  <span key={m.id} className="relative inline-flex">
                    <Avatar
                      member={m}
                      size="sm"
                      className={
                        voted
                          ? 'ring-2 ring-[#16a34a] ring-offset-2 ring-offset-surface'
                          : 'opacity-30'
                      }
                    />
                    {voted && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#16a34a] ring-2 ring-surface">
                        <CheckIcon size="xs" className="text-white" />
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
            <span className="text-12 text-text-muted">
              <span className="font-medium text-text">{respondedCount}/{MEMBERS.length}</span> 응답
              <span className="px-1.5 text-text-subtle">·</span>
              필수 {requiredCount} · 선택 {optionalCount}
            </span>
          </div>
        </div>

        {/* 추천 (결정) */}
        <section className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-3">
            <span className="text-13 font-semibold text-text-muted">추천 시간</span>
            <Button variant="primary" size="sm" onClick={handleRespond}>
              내 가능 시간 응답
            </Button>
          </div>
          {votingComplete ? (
            <SlotRanking scored={top} onOpenSlot={openSlotDetail} />
          ) : (
            <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center">
              <span className="text-13 font-medium text-text">아직 응답을 모으는 중이에요</span>
              <span className="text-12 text-text-muted">
                {MEMBERS.length}명 모두 응답하면 추천 시간을 알려드려요
              </span>
            </div>
          )}
        </section>

        {/* 답변 결과 (이해·탐색) — 주간 전체 가용성 히트맵 */}
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-13 font-semibold text-text-muted">답변 결과</span>
            <span className="text-11 text-text-muted">진할수록 가능 인원이 많아요.</span>
          </div>
          <AvailabilityHeatmap
            scored={scored}
            total={respondedCount}
            selectedSlotId={selectedSlotId}
            onOpenSlot={openSlotDetail}
          />
        </section>
      </div>
    </AppShell>
  );
}
