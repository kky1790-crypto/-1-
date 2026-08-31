/**
 * Site-wide configuration.
 *
 * SITE_URL (origin only, no path) and BASE_PATH (subpath the site is
 * served under) together control canonical tags, sitemap.xml, Open
 * Graph/Twitter image URLs, and every internal link on the site — see
 * withBase() below. See README.md "배포 전 설정" for the full checklist.
 *
 * Currently deployed as a GitHub Pages *project* site, which is served
 * under /<repo-name>/ rather than the domain root, hence BASE_PATH.
 * Moving to a custom domain at its own root later means setting
 * BASE_PATH back to '/'.
 */
export const SITE_URL = 'https://kky1790-crypto.github.io';
export const BASE_PATH = '/-1-/';

/**
 * Prefixes a root-relative path (or same-page fragment like '/#work')
 * with BASE_PATH. Use this for every internal <a href>, canonical path,
 * and breadcrumb/JSON-LD URL in the app — plain '/work/' style strings
 * will 404 once the site is served from a subpath.
 */
export function withBase(path: string): string {
  return BASE_PATH + path.replace(/^\//, '');
}

export const BRAND = {
  displayName: '강윤 디자이너 | Happynian Magok',
  shopName: 'Happynian Magok',
  shopNameKo: '해피니언 마곡',
  wordmark: 'HAPPYNIAN MAGOK',
} as const;

export const CONTACT = {
  naverBookingUrl: 'https://booking.naver.com/booking/13/bizes/324883',
  instagramUrl: 'https://www.instagram.com/happynian_kangyoon/',
  naverMapUrl:
    'https://map.naver.com/p/search/해피니언%20마곡/place/1322402318?placePath=%2Fhome%3Fbk_query%3D해피니언%20마곡%26from%3Dmap%26fromPanelNum%3D2%26timestamp%3D202608311741%26locale%3Dko%26svcName%3Dmap_pcv5%26searchText%3D해피니언%20마곡%26from%3Dmap%26fromPanelNum%3D2%26timestamp%3D202608311741%26locale%3Dko%26svcName%3Dmap_pcv5%26searchText%3D해피니언%20마곡&entry=pll&from=map&fromNxList=true&fromPanelNum=2&timestamp=202608310012&locale=ko&svcName=map_pcv5&searchText=해피니언%20마곡&searchType=place&c=15.00,0,0,0,dh',
  address: '서울특별시 강서구 마곡중앙4로 18, 그랑트윈타워 B동 204호',
  addressRegion: '서울특별시',
  addressLocality: '강서구',
  streetAddress: '마곡중앙4로 18, 그랑트윈타워 B동 204호',
  postalCode: '',
  transit: '마곡역 4번 출구에서 약 158m',
  parking: '그랑트윈타워 B동 주차장 이용',
  hoursNote: '영업시간은 변동될 수 있어 정확한 예약 가능 시간은 네이버 예약에서 확인해주세요.',
  naverSelectNote: '네이버 예약 화면에서 디자이너 ‘강윤’을 선택해주세요.',
} as const;

export const NAV = [
  { label: '작업', href: withBase('/#work') },
  { label: '상담', href: withBase('/#consultation') },
  { label: '시술', href: withBase('/#services') },
  { label: '소개', href: withBase('/#about') },
  { label: '가이드', href: withBase('/guide/') },
  { label: '방문', href: withBase('/#visit') },
] as const;

export const CTA = {
  primary: '강윤 디자이너로 네이버 예약하기',
  primarySub: '예약 화면에서 ‘강윤’을 선택해주세요.',
  secondary: '강윤의 작업 보기',
} as const;
