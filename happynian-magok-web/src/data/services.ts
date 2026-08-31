export interface PricedService {
  id: string;
  name: string;
  regularPrice: number;
  firstVisitPrice: number;
  discountLabel: string;
}

export interface CustomQuoteService {
  id: string;
  name: string;
  note: string;
}

export const pricedServices: PricedService[] = [
  {
    id: 'texture-cut',
    name: '텍스쳐컷',
    regularPrice: 49000,
    firstVisitPrice: 29400,
    discountLabel: '1회 40% 혜택가',
  },
  {
    id: 'perm',
    name: '히피펌 · 빈티지펌 · 쉐도우펌 · 웨이브펌',
    regularPrice: 170000,
    firstVisitPrice: 102000,
    discountLabel: '1회 40% 혜택가',
  },
];

export const customQuoteServices: CustomQuoteService[] = [
  {
    id: 'color-bleach',
    name: '남성 염색 · 탈색',
    note: '모발 이력과 시술 범위에 따라 상담 후 안내',
  },
];

export const discountConditionNote =
  '1회 40% 혜택은 네이버 예약 후 N pay 결제 시 적용되며, 세부 조건은 네이버 쿠폰에서 확인해주세요.';

export function formatKrw(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}
