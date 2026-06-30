import { useMemo, useState } from 'react';
import { Badge, Button, Typography, useOverlay } from '@thakicloud/shared';
import { AppShell } from '@/components/AppShell';
import { Avatar } from '@/components/Avatar';
import {
  CURRENT_USER_ID,
  INITIAL_RESPONSES,
  MEMBERS,
  SLOTS,
  getMemberById,
  scoreSlots,
  type CellResponse,
  type Responses,
} from '@/lib/scheduling';
import { AvailabilityMatrix } from './AvailabilityMatrix';
import { RespondDrawer } from './RespondDrawer';
import { SlotRanking } from './SlotRanking';

export function SchedulingPage({ onBack }: { onBack?: () => void }) {
  const { openOverlay } = useOverlay();
  const [responses, setResponses] = useState<Responses>(INITIAL_RESPONSES);
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>();
  const [confirmedSlotId, setConfirmedSlotId] = useState<string | undefined>();
  const [savedHint, setSavedHint] = useState(false);

  const scored = useMemo(() => scoreSlots(MEMBERS, SLOTS, responses), [responses]);

  const requiredCount = MEMBERS.filter((m) => m.role === 'required').length;
  const optionalCount = MEMBERS.length - requiredCount;
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

  const confirmedSlot = confirmedSlotId ? SLOTS.find((s) => s.id === confirmedSlotId) : undefined;

  return (
    <AppShell activeNav="meetings" primaryLabel="내 가능 시간 응답" onPrimaryAction={handleRespond} onNavHome={onBack} currentUser={me}>
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
              {confirmedSlot.dateLabel} {confirmedSlot.time}(으)로 회의를 확정했어요.
            </span>
            <span className="text-text-muted">참석자에게 캘린더 초대가 발송됩니다.</span>
          </div>
        )}
        {savedHint && !confirmedSlot && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-13">
            <span className="text-primary">✓</span>
            <span className="font-medium text-text">내 응답을 저장했어요.</span>
            <span className="text-text-muted">바뀐 사정이 추천 점수에 바로 반영됐어요.</span>
          </div>
        )}

        {/* 회의 헤더 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Typography.Title level={2}>디자인 시스템 스프린트 킥오프</Typography.Title>
            <Badge theme="blu" size="sm">시간 조율 중</Badge>
          </div>
          <Typography.Text variant="paragraph" color="text-muted">
            다음 주 중 1시간 · 모두의 사정을 보고 가장 괜찮은 시간을 찾고 있어요.
          </Typography.Text>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-12 text-text-muted">
              필수 {requiredCount}명 · 선택 {optionalCount}명
            </span>
            <div className="flex items-center gap-3">
              {MEMBERS.map((m) => (
                <div key={m.id} className="flex items-center gap-1.5">
                  <Avatar member={m} size="xs" />
                  <span className="text-12 text-text">{m.name}</span>
                  {m.role === 'optional' && (
                    <span className="rounded bg-surface-muted px-1 text-11 text-text-muted">선택</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 1층: 추천 랭킹 (결정) */}
        <section className="flex flex-col gap-3">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-0.5">
              <Typography.Title level={4}>추천 시간</Typography.Title>
              <span className="text-12 text-text-muted">
                선택 참여자의 사정은 후순위로 반영해 점수를 매겼어요.
              </span>
            </div>
            <Button variant="primary" size="sm" onClick={handleRespond}>
              내 가능 시간 응답
            </Button>
          </div>
          <SlotRanking
            scored={scored}
            selectedSlotId={selectedSlotId}
            onSelectSlot={setSelectedSlotId}
            onPickSlot={handlePick}
          />
        </section>

        {/* 2층: 가용성 매트릭스 (이해·검증) */}
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <Typography.Title level={4}>모두의 가용성</Typography.Title>
            <span className="text-12 text-text-muted">
              각자의 사정을 한눈에 — 칸에 마우스를 올리면 조건·메모를 볼 수 있어요. 시간을 클릭하면 해당 열이 강조돼요.
            </span>
          </div>
          <AvailabilityMatrix
            members={MEMBERS}
            slots={SLOTS}
            responses={responses}
            selectedSlotId={selectedSlotId}
            onSelectSlot={setSelectedSlotId}
          />
        </section>
      </div>
    </AppShell>
  );
}
