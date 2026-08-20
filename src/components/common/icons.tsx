import { View } from 'react-native';

/**
 * Figma에 있는 형태를 그대로 재현하기 위한 최소한의 outline 아이콘 모음.
 * 이 프로젝트에 해당 아이콘 세트(Unicons 등)가 설치되어 있지 않아
 * 새 라이브러리 없이 View 도형으로 직접 그린다. (이모지/대체 아이콘 사용 금지)
 */

const STROKE = 1.6;

export type IconProps = {
  size: number;
  color: string;
};

/** Figma "uil:camera" 형태 — 카메라 몸체 + 뷰파인더 돌기 + 렌즈 원 */
export function CameraIcon({ size, color }: IconProps) {
  const s = size / 24;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: 2 * s,
          top: 8 * s,
          width: 20 * s,
          height: 13 * s,
          borderRadius: 4 * s,
          borderWidth: STROKE,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 6 * s,
          top: 5 * s,
          width: 8 * s,
          height: 5 * s,
          borderTopLeftRadius: 2 * s,
          borderTopRightRadius: 2 * s,
          borderWidth: STROKE,
          borderBottomWidth: 0,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 8.5 * s,
          top: 11 * s,
          width: 7 * s,
          height: 7 * s,
          borderRadius: 3.5 * s,
          borderWidth: STROKE,
          borderColor: color,
        }}
      />
    </View>
  );
}

/** 증상 기록 카드 아이콘 — 맥박/컨디션을 나타내는 pulse 라인 */
export function PulseIcon({ size, color }: IconProps) {
  const s = size / 24;
  const bar = (left: number, top: number, width: number, rotate: string) => ({
    position: 'absolute' as const,
    left: left * s,
    top: top * s,
    width: width * s,
    height: STROKE,
    borderRadius: STROKE / 2,
    backgroundColor: color,
    transform: [{ rotate }],
  });
  return (
    <View style={{ width: size, height: size }}>
      <View style={bar(2, 12, 5, '0deg')} />
      <View style={bar(6.2, 12, 7, '-52deg')} />
      <View style={bar(11.8, 12, 7, '52deg')} />
      <View style={bar(17, 12, 5, '0deg')} />
    </View>
  );
}

/** AI 카드 오른쪽의 얇은 '›' chevron */
export function ChevronRightIcon({ size, color }: IconProps) {
  const s = size / 24;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 8 * s,
          height: 8 * s,
          borderTopWidth: STROKE,
          borderRightWidth: STROKE,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

/** "오늘의 상태" CTA 아이콘 — 웃는 얼굴 + plus 배지 */
export function SmilePlusIcon({ size, color }: IconProps) {
  const s = size / 24;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: 1 * s,
          top: 1 * s,
          width: 15 * s,
          height: 15 * s,
          borderRadius: 7.5 * s,
          borderWidth: STROKE,
          borderColor: color,
        }}
      />
      <View
        style={{ position: 'absolute', left: 5.5 * s, top: 6.5 * s, width: 1.6 * s, height: 1.6 * s, borderRadius: 1 * s, backgroundColor: color }}
      />
      <View
        style={{ position: 'absolute', left: 11 * s, top: 6.5 * s, width: 1.6 * s, height: 1.6 * s, borderRadius: 1 * s, backgroundColor: color }}
      />
      <View
        style={{
          position: 'absolute',
          left: 5 * s,
          top: 9 * s,
          width: 8 * s,
          height: 4 * s,
          borderBottomLeftRadius: 4 * s,
          borderBottomRightRadius: 4 * s,
          borderWidth: STROKE,
          borderTopWidth: 0,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 15 * s,
          top: 15 * s,
          width: 8 * s,
          height: 8 * s,
          borderRadius: 4 * s,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View style={{ position: 'absolute', width: 4 * s, height: STROKE, backgroundColor: 'white', borderRadius: 1 }} />
        <View style={{ position: 'absolute', width: STROKE, height: 4 * s, backgroundColor: 'white', borderRadius: 1 }} />
      </View>
    </View>
  );
}

/** D1 "메뉴 검색" — 돋보기 */
export function SearchIcon({ size, color }: IconProps) {
  const s = size / 24;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: 3 * s,
          top: 3 * s,
          width: 13 * s,
          height: 13 * s,
          borderRadius: 6.5 * s,
          borderWidth: STROKE,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 14 * s,
          top: 14 * s,
          width: 8 * s,
          height: STROKE,
          borderRadius: 1,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

/** D1 "직접 입력" — 연필 */
export function PencilIcon({ size, color }: IconProps) {
  const s = size / 24;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 15 * s,
          height: 3.2 * s,
          borderRadius: 1.6 * s,
          backgroundColor: color,
          transform: [{ rotate: '-45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 3 * s,
          top: 14.5 * s,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderLeftWidth: 3 * s,
          borderRightWidth: 3 * s,
          borderTopWidth: 5 * s,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: color,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

/** F1 재도입 제안 상단 · F3 안심 안내 — 새싹(잎 두 장 + 흙) */
export function SproutIcon({ size, color }: IconProps) {
  const s = size / 24;
  const leafStyle = (left: number, rotate: string) => ({
    position: 'absolute' as const,
    left: left * s,
    top: 4 * s,
    width: 9 * s,
    height: 15 * s,
    borderRadius: 7 * s,
    borderWidth: STROKE,
    borderColor: color,
    transform: [{ rotate }],
  });
  return (
    <View style={{ width: size, height: size }}>
      <View style={leafStyle(5.5, '-16deg')} />
      <View style={leafStyle(9.5, '16deg')} />
      <View
        style={{
          position: 'absolute',
          left: 4 * s,
          top: 18 * s,
          width: 16 * s,
          height: 3 * s,
          borderRadius: 1.5 * s,
          borderWidth: STROKE,
          borderColor: color,
        }}
      />
    </View>
  );
}

/** G 나의 식탁 상단 우측 — 세로 점 3개 메뉴 */
export function MoreVerticalIcon({ size, color }: IconProps) {
  const s = size / 24;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {[6, 12, 18].map((top) => (
        <View
          key={top}
          style={{
            position: 'absolute',
            top: top * s,
            width: 3.2 * s,
            height: 3.2 * s,
            borderRadius: 1.6 * s,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}

/** H2 대체 레시피 상단 일러스트 — 빨대 꽂힌 음료 컵 */
export function CupIcon({ size, color }: IconProps) {
  const s = size / 24;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: 5 * s,
          top: 8 * s,
          width: 14 * s,
          height: 13 * s,
          borderBottomLeftRadius: 3 * s,
          borderBottomRightRadius: 3 * s,
          borderWidth: STROKE,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 4 * s,
          top: 6 * s,
          width: 16 * s,
          height: 3 * s,
          borderRadius: 1.5 * s,
          borderWidth: STROKE,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 13.5 * s,
          top: 1 * s,
          width: STROKE,
          height: 8 * s,
          borderRadius: 1,
          backgroundColor: color,
          transform: [{ rotate: '18deg' }],
        }}
      />
    </View>
  );
}

/** D1 "원재료표 촬영" — 문서/라벨 */
export function DocumentIcon({ size, color }: IconProps) {
  const s = size / 24;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: 5 * s,
          top: 3 * s,
          width: 14 * s,
          height: 18 * s,
          borderRadius: 2.5 * s,
          borderWidth: STROKE,
          borderColor: color,
        }}
      />
      {[8, 12, 16].map((top) => (
        <View
          key={top}
          style={{
            position: 'absolute',
            left: 8.5 * s,
            top: top * s,
            width: 7 * s,
            height: STROKE,
            borderRadius: 1,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}

/** H1 "성분 조절 제안" — 순환/조절을 나타내는 refresh 원형 화살표 */
export function RefreshIcon({ size, color }: IconProps) {
  const s = size / 24;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: 4 * s,
          top: 4 * s,
          width: 16 * s,
          height: 16 * s,
          borderRadius: 8 * s,
          borderWidth: STROKE,
          borderTopColor: color,
          borderRightColor: color,
          borderBottomColor: color,
          borderLeftColor: 'transparent',
          transform: [{ rotate: '-25deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 14.5 * s,
          top: 2.5 * s,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderLeftWidth: 3 * s,
          borderRightWidth: 3 * s,
          borderBottomWidth: 4.5 * s,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
          transform: [{ rotate: '112deg' }],
        }}
      />
    </View>
  );
}

/** H1 "나에게 맞는 선택" — 네잎클로버 */
export function CloverIcon({ size, color }: IconProps) {
  const s = size / 24;
  const petal = (left: number, top: number) => ({
    position: 'absolute' as const,
    left: left * s,
    top: top * s,
    width: 9 * s,
    height: 9 * s,
    borderRadius: 4.5 * s,
    backgroundColor: color,
  });
  return (
    <View style={{ width: size, height: size }}>
      <View style={petal(7.5, 3)} />
      <View style={petal(7.5, 11)} />
      <View style={petal(3.5, 7)} />
      <View style={petal(11.5, 7)} />
      <View
        style={{
          position: 'absolute',
          left: 11 * s,
          top: 16 * s,
          width: STROKE,
          height: 6 * s,
          borderRadius: 1,
          backgroundColor: color,
          transform: [{ rotate: '20deg' }],
        }}
      />
    </View>
  );
}

/** 채팅 입력창 전송 버튼 — 위쪽 화살표 */
export function SendArrowIcon({ size, color }: IconProps) {
  const s = size / 24;
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View
        style={{
          position: 'absolute',
          top: 4 * s,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderLeftWidth: 4.5 * s,
          borderRightWidth: 4.5 * s,
          borderBottomWidth: 6 * s,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 9 * s,
          width: STROKE + 0.4,
          height: 11 * s,
          borderRadius: 1,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
