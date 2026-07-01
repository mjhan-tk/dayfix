import { useState } from 'react';
import { useOverlay } from '@thakicloud/shared';
import { HomePage } from '@/features/home/HomePage';
import { SchedulingPage } from '@/features/scheduling/SchedulingPage';
import { CreateMeetingDrawer } from '@/features/meeting/CreateMeetingDrawer';
import { FixedScheduleDrawer } from '@/features/profile/FixedScheduleDrawer';
import {
  INITIAL_COORD,
  createCoordMeeting,
  type CoordMeeting,
  type NewMeetingInput,
} from '@/lib/home';

type View = 'home' | 'detail';

export function App() {
  const { openOverlay } = useOverlay();
  const [view, setView] = useState<View>('home');
  const [coord, setCoord] = useState<CoordMeeting[]>(INITIAL_COORD);

  const openCreate = async () => {
    const created = (await openOverlay({
      component: CreateMeetingDrawer,
      props: {},
      options: { type: 'drawer-horizontal', size: 'md' },
    })) as NewMeetingInput | undefined;

    if (created?.title) {
      setCoord((prev) => [createCoordMeeting(created), ...prev]);
      setView('home');
    }
  };

  const openProfile = () => {
    void openOverlay({
      component: FixedScheduleDrawer,
      props: {},
      options: { type: 'drawer-horizontal', size: 'md' },
    });
  };

  if (view === 'detail') {
    return <SchedulingPage onBack={() => setView('home')} onCreate={openCreate} onProfile={openProfile} />;
  }

  return (
    <HomePage
      coord={coord}
      onOpenMeeting={() => setView('detail')}
      onCreate={openCreate}
      onProfile={openProfile}
    />
  );
}
