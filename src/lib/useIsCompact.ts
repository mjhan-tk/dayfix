import { useEffect, useState } from 'react';

// 태블릿+모바일 여부. lg(1024px) 미만이면 드로어를 페이지처럼 꽉 채운다.
export function useIsCompact(breakpoint = 1024): boolean {
  const [compact, setCompact] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  );

  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < breakpoint);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  return compact;
}
