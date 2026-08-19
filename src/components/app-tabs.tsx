import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

/**
 * MORU 하단 탭: 기록 | 홈 | 나의 식탁
 *
 * NativeTabs 설정 자체는 기존 Expo 템플릿 그대로 두고 trigger 만 교체했다.
 * 아이콘은 아직 Figma 에셋이 없어 기존 tabIcons 를 임시로 재사용한다.
 * (assets/images/tabIcons/ 에 record / home / table 아이콘이 준비되면 교체)
 */
export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor="transparent"
      labelStyle={{ selected: { color: colors.brand } }}>
      <NativeTabs.Trigger name="record">
        <NativeTabs.Trigger.Label>기록</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>홈</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="table">
        <NativeTabs.Trigger.Label>나의 식탁</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
