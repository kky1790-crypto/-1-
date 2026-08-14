# 해피니언 마곡점 판단 시스템

해피니언 마곡점 식구들이 애매한 상황에서 스스로 판단할 수 있도록 돕는
살아있는 운영·교육·판단 시스템.

## 실행 방법 (가장 쉬운 방법 — 설치 없이, 클릭만으로)

컴퓨터에 아무것도 설치할 필요 없다. GitHub 계정만 있으면 된다.

1. 이 저장소의 GitHub 페이지를 연다.
2. 브랜치를 `claude/jigeum-app-rules-s9qhdf`로 바꾼다 (화면 왼쪽 위, 브랜치
   이름이 적힌 드롭다운).
3. 초록색 **`<> Code`** 버튼을 누른다.
4. 뜨는 메뉴에서 **`Codespaces`** 탭을 누른다.
5. **`Create codespace on claude/jigeum-app-rules-s9qhdf`** 버튼을 누른다.
6. 1~2분 정도 화면이 준비되는 것을 기다린다(자동으로 설치와 서버 실행까지
   진행된다 — 아무것도 입력할 필요 없음).
7. 준비가 끝나면 브라우저 새 탭이 **자동으로 2개** 뜬다:
   - 검수 관리자 화면 (원문/승인) — 포트 4000
   - 식구용 화면 (승인된 내용만 보임) — 포트 4100

   만약 자동으로 안 뜨면, 화면 아래쪽 "PORTS" 탭에서 4000/4100 옆의
   지구본(🌐) 아이콘을 눌러서 연다.

이후 다시 들어올 때는 GitHub의 **`Code` → `Codespaces`** 탭에 만들어둔
Codespace가 남아있으니 그걸 다시 열면 된다(새로 만들 필요 없음).

### 로컬 컴퓨터에 직접 설치해서 쓰고 싶다면

Node.js(18 이상)와 git이 설치되어 있어야 한다.

```bash
git clone https://github.com/kky1790-crypto/-1-
cd -1-
git checkout claude/jigeum-app-rules-s9qhdf
cd review-admin && npm install && npm start   # http://localhost:4000
```
새 터미널 창을 하나 더 열어서:
```bash
cd -1-/app && npm install && npm start          # http://localhost:4100
```

각 프로그램 상세 설명은 [`review-admin/README.md`](./review-admin/README.md),
[`app/README.md`](./app/README.md) 참고.

## 문서

- 프로젝트 헌법(개발 규칙): [`CLAUDE.md`](./CLAUDE.md)
- 제품 목적/Phase 로드맵: [`docs/PRODUCT.md`](./docs/PRODUCT.md)
- 정보구조(메뉴/화면): [`docs/IA.md`](./docs/IA.md)
- Phase 1 원자료 인벤토리 스키마: [`docs/INVENTORY_MODEL.md`](./docs/INVENTORY_MODEL.md)
- Phase 2 콘텐츠 데이터 모델: [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md)
- 출처 레벨 정책: [`docs/SOURCE_POLICY.md`](./docs/SOURCE_POLICY.md)
- 완료 전 QA 체크리스트: [`docs/QA_CHECKLIST.md`](./docs/QA_CHECKLIST.md)
- 변경 이력: [`CHANGELOG.md`](./CHANGELOG.md)

## 현재 상태 (Phase 로드맵 기준)

- Phase 0 (프로젝트 기반: 헌법/Skills/Agents/폴더 구조) — 완료
- Phase 1 (Knowledge Inventory) — 진행 중, `inventory/items/`에 원자료 3건
  (전부 `pending_review`)
- Phase 1.5 (`review-admin/` 관리자 검수 시스템) — 프로토타입 v1
- Phase 2 (`content/`) — 미착수, 여전히 빈 상태
- Phase 3 (`app/` 식구용 앱) — 프로토타입 v1, `review-admin`의 승인된
  항목만 재노출
- Phase 4~5 — 미착수

사용자가 지금의 3건짜리 검수/공개 구조를 직접 써보고 확인하기 전까지는
나머지 원자료를 추가하지 않는다. 실행 방법은 `review-admin/README.md`,
`app/README.md` 참고.