import type { ImageMetadata } from 'astro';
import ashBeigeMain from '@/assets/works/work-01-ash-beige-main.jpeg';
import ashBeigeEditorial from '@/assets/works/work-01-ash-beige-editorial.jpeg';
import blondeFinal from '@/assets/works/work-02-blonde-final.jpeg';
import bleachProcess from '@/assets/works/work-02-bleach-process.jpeg';
import vintageHippiePerm from '@/assets/works/work-03-vintage-hippie-perm.jpeg';
import seeThroughLeafCut from '@/assets/works/work-04-see-through-leaf-cut.jpeg';

export interface WorkImage {
  src: ImageMetadata;
  alt: string;
  /** CSS object-position value, tuned per-photo so faces/hair are never cropped out. */
  objectPosition?: string;
  /**
   * Extra CSS transform: scale() applied on top of object-fit: cover, used only
   * to push a background distraction (e.g. the deer-ear artwork behind work-03)
   * further out of frame without cropping into the face or hair.
   */
  zoom?: number;
}

export interface Work {
  slug: string;
  number: string;
  styleName: string;
  shortLabel: string;
  designerId: string;
  heroImage: WorkImage;
  secondaryImage?: WorkImage;
  /** Observable design characteristics only — nothing about process time, product, or outcome not shown. */
  observedFeatures: string[];
  /** Concern IDs (see consultation.ts) this style is relevant to discuss in a consultation. */
  relevantConcerns: string[];
  /** Short framing of who might bring this up in a consultation. */
  consultationNote: string;
}

export const hairResultDisclaimer =
  '모발 굵기, 손상도, 이전 시술 이력에 따라 실제 결과와 유지되는 모습은 달라질 수 있습니다. 상담을 통해 현재 모발 상태에 맞는 방식을 함께 확인합니다.';

export const works: Work[] = [
  {
    slug: 'ash-beige-texture-cut',
    number: '01',
    styleName: '애쉬베이지 브라운 · 텍스쳐컷',
    shortLabel: '애쉬베이지 텍스쳐컷',
    designerId: 'kangyoon',
    heroImage: {
      src: ashBeigeMain,
      alt: '애쉬베이지 브라운 컬러와 텍스쳐컷을 한 남성의 인물 사진',
    },
    secondaryImage: {
      src: ashBeigeEditorial,
      alt: '애쉬베이지 브라운 텍스쳐컷의 결 움직임을 보여주는 보조 사진',
    },
    observedFeatures: [
      '전체적으로 밝고 차분한 애쉬베이지 브라운 톤',
      '윗머리에 층을 내어 자연스러운 볼륨과 결 움직임을 살린 텍스쳐컷',
      '두상 라인을 따라 정리된 옆선',
    ],
    relevantConcerns: ['style-unsure', 'styling-difficulty'],
    consultationNote:
      '평소 손질 시간을 많이 들이기 어렵거나, 밝은 컬러를 시도해보고 싶지만 튀는 것은 부담스러운 분들이 상담에서 자주 참고하는 예시입니다.',
  },
  {
    slug: 'blonde-cortis-texture-cut',
    number: '02',
    styleName: '블론드 탈색 · 코르티스 텍스쳐컷',
    shortLabel: '블론드 코르티스컷',
    designerId: 'kangyoon',
    heroImage: {
      src: blondeFinal,
      alt: '블론드 탈색과 코르티스 텍스쳐컷을 완성한 남성',
    },
    secondaryImage: {
      src: bleachProcess,
      alt: '블론드 탈색 시술 중 모발에 약제를 도포한 과정',
    },
    observedFeatures: [
      '뿌리부터 끝까지 밝게 정리된 블론드 톤',
      '윗머리 길이를 살린 코르티스 형태의 텍스쳐컷',
      '가벼운 질감으로 정리된 표면',
    ],
    relevantConcerns: ['want-change', 'style-unsure'],
    consultationNote:
      '눈에 띄게 분위기를 바꾸고 싶지만 탈색이 처음이거나 모발 상태가 걱정되는 분들은, 상담에서 이전 시술 이력과 손상도를 먼저 확인합니다.',
  },
  {
    slug: 'vintage-hippie-perm',
    number: '03',
    styleName: '빈티지펌 · 히피펌',
    shortLabel: '빈티지 히피펌',
    designerId: 'kangyoon',
    heroImage: {
      src: vintageHippiePerm,
      alt: '빈티지 히피펌으로 자연스러운 웨이브를 만든 남성',
      objectPosition: 'center 100%',
      zoom: 1.16,
    },
    observedFeatures: [
      '일정한 굵기보다 크고 작은 웨이브가 섞인 자연스러운 컬',
      '이마와 옆머리를 가볍게 덮는 길이감',
      '힘을 주어 세팅하지 않아도 자리를 잡는 형태',
    ],
    relevantConcerns: ['flat-sides', 'want-change'],
    consultationNote:
      '직모라서 옆머리가 자꾸 뜨거나, 매번 드라이로 웨이브를 만들기 번거로운 분들이 상담에서 함께 살펴보는 스타일입니다.',
  },
  {
    slug: 'see-through-leaf-cut',
    number: '04',
    styleName: '시스루 댄디·리프컷 · 커트 & 다운펌',
    shortLabel: '시스루 리프컷',
    designerId: 'kangyoon',
    heroImage: {
      src: seeThroughLeafCut,
      alt: '시스루 리프컷과 다운펌의 옆선 실루엣',
      objectPosition: 'center 32%',
    },
    observedFeatures: [
      '옆에서 봤을 때 드러나는 리프컷 특유의 갸름한 실루엣',
      '이마 위로 가볍게 흘러내리는 시스루 앞머리',
      '다운펌으로 정리되어 뻗침 없이 정돈된 옆선',
    ],
    relevantConcerns: ['flat-sides', 'styling-difficulty'],
    consultationNote:
      '옆머리가 뜨거나 앞머리가 눌리는 것이 고민이라면, 두상과 모류 방향을 함께 확인해 다운펌 적용 범위를 상담합니다.',
  },
];

export function getWorkBySlug(slug: string): Work | undefined {
  return works.find((work) => work.slug === slug);
}

/** Inline style for a WorkImage: object-position plus an optional extra zoom to push a background distraction further out of frame. */
export function workImageStyle(image: WorkImage): string {
  const position = image.objectPosition ?? 'center';
  const transform = image.zoom ? `transform:scale(${image.zoom});` : '';
  return `object-position:${position};${transform}`;
}
