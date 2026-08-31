# 사장님을 위한 콘텐츠 수정 가이드

개발 지식이 없어도 이 문서를 보고 사진, 가격, 문구, 링크, 가이드 글, 새 디자이너를 수정할 수
있습니다. 모든 콘텐츠는 `src/data/` 폴더 안의 파일 몇 개에 모여 있고, 화면 여러 곳에 흩어져
있지 않습니다. 한 곳만 고치면 관련된 모든 페이지에 자동으로 반영됩니다.

수정 방법 요약:

1. 아래 안내에 따라 해당 파일을 텍스트 편집기(메모장, VS Code 등)로 엽니다.
2. 따옴표(`'...'`) 안의 한국어 문구나 숫자만 바꿉니다. 따옴표, 쉼표, 중괄호(`{`, `}`) 같은
   기호는 건드리지 않습니다.
3. 저장한 뒤 `npm run build` 를 다시 실행하면 반영됩니다. (개발자에게 요청하거나, 터미널
   사용법을 안다면 프로젝트 폴더에서 직접 실행할 수 있습니다.)

---

## 1. 문구(카피) 수정하기

파일: `src/data/site.ts`

- `CONTACT.hoursNote`, `CONTACT.naverSelectNote` 같은 안내 문구
- `CTA.primary`, `CTA.primarySub`, `CTA.secondary` — 버튼 문구

첫 화면 제목, 본문, 강윤 소개 문구처럼 페이지에 직접 쓰여 있는 긴 문구는 아래 파일에 있습니다.

- 첫 화면 H1·본문: `src/pages/index.astro` 상단 `<h1>`, `<p class="hero-body">` 부분
- 강윤 소개 제목·본문: `src/data/designers.ts` 의 `introTitle`, `introParagraphs`

## 2. 가격 수정하기

파일: `src/data/services.ts`

```ts
{
  id: 'texture-cut',
  name: '텍스쳐컷',
  regularPrice: 49000,      // 정상가 — 숫자만 수정
  firstVisitPrice: 29400,   // 1회 혜택가 — 숫자만 수정
  discountLabel: '1회 40% 혜택가',
},
```

숫자만 바꾸면 화면에는 `49,000원`처럼 쉼표가 자동으로 붙어서 표시됩니다. 할인 조건 문구는
같은 파일의 `discountConditionNote` 에서 수정합니다.

염색·탈색처럼 가격을 표시하지 않는 시술은 `customQuoteServices` 배열에서 `note` 문구만
수정하면 됩니다. **가격 숫자를 새로 추가하지 마세요** — 상담 후 안내하는 시술입니다.

## 3. 링크·주소·연락처 수정하기

파일: `src/data/site.ts` 의 `CONTACT` 객체

```ts
export const CONTACT = {
  naverBookingUrl: '...',   // 네이버 예약 링크
  instagramUrl: '...',      // 인스타그램 링크
  naverMapUrl: '...',       // 네이버 지도 링크
  address: '...',           // 화면에 표시되는 전체 주소
  transit: '...',           // 교통 안내
  parking: '...',           // 주차 안내
  hoursNote: '...',         // 영업시간 안내 문구
  naverSelectNote: '...',   // "네이버 예약에서 강윤을 선택해주세요" 안내
};
```

이 값들은 헤더, 푸터, 방문 안내(VISIT) 섹션, 모바일 고정 예약 버튼 등 사이트 전체에서
공통으로 사용됩니다. 이 파일 하나만 고치면 모든 곳에 반영됩니다.

## 4. 사진 교체·추가하기

1. 새 사진 파일을 `src/assets/works/` (작업 사진) 또는 `src/assets/profile/` (프로필 사진)
   폴더에 넣습니다. 파일 형식은 JPEG를 권장합니다.
2. `src/data/works.ts` 파일 상단의 `import` 목록에 새 사진을 추가합니다.

   ```ts
   import myNewPhoto from '@/assets/works/my-new-photo.jpeg';
   ```

3. 해당 작업 항목의 `heroImage.src` 값을 새로 import한 이름으로 바꿉니다.
4. **alt(대체 텍스트)는 반드시 사진 내용을 정확히 설명하는 한국어로 작성**하세요. 검색엔진과
   스크린리더 사용자가 사진 내용을 이해하는 유일한 방법입니다. 실제로 보이지 않는 내용
   (수상, 후기 등)을 적지 마세요.

빌드 시 WebP/AVIF 변환과 반응형 크기 생성이 자동으로 이루어지므로, 원본 파일 크기를 미리
줄일 필요는 없습니다.

### 사진 크롭(잘림) 조정

사진에 따라 `objectPosition`(어느 부분을 보여줄지)과 `zoom`(배경 요소를 화면 밖으로
밀어내는 확대 비율) 값이 지정되어 있을 수 있습니다. `src/data/works.ts` 에서 조정합니다.

```ts
heroImage: {
  src: vintageHippiePerm,
  alt: '...',
  objectPosition: 'center 100%', // 숫자가 클수록 사진의 아래쪽을 보여주고, 위쪽을 자릅니다
  zoom: 1.16,                    // 1보다 크면 확대 — 배경의 방해 요소를 화면 밖으로 밀어냅니다
},
```

## 5. 상담 고민(CONSULTATION) 문구 수정하기

파일: `src/data/consultation.ts`

`concerns` 배열의 `text` 값 4개를 수정하면 됩니다. 순서를 바꾸려면 배열 안에서 항목의
위치를 바꾸면 됩니다.

## 6. 가이드 글 수정·추가하기

파일: `src/data/guides.ts`

각 가이드는 다음 구조로 되어 있습니다.

```ts
{
  slug: 'how-to-choose-mens-hair-in-magok',  // 주소(URL)에 쓰이는 영문 — 공개 후에는 함부로 바꾸지 마세요
  title: '...',            // 글 제목
  description: '...',      // 검색 결과에 보이는 요약문
  publishedDate: '2026-08-31',
  updatedDate: '2026-08-31',  // 내용을 고친 날짜로 업데이트
  author: '강윤 디자이너',
  relatedWorkSlugs: [...], // 글 하단에 연결할 관련 작업
  sections: [
    { heading: '소제목', paragraphs: ['문단1', '문단2'] },
    ...
  ],
}
```

새 가이드 글을 추가하려면 `guides` 배열에 위와 같은 형태로 항목을 하나 더 추가하면
`/guide/새-slug/` 주소로 자동 생성됩니다. `slug`는 영문 소문자와 하이픈(`-`)만 사용하세요.

## 7. 새 디자이너 추가하기 (예: 효리)

이 사이트는 강윤 외에 다른 식구를 나중에 추가할 수 있도록 설계되어 있습니다.

1. `src/data/designers.ts` 의 `designers` 배열에 새 항목을 추가합니다. 프로필 사진은
   `src/assets/profile/` 에 넣고 import 합니다.
2. `src/data/works.ts` 에 새 디자이너의 작업을 추가할 때 `designerId` 값을 새 디자이너의
   `id`와 동일하게 지정합니다.
3. 새 디자이너의 소개 페이지나 랜딩 영역이 필요하면 개발자에게 요청해 `/work/` 구조와 같은
   방식으로 라우트를 추가할 수 있습니다. (현재 버전은 강윤 콘텐츠만 공개하도록 되어 있으며,
   이 구조 변경은 별도 작업이 필요합니다.)

## 8. 절대 하지 말아야 할 것

- **가짜 후기, 수상, 자격, 유명인 관련 표현을 추가하지 마세요.** 사실이 아닌 내용은 신뢰를
  해치고, 검색엔진 가이드라인에도 위배됩니다.
- **탈색 과정 사진(work-02-bleach-process)을 "Before" 사진으로 표기하지 마세요.** 시술
  과정 사진일 뿐, 이전 상태 사진이 아닙니다.
- **가격에 없는 숫자(염색·탈색 정가 등)를 임의로 만들어 넣지 마세요.**
- **`Happynian`의 철자를 `Happynion` 등으로 바꾸지 마세요.**
- **`SITE_URL`(`src/data/site.ts`)을 실제 도메인이 정해지기 전에 임의의 값으로 바꾸지
  마세요.** 실제 도메인이 정해졌을 때만 그 값으로 교체하세요.
