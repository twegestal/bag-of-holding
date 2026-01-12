import { ActionIcon, Menu } from '@mantine/core';
import { HiDotsVertical } from 'react-icons/hi';
import { CiEdit } from 'react-icons/ci';
import { GoPlus } from 'react-icons/go';
import { FiMinus } from 'react-icons/fi';
import { HiOutlineTrash } from 'react-icons/hi2';

import type { CharacterItem } from '../../../types/character';

export function CharacterItemActionsMenu({
  item,
  disabled,
  onEdit,
  onAddOne,
  onRemoveOne,
  onDelete,
}: {
  item: CharacterItem;
  disabled: boolean;
  onEdit: (item: CharacterItem) => void;
  onAddOne: (item: CharacterItem) => void;
  onRemoveOne: (item: CharacterItem) => void;
  onDelete: (item: CharacterItem) => void;
}) {
  return (
    <Menu shadow="md" width={180} position="bottom-end">
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          aria-label="Item actions"
          disabled={disabled}
        >
          <HiDotsVertical />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<CiEdit size={16} />}
          onClick={() => onEdit(item)}
        >
          Edit
        </Menu.Item>

        <Menu.Item
          leftSection={<GoPlus size={16} />}
          onClick={() => onAddOne(item)}
        >
          Add one
        </Menu.Item>

        <Menu.Item
          leftSection={<FiMinus size={16} />}
          onClick={() => onRemoveOne(item)}
        >
          Remove one{item.quantity <= 1 ? ' (deletes)' : ''}
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          color="red"
          leftSection={<HiOutlineTrash size={16} />}
          onClick={() => onDelete(item)}
        >
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
