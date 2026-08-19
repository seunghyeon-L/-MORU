# 백엔드 개발 환경 세팅

처음 합류하셨다면 이 문서만 따라 하시면 됩니다. **20분** 정도 걸립니다.

---

## 0. 팀에서 따로 받아야 할 것 2개

깃허브에 없습니다. **팀 비공개 채널(카톡/디스코드 DM)로 받으세요.**

| 파일 | 내용 | 넣을 위치 |
|---|---|---|
| `.env` | OpenAI 키, DB 비밀번호 | `server/.env` |
| `moru_team` | 서버 접속 SSH 키 | `C:\Users\<본인>\.ssh\moru_team` |

⚠️ 둘 다 **절대 커밋하지 마세요.** `.gitignore`에 이미 막아뒀지만, 다른 폴더로 옮기면 뚫립니다.

---

## 1. 설치할 것 (직접)

| | 확인 명령 |
|---|---|
| **Python 3.10 이상** | `python --version` |
| **Git** | `git --version` |

PostgreSQL은 **설치하지 않습니다.** 서버 DB를 같이 씁니다 (아래 3번).

---

## 2. 저장소 클론 · 패키지 설치

```bash
git clone https://github.com/seunghyeon-L/-MORU.git
cd -MORU/server

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
```

`(venv)` 가 프롬프트 앞에 붙으면 성공입니다.

> `requirements.txt` 는 **라이브러리만** 설치합니다. Python 자체나 DB는 설치해주지 않습니다.
> (Node의 `package.json` + `npm install` 과 같은 역할)

---

## 3. DB 연결 — SSH 터널

우리는 **서버 PostgreSQL 하나를 같이** 씁니다. 로컬 설치가 필요 없습니다.

### 켜는 법

`server/db-tunnel.bat` **더블클릭**. 창이 열리면 그대로 두세요.

```
localhost:5432  ->  서버 PostgreSQL
```

이 창이 켜져 있는 동안 코드에서는 그냥 로컬 DB처럼 쓰면 됩니다.

### 확인

터널을 켠 채로 **다른 창**에서:

```bash
python -c "import psycopg2,os; from dotenv import load_dotenv; load_dotenv(); c=psycopg2.connect(host='127.0.0.1',port=5432,dbname='moru',user='moru',password=os.getenv('DB_PASSWORD')); print('DB 연결 성공'); c.close()"
```

### ⚠️ 주의

- **터널 창을 닫으면 DB가 끊깁니다.** 개발 중엔 계속 켜두세요
- **데이터를 같이 봅니다.** 상대가 테이블을 지우면 내 것도 사라집니다. 테이블 삭제·초기화는 미리 말하고 하세요

---

## 4. 서버 실행

```bash
venv\Scripts\activate
uvicorn main:app --reload
```

http://127.0.0.1:8000 → `{"service":"MORU","status":"ok"}`
http://127.0.0.1:8000/docs → **API 문서 (자동 생성)**

`--reload` 는 코드를 고치면 자동으로 다시 뜹니다.

---

## 5. 배포된 서버

우리가 만든 API는 여기에 떠 있습니다.

```
https://1-201-117-54.sslip.io
```

앱(React Native)은 이 주소를 부릅니다. 로컬에서 고친 코드를 여기 반영하는 방법은 팀에 문의하세요.

---

## 자주 막히는 곳

| 증상 | 원인 · 해결 |
|---|---|
| `venv\Scripts\activate` 가 안 먹힘 | PowerShell이면 `venv\Scripts\Activate.ps1`. 권한 오류면 `Set-ExecutionPolicy -Scope Process RemoteSigned` |
| DB 연결 실패 | 터널 창이 꺼져 있음. `db-tunnel.bat` 확인 |
| `Permission denied (publickey)` | `moru_team` 키가 `.ssh` 폴더에 없음 |
| `ModuleNotFoundError` | `venv` 활성화를 안 함. 프롬프트에 `(venv)` 있는지 확인 |
