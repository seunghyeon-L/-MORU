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
    /**
     * brand 버튼을 누르고 있는 동안의 배경.
     *
     * 눌림을 opacity 로 표현하면 안드로이드가 알파를 그리기 연산마다 따로 곱해서
     * 배경·그림자·글자 레이어의 최종색이 어긋난다(웹에서는 재현되지 않는다).
     * 그래서 색 자체를 바꾼다. 이 값은 기존 opacity 0.6 이 만들던 색(#BDD5C9)과
     * 사실상 같아서 보이는 결과는 그대로다. textOnBrand 와 8.27:1.
     *
     * brandLight 와 라이트에서는 값이 같지만 재사용하면 안 된다 —
     * 다크의 brandLight 는 #3A473F(어두움)라 누르면 글자가 묻힌다.
     */
    brandPressed: '#C3D9CE',
    /**
     * 비활성 brand 버튼.
     *
     * WCAG 1.4.3 은 비활성 컨트롤을 대비 기준에서 빼주지만 이 앱은 그 면제에 기대지 않는다.
     * 온보딩 세 화면이 답하기 전까지 '다음'을 비활성으로 두므로 **비활성이 정상 초기 상태**고,
     * 로딩(챗봇·사진 식별 2~5초)도 같은 색을 쓴다. 읽히지 않으면 화면이 고장난 것처럼 보인다.
     *
     * 전에는 #D7E4DE 였는데 온보딩 배경(#F1F6F1)과 휘도비 1.20:1 이라
     * 처음 들어온 화면에서 버튼 자리가 배경에 거의 묻혔다. 한 단 낮추고 초록기를 덜어
     * 배경과 1.38:1, 활성 brand 와 1.33:1, textDisabled 와 4.59:1 이 되게 잡았다.
     */
    brandDisabled: '#CBD4D0',
    /**
     * 흰 카드·보조 버튼을 누르고 있는 동안. surfaceCard 와 휘도비 1.24:1 로 눌린 게 보인다.
     *
     * 더 진하게 하면 눌림은 잘 보이지만 그 위의 textSecondary·textMuted 가 4.5:1 아래로 떨어진다.
     * 라벨 색을 그대로 두고 쓸 수 있는 가장 진한 값이 이 언저리다(textSecondary 4.79:1).
     */
    surfacePressed: '#E0E9E5',
    /**
     * 이미 톤이 깔린 표면(backgroundElement·brandSoft)과 투명 ghost 를 누르는 동안.
     *
     * 평상 배경이 이미 밝은 회색·연녹이라 surfacePressed 로는 휘도비가 1.1 대에 그쳐
     * 눌렀는지 알 수 없었다. 여기까지 내려야 1.2:1 을 넘긴다(backgroundElement 와 1.22:1).
     * 대신 이 위에서는 라벨을 textPrimary 로 올린다 — textSecondary 로는 4.27:1 밖에 안 나온다.
     */
    elementPressed: '#CCDFD5',
    /**
     * 비활성 카드·보조 버튼 배경.
     *
     * 전에는 backgroundElement 를 썼는데 다크에서 surfaceCard 와 휘도비 1.02:1 이라
     * 활성인지 비활성인지 구분이 안 됐다. surfaceCard 와 1.33:1, 온보딩 배경과 1.22:1 로 잡고,
     * 눌림 틴트가 초록기인 것과 달리 무채색으로 둬서 '눌린 것'과 '못 누르는 것'을 색상으로도 가른다.
     * textDisabled 와 5.22:1.
     */
    surfaceDisabled: '#DFDFE0',
    /**
     * 비활성·로딩 컨트롤의 글자와 스피너.
     *
     * textMuted 를 그대로 쓰면 brandDisabled 위에서 4.0:1 대라 AA 에 못 미쳤다.
     * 비활성은 '읽지 말라'가 아니라 '지금은 못 누른다'는 뜻이므로 읽히기는 해야 한다.
     * 비활성 배경 두 가지 위에서 각각 4.59:1(brandDisabled) · 5.22:1(surfaceDisabled),
     * 배경을 칠하지 않는 ghost 비활성에서도 온보딩 배경과 5.68:1.
     */
    textDisabled: '#605949',
    brandLight: '#C3D9CE',
    brandLighter: '#D7E4DE',
    brandSoft: '#EDF4F0',
    brandText: '#5C6B47',
    borderSubtle: '#F0E9DD',
    textPrimary: '#3A342C',
    /**
     * 본문 보조 글자.
     *
     * #736B5B 였는데 눌린 카드 배경(surfacePressed #E0E9E5) 위에서 4.26:1 로 AA 미달이었다.
     * 카드 설명글은 누르는 동안에도 읽히는 자리라 한 단 어둡게 내렸다.
     * 흰 카드 5.85:1, surfacePressed 4.73:1, surfaceDisabled 4.69:1.
     */
    textMuted: '#6C6454',
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
    /** 다크에서도 brand·textOnBrand 가 라이트와 같은 값이라 누름색도 같다 */
    brandPressed: '#C3D9CE',
    /**
     * #5A6B60 이었는데 그 위의 textMuted 가 2.14:1 이라 다크 사용자는
     * 온보딩에 들어온 순간부터(비활성이 정상 초기 상태다) 버튼 글자를 못 읽었다.
     * 배경을 어둡게 내리고 글자를 textDisabled 로 올려 4.64:1 을 만든다.
     * 활성 brand 와 3.96:1, 온보딩 배경과 2.29:1 이라 버튼 자리도 보인다.
     */
    brandDisabled: '#47544C',
    /**
     * surfaceCard(#1E211D)보다 한 단만 밝게.
     * #2A2E28 은 surfaceCard 와 휘도비 1.18:1 이라 눌렀는지 알기 어려웠다 — 1.25:1 로 올렸다.
     * textMuted 4.92:1, textSecondary 6.27:1.
     */
    surfacePressed: '#2E322C',
    /**
     * 이미 톤이 깔린 표면(backgroundElement·brandSoft)과 투명 ghost 를 누르는 동안.
     * backgroundElement 와 1.49:1, 온보딩 배경과 1.71:1, brandSoft 와 1.29:1.
     * 라이트와 마찬가지로 이 위에서는 라벨을 textPrimary 로 올린다(9.47:1).
     */
    elementPressed: '#35413A',
    /**
     * 비활성 카드·보조 버튼 배경. surfaceCard 와 1.57:1 이라 활성과 구분된다.
     * 전에 쓰던 backgroundElement(#212225)는 surfaceCard(#1E211D)와 1.02:1 이라 같은 색으로 보였다.
     */
    surfaceDisabled: '#3E4045',
    /** 비활성·로딩 글자. brandDisabled 4.64:1, surfaceDisabled 6.06:1, 온보딩 배경 10.64:1 */
    textDisabled: '#CDC5B6',
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

/**
 * 탭 화면 콘텐츠가 하단 탭바에 가려지는 높이.
 *
 * react-native-screens 의 native tabs 는 탭 화면의 Yoga 높이를 **창 전체**로 준다
 * (BottomTabsScreen 이 position:absolute · height:100%). 그런데 안드로이드의
 * TabsHost 는 세로 LinearLayout 이라 실제 콘텐츠 영역은 창에서 탭바를 뺀 만큼이고,
 * TabScreen.onLayout 은 아무것도 하지 않는다. 네이티브가 실제 크기를 JS 로
 * 돌려주는 경로도 없다(gamma 에 StateWrapper 가 없다). 그래서 아래쪽이 잘린다.
 * 스크롤해도 안 된다 — ScrollView 도 뷰포트를 창 전체로 알기 때문이다.
 *
 * 안드로이드 80 은 Material3 BottomNavigationView 기본 높이다.
 * 웹 70 은 app-tabs.web.tsx 의 TabList 실측 높이
 * (paddingTop 16 + 아이콘 24 + gap 4 + 라벨 18 + paddingBottom 8).
 *
 * ★ 이 값은 어림잡은 상수다. 시스템 글꼴 배율을 키우면 탭바가 커져 다시 모자랄 수 있다.
 *   그래서 쓰는 쪽에서 여유를 한 단계 더 준다.
 */
export const BottomTabInset = Platform.select({ ios: 50, android: 80, default: 70 }) ?? 70;
export const MaxContentWidth = 800;
