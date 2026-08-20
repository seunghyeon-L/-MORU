import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { CameraIcon } from './common/icons';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

/**
 * Figma 레이어명 기준:
 * - 기록 = "uil:camera" (Unicons), 나의 식탁 = 이름 없는 커스텀 Vector(클로슈/돔)
 *   → 이 프로젝트에 해당 아이콘 세트가 없어 Figma 형태를 View 도형으로 직접 재현한다.
 * - 홈 = "material-symbols:home-outline-rounded" → expo-symbols 로 동일 아이콘 재현.
 */
const ICON_STROKE = 1.6;

function TableIcon({ size, color }: { size: number; color: string }) {
  const s = size / 24;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: 11 * s,
          top: 2 * s,
          width: 2 * s,
          height: 3 * s,
          borderRadius: s,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 4 * s,
          top: 5 * s,
          width: 16 * s,
          height: 8 * s,
          borderTopLeftRadius: 8 * s,
          borderTopRightRadius: 8 * s,
          borderWidth: ICON_STROKE,
          borderBottomWidth: 0,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 2 * s,
          top: 13 * s,
          width: 20 * s,
          height: 1.6,
          borderRadius: 1,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

/** MORU 하단 탭 (web) — 기록 | 홈 | 나의 식탁. Figma 기준 전체 폭 흰색 탭바 */
export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="record" href="/record" asChild>
            <TabButton name="record">기록</TabButton>
          </TabTrigger>
          <TabTrigger name="home" href="/(tabs)" asChild>
            <TabButton name="home">홈</TabButton>
          </TabTrigger>
          <TabTrigger name="table" href="/table" asChild>
            <TabButton name="table">나의 식탁</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & { name: 'record' | 'home' | 'table' };

export function TabButton({ children, isFocused, name, ...props }: TabButtonProps) {
  const theme = useTheme();
  const color = isFocused ? theme.brand : theme.textMuted;

  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <View style={styles.icon}>
        {name === 'record' ? <CameraIcon size={24} color={color} /> : null}
        {name === 'home' ? (
          <SymbolView
            name={'house' as never}
            type="monochrome"
            weight="light"
            size={24}
            tintColor={color}
            style={styles.icon}
          />
        ) : null}
        {name === 'table' ? <TableIcon size={24} color={color} /> : null}
      </View>
      <ThemedText type="small" style={{ color }}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView
        type="surfaceCard"
        style={[styles.innerContainer, { paddingBottom: insets.bottom, borderTopColor: theme.borderSubtle }]}>
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  innerContainer: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  icon: {
    width: 24,
    height: 24,
  },
  pressed: {
    opacity: 0.7,
  },
});
