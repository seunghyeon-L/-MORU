// OpenAI API 연결 확인
// 키는 .env 에서만 읽고, 화면에는 앞뒤 일부만 찍습니다.
import fs from 'node:fs';

function loadEnv() {
  const out = {};
  if (!fs.existsSync('.env')) return out;
  for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return out;
}

const env = { ...loadEnv(), ...process.env };
const key = env.OPENAI_API_KEY;

if (!key || key.startsWith('sk-...')) {
  console.log('✗ .env 에 OPENAI_API_KEY 가 없습니다.');
  console.log('  .env.example 을 .env 로 복사하고 키를 넣어주세요.');
  process.exit(1);
}
console.log('· 키 인식됨 (' + key.slice(0, 7) + '...' + key.slice(-4) + ', 길이 ' + key.length + ')');

// 1) 인증 확인
const r1 = await fetch('https://api.openai.com/v1/models', {
  headers: { Authorization: 'Bearer ' + key }
});
if (!r1.ok) {
  console.log('✗ 인증 실패 (HTTP ' + r1.status + ')');
  console.log((await r1.text()).slice(0, 400));
  process.exit(1);
}
const models = (await r1.json()).data.map(m => m.id);
console.log('✓ 인증 성공 — 사용 가능한 모델 ' + models.length + '개');

const gpt = models.filter(m => /^gpt-/.test(m)).sort();
console.log('  gpt 계열 상위: ' + gpt.slice(0, 10).join(', '));

// 2) 실제 호출 (과금 경로까지 확인)
const prefer = ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4o'];
const model = prefer.find(m => models.includes(m)) || gpt[0] || models[0];
console.log('· 테스트 호출: ' + model);

const r2 = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model,
    messages: [{ role: 'user', content: '연결 테스트입니다. OK 라고만 답하세요.' }],
    max_tokens: 5
  })
});
const j2 = await r2.json();

if (!r2.ok) {
  console.log('✗ 호출 실패 (HTTP ' + r2.status + ')');
  console.log(JSON.stringify(j2, null, 2).slice(0, 600));
  if (j2.error && j2.error.code === 'insufficient_quota') {
    console.log('');
    console.log('→ 크레딧이 없습니다. Settings → Billing 에서 잔액을 확인하세요.');
  }
  process.exit(1);
}

console.log('✓ 응답: "' + j2.choices[0].message.content.trim() + '"');
console.log('  토큰: 입력 ' + j2.usage.prompt_tokens + ' / 출력 ' + j2.usage.completion_tokens);

// 3) 비전(이미지 입력) 지원 확인 — 우리 핵심 기능
const tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const r3 = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: '이 이미지의 색을 한 단어로.' },
        { type: 'image_url', image_url: { url: tinyPng } }
      ]
    }],
    max_tokens: 10
  })
});
if (r3.ok) {
  console.log('✓ 비전(이미지 입력) 호출 가능 — 사진 분석 경로 확보');
} else {
  const j3 = await r3.json();
  console.log('△ 비전 호출 실패: ' + (j3.error ? j3.error.message : r3.status));
  console.log('  → 다른 모델을 써야 할 수 있습니다.');
}

console.log('');
console.log('모두 정상입니다.');
