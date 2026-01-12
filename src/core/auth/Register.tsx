import { useState } from 'react';
import {
  Anchor,
  Button,
  Divider,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../contexts/auth';
import { Link } from 'react-router-dom';

export function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(email.trim(), password);
      notifications.show({
        title: 'Account created',
        message: 'If required, confirm via the email we sent you.',
        color: 'green',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      notifications.show({
        title: 'Registration failed',
        message,
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100dvh',
        padding: 16,
      }}
    >
      <Paper
        withBorder
        p="lg"
        radius="md"
        style={{ width: '100%', maxWidth: 420 }}
      >
        <Stack gap="md">
          <Title order={3} ta="center">
            Create an account
          </Title>

          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
            autoComplete="email"
          />

          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
            autoComplete="new-password"
          />

          <Button type="submit" loading={submitting}>
            Create account
          </Button>

          <Divider label="or" labelPosition="center" />

          <Button
            variant="outline"
            onClick={loginWithGoogle}
            leftSection={
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                width={18}
                height={18}
                alt=""
              />
            }
          >
            Continue with Google
          </Button>

          <Text fz="sm" ta="center">
            Already have an account?{' '}
            <Anchor component={Link} to="/login" underline="always">
              Sign in
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </form>
  );
}
