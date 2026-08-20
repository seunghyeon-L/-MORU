/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    /** Figma "웰니스 그린" 팔레트 — 온보딩(A1~B6) 화면 전용 */
    onboardingBackground: '#F1F6F1',
    surfaceCard: '#FFFFFF',
    brand: '#9BBFAE',
    brandLight: '#C3D9CE',
    brandLighter: '#D7E4DE',
    brandSoft: '#EDF4F0',
    brandText: '#5C6B47',
    borderSubtle: '#F0E9DD',
    textPrimary: '#3A342C',
    textMuted: '#736B5B',
    /**
     * brand(#9BBFAE) 위에 얹는 글자색.
     *
     * 흰색이었는데 대비가 2.01:1 이라 WCAG AA(4.5:1) 에 한참 못 미쳤다.
     * 칩·강도 선택처럼 '고르면 brand 로 채우는' 자리에서는
     * **고른 쪽이 안 고른 쪽보다 안 보이는** 역전이 났다.
     * 잉크색으로 바꾸면 6.12:1 이 되고 브랜드 그린은 그대로 남는다.
     */
    textOnBrand: '#3A342C',
    /** 탭바 활성색. brand 는 흰 배경에서 2.01:1 이라 비활성(3.37:1)보다 흐렸다 */
    tabActive: '#5C6B47',
    /** 증상 기록 카드 등 코랄 계열 포인트 (스크린샷 기준 근사치) */
    coral: '#C97C6D',
    coralLight: '#F5E2DD',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    onboardingBackground: '#14160F',
    surfaceCard: '#1E211D',
    brand: '#9BBFAE',
    brandLight: '#3A473F',
    brandLighter: '#2E3A32',
    brandSoft: '#233028',
    brandText: '#BFE0CC',
    borderSubtle: '#33362E',
    textPrimary: '#F5F1E8',
    textMuted: '#A79E8D',
    textOnBrand: '#3A342C',
    /** 어두운 배경에서는 brand 자체가 10.46:1 이라 그대로 쓴다 */
    tabActive: '#9BBFAE',
    coral: '#D99A8C',
    coralLight: '#3A2C28',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
