import { StyleSheet } from 'react-native';

import { SelectionCard } from '@/components/common/SelectionCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Alternative } from '@/types/food';

export type AlternativeCardProps = {
  alternative: Alternative;
  /** Figma D3 처럼 번호 배지를 붙일 때 1부터 순서를 넘긴다 */
  index?: number;
  selected?: boolean;
  onPress?: () => void;
};

/** 대체 메뉴 / 대체 재료 / 조리법 변경 제안 카드 */
export function AlternativeCard({ alternative, index, selected, onPress }: AlternativeCardProps) {
  return (
    <SelectionCard
      title={alternative.title}
      description={alternative.description}
      selected={selected}
      onPress={onPress}
      accessory={
        index !== undefined ? (
          <ThemedView type="brandLight" style={styles.badge}>
            <ThemedText type="caption" themeColor="brandText">
              {index}
            </ThemedText>
          </ThemedView>
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
