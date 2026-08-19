import { SelectionCard } from '@/components/common/SelectionCard';
import type { Alternative } from '@/types/food';

export type AlternativeCardProps = {
  alternative: Alternative;
  onPress?: () => void;
};

/** 대체 메뉴 / 대체 재료 / 조리법 변경 제안 카드 */
export function AlternativeCard({ alternative, onPress }: AlternativeCardProps) {
  return (
    <SelectionCard
      title={alternative.title}
      description={alternative.description}
      onPress={onPress}
    />
  );
}
