import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MORUButton, type MORUButtonProps } from '@/components/common/MORUButton';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type BottomButtonProps = MORUButtonProps & {
  /** 보조 버튼 (예: "건너뛰기") */
  secondary?: MORUButtonProps;
};

/** 화면 하단에 고정되는 다음/완료 버튼 영역 */
export function BottomButton({ secondary, ...primary }: BottomButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      type="onboardingBackground"
      style={[styles.container, { paddingBottom: insets.bottom + Spacing.three }]}>
      <MORUButton {...primary} />
      {secondary ? <MORUButton variant="ghost" {...secondary} /> : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
});
