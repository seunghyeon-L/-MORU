# 배포

배포가 두 갈래다. **서버는 이미 돌고 있고, 앱이 남았다.**

---

## 0. 지금 상태

| | 상태 |
|---|---|
| 서버 | ✅ 돌고 있음 · `https://1-201-117-54.sslip.io` |
| DB | ✅ 서버 PostgreSQL, 마스터 데이터 채워짐 |
| API | ✅ 전 엔드포인트 실제 데이터로 동작 |
| **앱** | ⚠️ **아직 목업 데이터만 씀. 서버를 부르지 않는다** |

**데모 전에 반드시 해야 하는 건 앱 빌드가 아니라 API 연결이다.**
지금 빌드해봐야 가짜 데이터가 도는 앱이 나온다.

---

## 1. 서버 배포

### 갱신하기

```bash
bash server/deploy.sh
```

이게 하는 일 — 코드 전송 → **의존성 재설치** → 재시작 → 살아났는지 확인.
안 살아나면 로그를 보여주고 실패로 끝난다.

> 의존성 재설치가 들어 있는 이유: `requirements.txt` 에 Pillow 를 추가하고
> 서버에 설치를 안 해서 **502 로 서비스가 죽은 적이 있다.**
> 수동 배포로는 이런 걸 반복해서 놓친다.

### 마이그레이션은 자동으로 안 돈다

`server/db/00N-*.sql` 을 새로 만들었으면 **먼저** 적용한다.

```bash
ssh -i ~/.ssh/moru_gabia root@1.201.117.54 \
  "sudo -u postgres psql -d moru -v ON_ERROR_STOP=1 -f -" < server/db/006-xxx.sql
```

자동화하지 않은 이유 — 스키마 변경은 되돌리기 어렵고,
DB 를 두 사람이 공유한다. 한 번 더 생각하게 만드는 편이 낫다.

### 문제가 생기면

```bash
ssh -i ~/.ssh/moru_gabia root@1.201.117.54 "journalctl -u moru -n 50 --no-pager"
curl https://1-201-117-54.sslip.io/health
```

---

## 2. 앱 배포

### 2-0. 먼저 — API 연결 (프론트)

`src/services/api.ts` 가 지금 `mock/` 을 반환한다. `fetch` 가 한 줄도 없다.
다행히 **화면들이 이 파일만 통해서 데이터를 받게 짜여 있어서**, 이 파일 하나만 고치면 된다.

```ts
const BASE = 'https://1-201-117-54.sslip.io';

// 기기 식별자. 최초 실행 때 만들어 저장하고, 이후 모든 요청에 붙인다.
async function deviceId() {
  let id = await AsyncStorage.getItem('moru_device');
  if (!id) { id = Crypto.randomUUID(); await AsyncStorage.setItem('moru_device', id); }
  return id;
}

async function call(path: string, init?: RequestInit) {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { 'X-Device-Id': await deviceId(), 'Content-Type': 'application/json',
               ...(init?.headers ?? {}) },
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error((await res.json())?.error?.message ?? '문제가 생겼어요');
  return res.json();
}
```

엔드포인트와 응답 형태는 [`dev-03-api-contract.md`](dev-03-api-contract.md),
직접 눌러볼 곳은 `https://1-201-117-54.sslip.io/docs`.

**한 화면씩 옮기는 걸 권한다.** 전부 한 번에 바꾸면 어디서 깨졌는지 모른다.
순서는 온보딩 → 홈 → 식사기록 → 나머지.

### 2-1. 데모용 — Expo Go + QR ★ 가장 빠름

심사위원이 자기 폰으로 바로 볼 수 있다. 빌드도, 스토어도, 개발자 계정도 필요 없다.

```bash
npx expo start --tunnel
```

터미널에 QR 이 뜬다. 심사위원은 **Expo Go** 앱(App Store · Play Store 무료)을 깔고 QR 을 찍으면 된다.

- `--tunnel` 은 같은 와이파이가 아니어도 되게 해준다. **행사장 네트워크를 믿지 말고 이걸 쓴다**
- iOS · Android 둘 다 된다
- 내 노트북에서 서버가 돌고 있어야 한다. **노트북을 닫으면 끊긴다**

### 2-2. 배포용 — Android APK

파일 하나로 전달된다. 스토어 심사가 없다.

```bash
npm install -g eas-cli
eas login                        # Expo 계정 (무료)
eas build:configure
eas build --platform android --profile preview
```

`eas.json` 의 `preview` 프로필이 APK 를 만든다 (`.aab` 가 아니라).

```json
{ "build": { "preview": { "android": { "buildType": "apk" } } } }
```

빌드는 Expo 클라우드에서 돌고 10~20분 걸린다. 끝나면 다운로드 링크가 나온다.
**무료 플랜은 빌드 대기열이 있어서 발표 직전에 돌리면 안 된다. 전날 미리 뽑아둔다.**

### 2-3. iOS

App Store 배포는 개발자 계정 $99 가 필요하고 심사도 걸린다. **하지 않는다.**

- 심사위원 iPhone → **2-1 Expo Go**
- TestFlight 도 $99 계정이 필요하다

---

## 3. 데모 당일 체크리스트

**전날**

- [ ] `bash server/deploy.sh` — 최신 코드가 서버에 있는지
- [ ] `python server/tests/redteam_chat.py` — 챗봇 안전 0/0 인지
- [ ] APK 미리 빌드 (대기열 때문에)
- [ ] 시연용 계정에 데이터를 미리 쌓아둘 것
      → 신규 사용자는 홈 카드가 비어 있고 패턴도 안 나온다.
        **빈 화면을 시연하면 아무것도 안 보인다.**
      → 식사 5번 이상 + 증상 3번 이상이면 패턴이 말을 시작한다

**당일 아침**

- [ ] `curl https://1-201-117-54.sslip.io/health` → `{"ok":true}`
- [ ] 폰에서 한 바퀴 직접 돌려보기 (온보딩 → 홈 → 기록 → 도전 → 식탁)
- [ ] `npx expo start --tunnel` 켜두고 QR 캡처해두기

**보험**

- [ ] 시연 영상 미리 녹화 — 네트워크가 죽어도 발표는 해야 한다
- [ ] Swagger 화면도 준비 (`/docs`) — 앱이 안 되면 API 라도 보여줄 수 있다

---

## 4. 알아둘 것

**서버 인증서 만료 2026-11-17.** 자동 갱신은 걸려 있다.

**`sslip.io` 는 도메인을 안 사고 HTTPS 를 받으려고 쓴 것이다.**
`1-201-117-54.sslip.io` → `1.201.117.54` 로 해석되는 무료 와일드카드 DNS.
진짜 도메인이라 Let's Encrypt 인증서가 나오고, 그래서 iOS ATS 예외 설정이 필요 없다.

**보안 — 아직 안 한 것**

- SSH 비밀번호 로그인이 열려 있다. 봇이 22번을 계속 두드린다
  ```bash
  # /etc/ssh/sshd_config → PasswordAuthentication no
  systemctl restart ssh
  ```
- 보안그룹에 3389(원격데스크톱)이 `0.0.0.0/0` 으로 열려 있다. 쓰지 않으니 삭제할 것

**로그인이 없다.** `X-Device-Id` 로만 사용자를 구분한다.
기기를 바꾸거나 앱을 지우면 데이터가 사라진다. 해커톤 범위에서 수용한 결정이다.
