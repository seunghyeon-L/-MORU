import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

/**
 * MORU 하단 탭: 기록 | 홈 | 나의 식탁
 *
 * NativeTabs 설정 자체는 기존 Expo 템플릿 그대로 두고 trigger 만 교체했다.
 * 높이/아이콘 크기/탭 간격은 OS 네이티브 탭바 chrome이 결정하므로 이 레이어에서
 * 임의로 바꾸지 않고, NativeTabs 가 문서상 지원하는 색상 props(iconColor, labelStyle)만
 * Figma 기준 active(brand)/inactive(textMuted) 톤에 맞춘다.
 *
 * TODO(디자인 에셋 필요): "기록"과 "나의 식탁"이 같은 explore.png 를 임시로 쓰고 있다.
 * assets/images/tabIcons/ 에 Figma 전용 record / table 아이콘이 준비되면 각각 교체한다.
 */
export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor="transparent"
      iconColor={{ default: colors.textMuted, selected: colors.brand }}
      labelStyle={{
        default: { color: colors.textMuted },
        selected: { color: colors.brand },
      }}>
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

      {/* TODO(디자인 에셋 필요): 전용 "나의 식탁" 아이콘으로 교체 */}
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
