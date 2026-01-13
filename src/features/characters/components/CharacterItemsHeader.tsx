import { Button, Group, TextInput } from '@mantine/core';

export function CharacterItemsHeader({
  search,
  onSearchChange,
  onAddItem,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onAddItem: () => void;
}) {
  return (
    <Group justify="space-between" mb="md">
      <Button variant="light" onClick={onAddItem}>
        Add item
      </Button>

      <TextInput
        placeholder="Search inventory..."
        type="tel"
        inputMode="numeric"
        value={search}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        w={320}
      />
    </Group>
  );
}
