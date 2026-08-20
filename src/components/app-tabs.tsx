import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
  type NativeTabOptions,
} from 'expo-router/unstable-native-tabs';
import { Platform, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

/**
 * expo-router 의 NativeTabOptions 에는 아직 선언돼 있지 않지만, 옵션 객체는
 * NativeTabTrigger → NativeTabsView 의 Screen 에서 `{...descriptor.options}` 로
 * react-native-screens 의 BottomTabsScreen 까지 그대로 흘러간다.
 * 그래서 타입만 넓혀 주면 실제로 네이티브까지 전달된다.
 */
type TabScreenOptions = NativeTabOptions & {
  overrideScrollViewContentInsetAdjustmentBehavior?: boolean;
};

/**
 * iOS 에서 react-native-screens 는 탭이 선택될 때마다 탭 화면의 "첫 자식 체인 첫 ScrollView"를
 * 찾아 contentInsetAdjustmentBehavior 를 RN 기본값 never 에서 UIKit 기본값 automatic 으로
 * 되돌린다(RNSBottomTabsScreenComponentView.mm 의 overrideScrollViewBehaviorInFirstDescendantChainIfNeeded,
 * 기본값 YES). 세 탭 화면 모두 루트가 ScrollView 라 정확히 이 대상에 걸린다.
 *
 * automatic 이 되면 UIKit 이 상단 세이프에어리어만큼 콘텐츠를 아래로 밀어 버리는데,
 * Yoga 레이아웃은 이 보정을 모르므로 콘텐츠 높이는 그대로다. 그만큼 화면 아래가 밀려나
 * 홈의 "오늘 먹은 것 확인하기" 버튼 아랫부분이 탭바 뒤로 들어가 잘렸다.
 *
 * 우리는 세 화면 모두 insets 를 직접 읽어 padding 으로 여백을 주고 있으므로 이 override 를 끈다.
 * ScrollView 쪽에 contentInsetAdjustmentBehavior="never" 를 지정하는 방법은 탭이 갱신될 때마다
 * screens 가 다시 덮어써서 막히지 않는다. 화면 옵션이 유일하게 확실한 차단 지점이다.
 *
 * Android 는 이 옵션을 보지 않는다(prop 이 @platform ios 이고 TabScreenViewManager 에 setter 가 없다).
 * 안드로이드의 하단 잘림은 원인이 따로 있고 화면 쪽에서 고쳤다 —
 * TabsHost 가 세로 LinearLayout 이라 콘텐츠 영역이 탭바 위에서 끝나는데 그 크기가 Yoga 로
 * 되돌아오지 않아, 탭바 높이만큼 아래가 잘려 나간다. 자세한 건 (tabs)/index.tsx 의
 * TabBarOverlap 상수 주석에 적어 뒀다. 여기서 손댈 수 있는 부분은 없다.
 */
const tabScreenOptions: TabScreenOptions = {
  overrideScrollViewContentInsetAdjustmentBehavior: false,
};

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
      iconColor={{ default: colors.textMuted, selected: colors.tabActive }}
      labelStyle={{
        default: { color: colors.textMuted },
        selected: { color: colors.tabActive },
      }}>
      <NativeTabs.Trigger name="record" options={tabScreenOptions}>
        <Label>기록</Label>
        <Icon
          {...(Platform.OS === 'ios'
            ? { sf: 'camera' as const }
            : { src: <VectorIcon family={MaterialIcons} name="photo-camera" /> })}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="index" options={tabScreenOptions}>
        <Label>홈</Label>
        <Icon
          {...(Platform.OS === 'ios'
            ? { sf: 'house' as const }
            : { src: <VectorIcon family={MaterialIcons} name="home" /> })}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="table" options={tabScreenOptions}>
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
