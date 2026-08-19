import { Redirect } from 'expo-router';

/** 증상 기록 진입점. 실제 첫 화면은 불편함 정도(1~9)를 묻는 /symptom/severity 다. */
export default function SymptomScreen() {
  return <Redirect href="/symptom/severity" />;
}
