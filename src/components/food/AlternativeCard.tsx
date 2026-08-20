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
            {/* brandText 는 brandLight(#C3D9CE) 위에서 3.87:1 이라 12px 숫자에는 모자랐다.
                textPrimary 로 올리면 라이트 8.28:1 · 다크 8.66:1 이 된다. */}
            <ThemedText type="caption" themeColor="textPrimary">
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
