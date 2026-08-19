import { SelectionCard } from '@/components/common/SelectionCard';
import type { MyTableItem } from '@/types/food';

export type SafeFoodCardProps = {
  food: MyTableItem;
  onPress?: () => void;
};

/**
 * "안심하고 먹는 음식" 카드.
 * 현재 (tabs)/table.tsx 는 safe 항목을 태그 형태로 그리고 있어 이 컴포넌트를 쓰지 않는다
 * (GET /mytable 의 safe 항목엔 note/hint 가 없어 태그 형태가 더 맞는 표현이다).
 * note 가 있는 경우에 대비해 타입만 실제 API 응답 형태로 맞춰 둔다.
 */
export function SafeFoodCard({ food, onPress }: SafeFoodCardProps) {
  return <SelectionCard title={food.label} description={food.note} onPress={onPress} />;
}
