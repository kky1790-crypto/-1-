# review-admin — Phase 1 원자료 관리자 검수 도구

`inventory/items/`의 원자료를 사람이 안전하고 빠르게 검수하기 위한 내부
도구다. AI가 만든 초안은 이 도구를 통해 사람이 직접 승인하기 전까지
**절대** 공식 콘텐츠나 공개 화면으로 노출되지 않는다.

이 도구는 Phase 3(식구용 기본 앱)이 아니다 — `app/`과 별개다. 여기서
말하는 "공개 미리보기"는 `review_status`/필드 분리가 코드 레벨에서
실제로 동작하는지 보여주는 최소 데모이며, Phase 3의 최종 화면이 아니다.

## 실행

```bash
cd review-admin
npm install   # 이미 설치되어 있다면 생략 가능
npm start     # http://localhost:4000
```

브라우저에서 `http://localhost:4000` 을 열면 검수 큐가 보인다.
`http://localhost:4000/api/public/items` 로 공개(식구용) 필터 결과를 직접 확인할 수 있다.

## 데모 데이터로 먼저 써보기

실제 인벤토리는 아직 비어 있다. 화면을 실제로 눌러보고 UX를 먼저 다듬고
싶다면(권장):

```bash
npm run seed:demo
```

`seed/demo/`에 있는, 이번 대화에서 사용자가 직접 예시로 든 문장 2개를
`inventory/items/`에 `pending_review` 상태로 복사한다. **이 명령을 실행하기
전까지는 `inventory/items/`가 비어 있는 상태 그대로 유지된다** — 데모
데이터가 실제 데이터처럼 조용히 섞이지 않게 하기 위해 opt-in으로
만들었다.

써본 뒤 UX를 바꾸고 싶은 부분이 있으면(필드 순서, 버튼 순서, 원문 크기 등)
알려주면 반영한다. 그 다음에 26개 주제 → 대화 전체 대량 추출로 넘어간다.

## 데이터 계층 구조

- `src/dataStore.js` — `inventory/items/*.md` 읽기/쓰기 (frontmatter, gray-matter)
- `src/historyStore.js` — `inventory/_history/<id>.jsonl` append-only 변경 이력
- `src/reviewService.js` — 검수 상태 전이, 필드 수정, 원문 수정(별도 모드), 검색/필터
- `src/duplicateDetection.js` — 문자 bigram Jaccard 유사도로 "중복 가능성"만 계산. 자동 병합 없음
- `src/publicFilter.js` — **공개 노출의 유일한 경로.** `review_status === 'approved'`가
  아닌 항목과 내부 전용 필드(raw_excerpt, notes, review_note, reviewed_by,
  uncertainty, conflict, duplicate_of, source 상세)는 이 함수를 거치지 않고는
  절대 밖으로 나가지 않는다

## API

관리자 API(`/api/admin/*`)는 모든 상태의 항목을 다루고 전체 필드를 반환한다.
공개 API(`/api/public/*`)는 `approved` 항목만, `publicFilter`를 거친 필드만
반환한다. 이 둘은 완전히 분리된 라우트 모듈이며, 공개 라우트는 관리자 전용
필드를 담은 객체를 직접 응답으로 내보내는 코드 경로를 갖지 않는다.

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/admin/stats` | 상태별 카운트 |
| GET | `/api/admin/items` | 목록 (검색/필터 쿼리 파라미터 지원) |
| GET | `/api/admin/items/:id` | 상세 |
| PATCH | `/api/admin/items/:id` | 필드 수정 (`raw_excerpt` 제외), 필드별 변경 이력 기록 |
| PATCH | `/api/admin/items/:id/raw-excerpt` | 원문 수정 (별도 모드), `raw_edit` 이력 기록 |
| POST | `/api/admin/items/:id/transition` | 상태 전이 (`approved`는 `confirm:true` 없으면 409) |
| GET | `/api/admin/items/:id/history` | 변경 이력 |
| GET | `/api/admin/items/:id/duplicates` | 중복 가능성 제안 |
| GET | `/api/public/items` | 승인된 항목만, 필드 화이트리스트 적용 |
| GET | `/api/public/items/:id` | 위와 동일, 단건 |

## 상태 전이

`pending_review → editing/hold/rejected/approved/archived`, 그리고
`approved`에서도 다시 `editing`(승인 취소)/`hold`/`rejected`/`archived`로
자유롭게 이동 가능하다 (`docs/INVENTORY_MODEL.md` "검수 워크플로" 참고).
모든 전이는 `inventory/_history/<id>.jsonl`에 기록된다.

## 테스트

```bash
npm test
```

`node:test`(Node 내장 테스트 러너)만 사용한다 — 별도 테스트 프레임워크
의존성 없음.

## 아직 없는 것 / 알려진 한계 (review_needed)

- 인증 없음: 현재 단일 관리자(강윤) 사용을 전제로 한다. localhost 밖으로
  배포하기 전에 반드시 인증을 추가해야 한다. (`source_level`/`authority_status`
  등 주요 필드는 서버에서 값 형식을 검증하지만, 이건 XSS 등 저장형 공격을
  막기 위한 것이지 "누가 접근 가능한가"를 막는 인증이 아니다.)
- 동시 편집 충돌 처리 없음: 파일 기반 저장이라 두 명이 동시에 같은
  항목을 수정하면 나중에 저장한 쪽이 이긴다 (단일 사용자 전제라 우선순위 낮음).
- Phase 2(`content/`)로의 실제 승격은 이 도구에 구현되어 있지 않다 —
  `review_status: approved`는 "사람이 확인했다"는 뜻이고, `content/`로
  옮기는 것은 `docs/INVENTORY_MODEL.md`의 별도 절차다.
- `source.speaker`/`source.date`/`source.context`는 이 도구에서 수정할 방법이
  없다(상세 화면에 읽기 전용으로만 표시). AI 추출이 화자/날짜/맥락을 잘못
  채운 경우 지금은 고칠 수 없다 — 필요하면 관리자(사용자) 확인 후 편집
  기능을 추가해야 한다.
- 반려/보류/보관 전이에는 승인과 달리 confirm 단계가 없다(스펙상 "승인만
  confirm 필수"였기 때문에 의도적). 되돌리기 번거로운 행동이니 참고할 것.
