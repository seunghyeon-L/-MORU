import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, type LayoutChangeEvent } from 'react-native';

/**
 * 키보드가 화면을 가리는 높이. 가리지 않으면 0.
 *
 * ★ 왜 필요한가
 *   안드로이드는 보통 windowSoftInputMode=adjustResize 라 키보드가 올라오면
 *   창 자체가 줄어든다. 그래서 앱이 따로 보정할 게 없고, KeyboardAvoidingView 도
 *   android 에서는 behavior 를 주지 않는 게 관행이었다 — 주면 이중 보정이 된다.
 *
 *   그런데 Expo SDK 54 는 안드로이드 edge-to-edge 가 기본이다. 이때 IME 는
 *   창을 줄이지 않고 inset 으로만 올라오는 경우가 있고, 그러면 adjustResize 가
 *   무력화돼 입력창이 키보드 뒤에 깔린다. 실제로 갤럭시에서 그랬다 —
 *   챗봇 화면에서 입력칸을 눌러도 칸이 키보드 아래에 그대로 있었다.
 *
 * ★ 왜 "안드로이드면 무조건 키보드 높이만큼 밀기" 가 아닌가
 *   기기·설정에 따라 창이 줄어들기도 하고 안 줄어들기도 한다.
 *   줄어드는 기기에서 또 밀면 입력창이 키보드보다 한참 위로 떠버린다.
 *   그래서 창이 **실제로 줄어든 만큼**을 재서, 모자란 만큼만 채운다.
 *   양쪽 기기에서 다 맞는다.
 *
 * ★ 쓰는 법
 *   const { inset, onLayout } = useKeyboardInset();
 *   <View onLayout={onLayout} style={{ flex: 1 }}>
 *     ...
 *     <View style={{ paddingBottom: inset > 0 ? inset : safeAreaBottom }}>입력창</View>
 *   </View>
 *
 *   onLayout 은 **화면 전체를 감싸는 View** 에 걸어야 한다. 그래야 창이
 *   줄어들었는지를 잴 수 있다.
 *
 * iOS 는 KeyboardAvoidingView(behavior="padding")가 이미 잘 동작하므로
 * 그대로 두고, 이 훅은 안드로이드에서만 값을 낸다.
 */
export function useKeyboardInset() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  /** 키보드가 없을 때의 높이. 창이 얼마나 줄었는지 재는 기준선이다. */
  const restingHeight = useRef(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    // android 에는 keyboardWillShow 가 없다. Did 만 온다.
    const show = Keyboard.addListener('keyboardDidShow', (event) =>
      setKeyboardHeight(event.endCoordinates.height),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (keyboardHeight === 0 && layoutHeight > 0) restingHeight.current = layoutHeight;
  }, [keyboardHeight, layoutHeight]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setLayoutHeight(event.nativeEvent.layout.height);
  }, []);

  if (keyboardHeight === 0) return { inset: 0, onLayout };

  // 창이 줄어든 만큼은 이미 보정된 것이다. 나머지만 우리가 채운다.
  const absorbed =
    restingHeight.current > 0 ? Math.max(0, restingHeight.current - layoutHeight) : 0;

  return { inset: Math.max(0, keyboardHeight - absorbed), onLayout };
}
