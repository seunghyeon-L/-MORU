import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'link'
    | 'linkPrimary'
    | 'code'
    | 'h1'
    | 'bodyM'
    | 'bodyS'
    | 'caption'
    | 'label'
    | 'button';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        type === 'h1' && styles.h1,
        type === 'bodyM' && styles.bodyM,
        type === 'bodyS' && styles.bodyS,
        type === 'caption' && styles.caption,
        type === 'label' && styles.label,
        type === 'button' && styles.button,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: 600,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
  /** Figma "H1" — 온보딩 질문 타이틀 */
  h1: {
    fontSize: 23,
    lineHeight: 32,
    fontWeight: '700',
  },
  /** Figma "Body/M" */
  bodyM: {
    fontSize: 15,
    lineHeight: 25,
    fontWeight: '400',
  },
  /** Figma "Body/S" */
  bodyS: {
    fontSize: 13.5,
    lineHeight: 23,
    fontWeight: '400',
  },
  /** Figma "Caption" */
  caption: {
    fontSize: 12,
    lineHeight: 19,
    fontWeight: '400',
  },
  /** Figma "Label/S" · "Label/M" — 칩, 옵션, 스텝 타이틀 */
  label: {
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '500',
  },
  /** Figma "Button" */
  button: {
    fontSize: 15.5,
    lineHeight: 22,
    fontWeight: '500',
  },
});
