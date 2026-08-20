import { Chip } from '@/components/common/Chip';
import type { Option } from '@/types/onboarding';

export type ChoiceChipProps<T extends string> = {
  option: Option<T>;
  selected: boolean;
  onToggle: (id: T) => void;
  disabled?: boolean;
};

/** 온보딩 선택지 하나. Option 배열을 그대로 map 해서 쓰면 된다. */
export function ChoiceChip<T extends string>({
  option,
  selected,
  onToggle,
  disabled,
}: ChoiceChipProps<T>) {
  return (
    <Chip
      label={option.label}
      selected={selected}
      disabled={disabled}
      onPress={() => onToggle(option.id)}
    />
  );
}
