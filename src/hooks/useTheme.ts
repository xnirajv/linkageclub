'use client';

import * as React from 'react';
import { useTheme as useNextTheme } from 'next-themes';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const { theme, resolvedTheme, setTheme } = useNextTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const safeTheme = (theme as Theme | undefined) ?? 'system';
  const safeResolvedTheme = mounted
    ? ((resolvedTheme as 'light' | 'dark' | undefined) ?? 'light')
    : 'light';

  const toggleTheme = React.useCallback(() => {
    setTheme(safeResolvedTheme === 'dark' ? 'light' : 'dark');
  }, [safeResolvedTheme, setTheme]);

  return {
    theme: safeTheme,
    resolvedTheme: safeResolvedTheme,
    mounted,
    setTheme: (value: Theme) => setTheme(value),
    toggleTheme,
    setLight: () => setTheme('light'),
    setDark: () => setTheme('dark'),
    setSystem: () => setTheme('system'),
  };
}
