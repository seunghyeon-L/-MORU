import { Chip } from '@/components/common/Chip';
import type { Option } from '@/types/onboarding';
import type { SymptomType } from '@/types/symptom';

export type SymptomOptionProps = {
  option: Option<SymptomType>;
  selected: boolean;
  onToggle: (id: SymptomType) => void;
};

/** 증상 종류 선택지 하나 */
export function SymptomOption({ option, selected, onToggle }: SymptomOptionProps) {
  return <Chip label={option.label} selected={selected} onPress={() => onToggle(option.id)} />;
}
