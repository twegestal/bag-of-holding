import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AppRouter } from './router/AppRouter';
import { theme } from './theme';
import { ThemeBarSync } from './core/ThemeBarSync';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import './styles/index.css';

export default function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <ThemeBarSync />
      <Notifications position="bottom-center" />
      <AppRouter />
    </MantineProvider>
  );
}
