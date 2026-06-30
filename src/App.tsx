import { useState } from 'react';
import { HomePage } from '@/features/home/HomePage';
import { SchedulingPage } from '@/features/scheduling/SchedulingPage';

type View = 'home' | 'detail';

export function App() {
  const [view, setView] = useState<View>('home');

  if (view === 'detail') {
    return <SchedulingPage onBack={() => setView('home')} />;
  }

  return (
    <HomePage onOpenMeeting={() => setView('detail')} onCreate={() => setView('detail')} />
  );
}
