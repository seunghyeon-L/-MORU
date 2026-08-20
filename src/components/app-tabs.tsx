import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import { Platform, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

/**
 * MORU 하단 탭: 기록 | 홈 | 나의 식탁
 *
 * NativeTabs 설정 자체는 기존 Expo 템플릿 그대로 두고 trigger 만 교체했다.
 * 높이/아이콘 크기/탭 간격은 OS 네이티브 탭바 chrome이 결정하므로 이 레이어에서
 * 임의로 바꾸지 않고, NativeTabs 가 문서상 지원하는 색상 props(iconColor, labelStyle)만
 * Figma 기준 active(brand)/inactive(textMuted) 톤에 맞춘다.
 *
 * 아이콘은 expo-symbols 기반 sf(iOS SF Symbol)/md(Android Material Symbol)를 쓴다 —
 * NativeTabs.Trigger.Icon 의 src 는 커스텀 View 아이콘(이 프로젝트의 icons.tsx 세트)을
 * 직접 받지 못하고 @expo/vector-icons 기반 VectorIcon만 허용하기 때문에, 새 라이브러리를
 * 추가하지 않는 선에서 쓸 수 있는 방법이 OS 표준 심볼뿐이다. 이전에는 "기록"과 "나의 식탁"이
 * 같은 explore.png 를 임시로 써서 아이콘이 겹쳤는데, 이번에 각 탭에 맞는 심볼로 분리했다.
 *
 * Figma 레이어명 기준(app-tabs.web.tsx 주석 참고, 웹 버전은 이미 정확히 구현되어 있다):
 * - 기록 = "uil:camera" → sf="camera" 로 근사
 * - 홈 = "material-symbols:home-outline-rounded" → sf="house"/md="home" 로 동일 아이콘
 * - 나의 식탁 = 이름 없는 커스텀 벡터(클로슈/돔 모양, TableIcon 참고) → SF Symbols 에는
 *   클로슈 모양이 없어 sf="fork.knife"로 근사하고, md는 돔 형태에 가장 가까운
 *   Material Symbols "room_service"(트레이 위 클로슈)를 쓴다. 정확한 형태는 아니다.
 * TODO(Figma 에셋 필요): Figma에서 "나의 식탁" 클로슈 아이콘을 PNG로 export 할 수 있게 되면
 * 지금의 OS 표준 심볼 대신 src(PNG)로 교체해 Figma 원본과 정확히 맞춘다.
 */
export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

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
        <Label>기록</Label>
        <Icon
          {...(Platform.OS === 'ios'
            ? { sf: 'camera' as const }
            : { src: <VectorIcon family={MaterialIcons} name="photo-camera" /> })}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="index">
        <Label>홈</Label>
        <Icon
          {...(Platform.OS === 'ios'
            ? { sf: 'house' as const }
            : { src: <VectorIcon family={MaterialIcons} name="home" /> })}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="table">
        <Label>나의 식탁</Label>
        <Icon
          {...(Platform.OS === 'ios'
            ? { sf: 'fork.knife' as const }
            : { src: <VectorIcon family={MaterialIcons} name="room-service" /> })}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
