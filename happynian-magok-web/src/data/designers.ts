import profileKangyoon from '@/assets/profile/profile-kangyoon.jpeg';
import type { ImageMetadata } from 'astro';

/**
 * Designer roster. Only 강윤 ships in v1 — the site intentionally shows
 * "강윤 콘텐츠만" for now. This array exists so a future designer (e.g.
 * 효리) can be added as a new entry without touching layout or page code:
 * add the object here, add their work items in works.ts with a matching
 * designerId, and their profile becomes reachable through the same
 * components.
 */
export interface Designer {
  id: string;
  name: string;
  role: string;
  shopUnit: string;
  yearsExperience: number;
  yearsLabel: string;
  introTitle: string;
  introParagraphs: string[];
  profileImage: ImageMetadata;
  profileImageAlt: string;
  isPublished: boolean;
}

export const designers: Designer[] = [
  {
    id: 'kangyoon',
    name: '강윤',
    role: '헤어디자이너',
    shopUnit: 'Happynian Magok',
    yearsExperience: 11,
    yearsLabel: '11 YEARS OF EXPERIENCE',
    introTitle: '머리도 만족하고, 여기 오길 잘했다는 기분까지.',
    introParagraphs: [
      '11년 동안 헤어디자이너로 일하며, 고객에게 필요한 것은 단순히 유행하는 머리가 아니라 자신에게 어울리고 일상에서도 손질하기 편한 디자인이라는 것을 배웠습니다.',
      '시술이 끝났을 때 머리만 마음에 드는 것이 아니라, “여기 오길 잘했다”는 기분까지 남는 시간을 만들고 싶습니다.',
    ],
    profileImage: profileKangyoon,
    profileImageAlt: '강윤 디자이너 프로필 사진',
    isPublished: true,
  },
];

export const primaryDesigner: Designer = designers[0];
