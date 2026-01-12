import { useComputedColorScheme } from '@mantine/core';
import { useEffect } from 'react';

export function ThemeBarSync() {
  const scheme = useComputedColorScheme('light');

  useEffect(() => {
    const root = document.documentElement;

    let bodyColor = getComputedStyle(root)
      .getPropertyValue('--mantine-color-body')
      .trim();
    if (!bodyColor) bodyColor = scheme === 'dark' ? '#242424' : '#ffffff';

    let meta = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', bodyColor);

    let ios = document.querySelector(
      'meta[name="apple-mobile-web-app-status-bar-style"]'
    ) as HTMLMetaElement | null;
    if (!ios) {
      ios = document.createElement('meta');
      ios.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      document.head.appendChild(ios);
    }
    ios.setAttribute('content', 'black-translucent');
  }, [scheme]);

  return null;
}
