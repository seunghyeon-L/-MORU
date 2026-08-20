import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export type CheckboxTone = 'brand' | 'coral';

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** 'coral' — 혈변 등 위험 신호처럼 색으로 주의를 끌어야 하는 항목에 사용 */
  tone?: CheckboxTone;
};

/** 카드형 체크리스트 항목. Figma "안전 확인" 화면 기준 */
export function Checkbox({ label, checked, onChange, disabled, tone = 'brand' }: CheckboxProps) {
  const theme = useTheme();
  const accentColor = checked
    ? (tone === 'coral' ? theme.coral : theme.brand)
    : theme.borderSubtle;   // 안 체크는 옅은 선. 체크하면 브랜드색 2px 로 또렷해진다
  const fillBackground = tone === 'coral' ? 'coral' : 'brand';

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={({ pressed }) => (pressed || disabled) && styles.dimmed}>
      {/*
        체크돼도 카드 배경은 흰색(surfaceCard)을 유지한다.

        전에는 체크하면 brandSoft(#EDF4F0)로 바뀌었는데,
        온보딩 페이지 배경이 #F1F6F1 이라 거의 같은 색이다.
        그래서 체크하는 순간 카드가 배경에 묻혀 오히려 안 보였다.
        가시성을 높이려던 게 반대로 작동한 것이다.

        대신 테두리를 브랜드색 2px 로 세우고 체크박스를 채운다.
        페이지 배경이 무슨 색이든 대비가 유지된다.
      */}
      <ThemedView
        type="surfaceCard"
        style={[
          styles.container,
          { borderColor: accentColor, borderWidth: checked ? 2 : 1 },
        ]}>
        <ThemedView
          type={checked ? fillBackground : 'surfaceCard'}
          style={[styles.box, { borderColor: accentColor }]}>
          {checked ? (
            <ThemedText type="label" themeColor="textOnBrand">
              {'✓'}
            </ThemedText>
          ) : null}
        </ThemedView>
        <ThemedText
          type="bodyS"
          themeColor={checked ? (tone === 'coral' ? 'textPrimary' : 'brandText') : 'textPrimary'}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
    borderRadius: 15,
    borderWidth: 1,
    shadowColor: '#3B332B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: {
    opacity: 0.6,
  },
});
