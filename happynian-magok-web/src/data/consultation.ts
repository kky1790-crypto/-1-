export interface Concern {
  id: string;
  text: string;
}

/** The four customer concerns shown on the homepage CONSULTATION section. */
export const concerns: Concern[] = [
  { id: 'style-unsure', text: '어울리는 머리를 모르겠어요.' },
  { id: 'styling-difficulty', text: '손질을 잘 못해요.' },
  { id: 'flat-sides', text: '직모와 뜨는 옆머리가 불편해요.' },
  { id: 'want-change', text: '평범하지 않게 바꾸고 싶어요.' },
];

/** Facts the consultation is built on — used to explain the process, not to sell a fixed style. */
export const consultationFactors: string[] = [
  '얼굴형',
  '두상',
  '모질',
  '직업과 평소 분위기',
  '평소 손질 습관',
  '현재 모발 상태와 이전 시술 이력',
];

export const consultationIntro =
  '정해진 스타일을 권하기보다, 위 항목들을 함께 살펴보며 하고 싶은 스타일과 실제로 가능한 스타일을 비교해 고객에게 맞는 선택을 찾아갑니다.';
