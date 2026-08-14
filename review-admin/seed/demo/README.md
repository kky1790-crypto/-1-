# seed/demo/

이 폴더의 `.md` 파일은 **데모 데이터**다. 실제 마곡점 원자료가 아니다.

두 항목 모두 사용자(강윤)가 이 프로젝트를 만드는 대화 중 review-admin의
요구사항(Phase 1 스키마, 원문/정리본 분리 UI)을 설명하기 위해 직접 예로 든
문장을 그대로 가져온 것이며, `title`에 `[데모]` 접두어와 `notes`/
`source.context` 필드에 데모용임을 명시해뒀다. `source_level: unknown`,
`authority_status: unknown`으로 두어 실제 검증된 출처처럼 보이지 않게 했다.

`npm run seed:demo`를 실행해야만 `inventory/items/`에 복사된다 — 이 폴더
자체는 실제 검수 대상이 아니다 (`CLAUDE.md` 19장 NO FAKE DATA IN PRODUCTION).

각 파일은 frontmatter(`---`)로 시작해야 한다 — `gray-matter`는 파일의
첫 줄이 `---`가 아니면 frontmatter 자체를 인식하지 못하고 전체 파일을
본문으로 취급한다(이 프로젝트에서 실제로 한 번 이 문제로 빈 항목이
생성된 적이 있다). 이 폴더의 파일에는 frontmatter 앞에 주석이나 다른
텍스트를 두지 않는다.
