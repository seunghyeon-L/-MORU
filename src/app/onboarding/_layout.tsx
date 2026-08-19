import { Stack } from 'expo-router';

/** 온보딩 플로우 (safety → medical → allergy → avoided-food → symptoms) */
export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
