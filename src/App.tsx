import { useOverlay } from '@thakicloud/shared';
import { AppShell } from '@/components/AppShell';
import { MeetingDashboard } from '@/features/meeting/MeetingDashboard';
import { CreateMeetingDrawer } from '@/features/meeting/CreateMeetingDrawer';

export function App() {
  const { openOverlay } = useOverlay();

  const handleCreateMeeting = () => {
    void openOverlay({
      component: CreateMeetingDrawer,
      props: {},
      options: { type: 'drawer-horizontal', size: 'md' },
    });
  };

  return (
    <AppShell activeNav="meetings" onCreateMeeting={handleCreateMeeting}>
      <MeetingDashboard onCreateMeeting={handleCreateMeeting} />
    </AppShell>
  );
}
