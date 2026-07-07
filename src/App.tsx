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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const openMeeting = (id: string) => {
    setSelectedId(id);
    setView('detail');
  };
  const deleteMeeting = (id: string) => {
    setCoord((prev) => prev.filter((c) => c.id !== id));
    setSelectedId(null);
    setView('home');
  };

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

  const selectedMeeting = coord.find((c) => c.id === selectedId);

  if (view === 'detail' && selectedMeeting) {
    return (
      <SchedulingPage
        meeting={selectedMeeting}
        onBack={() => setView('home')}
        onCreate={openCreate}
        onProfile={openProfile}
        onDelete={deleteMeeting}
      />
    );
  }

  return (
    <HomePage
      coord={coord}
      onOpenMeeting={openMeeting}
      onCreate={openCreate}
      onProfile={openProfile}
    />
  );
}
