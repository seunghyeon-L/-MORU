/**
 * IBS 식이 관리 앱 — 당사자 설문지 자동 생성 스크립트
 *
 * 사용법
 *   1) https://script.google.com 접속 → "새 프로젝트"
 *   2) 이 파일 내용을 전부 붙여넣기 (기존 코드는 지우기)
 *   3) 상단 실행 버튼 ▶ 클릭 → 권한 승인
 *   4) 실행 로그(Ctrl+Enter)에 나오는 편집/응답 링크 확인
 */

function createSurvey() {
  const form = FormApp.create('식사 후 배가 불편하신 분들께 여쭤봅니다');

  form.setDescription(
    '식사 후 복통·복부팽만·가스·설사·변비를 반복적으로 겪으시는 분들의 경험을 조사합니다.\n' +
    '소요 시간은 약 4~5분입니다.\n\n' +
    '수집 항목: 연령대, 성별, 증상 빈도 및 관련 경험\n' +
    '· 이름, 연락처 등 개인을 식별할 수 있는 정보는 수집하지 않습니다.\n' +
    '· 응답은 서비스 기획 목적으로만 사용되며 제3자에게 제공되지 않습니다.\n' +
    '· 언제든 응답을 중단하실 수 있습니다.\n\n' +
    '※ 본 조사는 의학적 진단이나 치료를 목적으로 하지 않습니다.'
  );

  form.setCollectEmail(false);
  form.setProgressBar(true);
  form.setShowLinkToRespondAgain(false);

  // ────────────────────────────────
  // 섹션 1. 참여 확인
  // ────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('참여 확인')
    .setHelpText('먼저 간단한 확인 문항입니다.');

  form.addMultipleChoiceItem()
    .setTitle('1. 연령대를 선택해주세요.')
    .setChoiceValues(['18~24세', '25~29세', '30~34세', '35~39세', '40세 이상'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('2. 성별을 선택해주세요.')
    .setChoiceValues(['여성', '남성', '응답하지 않음'])
    .setRequired(true);

  // Q3 — 자격 미달 시 자동 종료 (분기)
  const q3 = form.addMultipleChoiceItem()
    .setTitle('3. 최근 3개월간, 식사 후 복통·복부팽만·가스·설사·변비 중 하나 이상을 얼마나 자주 겪으셨나요?')
    .setRequired(true);

  q3.setChoices([
    q3.createChoice('거의 없음', FormApp.PageNavigationType.SUBMIT),
    q3.createChoice('한 달에 1~2회', FormApp.PageNavigationType.CONTINUE),
    q3.createChoice('일주일에 1~2회', FormApp.PageNavigationType.CONTINUE),
    q3.createChoice('일주일에 3회 이상', FormApp.PageNavigationType.CONTINUE),
    q3.createChoice('거의 매일', FormApp.PageNavigationType.CONTINUE)
  ]);

  // ────────────────────────────────
  // 섹션 2. 현재 상황
  // ────────────────────────────────
  form.addPageBreakItem().setTitle('현재 상황');

  form.addMultipleChoiceItem()
    .setTitle('4. 지금 "이건 나한테 안 맞는다"고 생각해서 일부러 피하는 음식이 몇 가지인가요?')
    .setChoiceValues(['없음', '1~2가지', '3~5가지', '6~10가지', '11가지 이상'])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('5. 그 음식들을 피하기로 정한 근거는 무엇인가요? (해당되는 것 모두)')
    .setChoiceValues([
      '먹고 나서 아팠던 경험',
      '인터넷·SNS에서 봐서',
      '병원이나 전문가 조언',
      '주변 사람 이야기',
      '특별한 근거 없이 그냥',
      '해당 없음'
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('6. 배가 아팠을 때 "이것 때문이다"라고 특정 음식을 지목했다가, 나중에 아니었다는 걸 알게 된 적이 있나요?')
    .setChoiceValues(['있다', '없다', '확인해본 적이 없어서 모르겠다'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('7. 같은 음식을 먹었는데 어떤 날은 괜찮고 어떤 날은 아팠던 경험이 있나요?')
    .setChoiceValues(['자주 있다', '가끔 있다', '거의 없다', '모르겠다'])
    .setRequired(true);

  // ────────────────────────────────
  // 섹션 3. 기존 시도
  // ────────────────────────────────
  form.addPageBreakItem().setTitle('지금까지 해보신 것');

  form.addCheckboxItem()
    .setTitle('8. 이 증상 때문에 해보신 것을 모두 골라주세요.')
    .setChoiceValues([
      '인터넷 검색',
      '병원 진료',
      '대장내시경 등 검사',
      '유산균·건강기능식품 섭취',
      '특정 음식 끊기',
      '식사·증상 기록',
      '관련 앱 사용',
      '아무것도 안 함'
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('9. "저포드맵(FODMAP) 식단"을 들어보셨나요?')
    .setChoiceValues(['실제로 해본 적 있다', '들어봤지만 해보지는 않았다', '처음 듣는다'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('10. 식사나 증상을 기록해보신 적이 있다면, 얼마나 지속하셨나요?')
    .setChoiceValues(['기록해본 적 없음', '3일 미만', '1주일 정도', '2~4주', '1개월 이상'])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('11. 기록을 그만두셨다면 그 이유는 무엇인가요? (해당되는 것 모두)')
    .setChoiceValues([
      '입력이 번거로워서',
      '기록해도 뭘 알 수 있는지 모르겠어서',
      '깜빡해서',
      '증상이 좋아져서',
      '아직 계속하고 있음',
      '기록해본 적 없음'
    ])
    .setRequired(true);

  // ────────────────────────────────
  // 섹션 4. 식사 기록 방식
  // ────────────────────────────────
  form.addPageBreakItem().setTitle('식사 기록 방식');

  form.addMultipleChoiceItem()
    .setTitle('12. 평소 음식 사진을 얼마나 찍으시나요?')
    .setChoiceValues(['거의 매 끼니', '외식할 때만', '가끔', '거의 안 찍음'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('13. 밥을 먹기 "직전에" 사진을 찍어야 한다면 어떠실 것 같나요?')
    .setChoiceValues([
      '전혀 부담 없다',
      '혼자 먹을 땐 괜찮지만 여럿이면 부담된다',
      '대체로 부담된다',
      '못 할 것 같다'
    ])
    .setRequired(true);

  // ────────────────────────────────
  // 섹션 5. 핵심 — 챌린지 완주 의향
  // ────────────────────────────────
  form.addPageBreakItem()
    .setTitle('이런 방법이 있습니다')
    .setHelpText(
      '아래 방법을 읽고 답해주세요.\n\n' +
      '3일 동안 마늘을 조금씩 늘려가며 먹습니다.\n' +
      '대신 그 3일 동안은 다른 마늘·양파가 든 음식을 전부 피해야 합니다.\n' +
      '이걸 재료를 바꿔가며 3~4번 반복하면, "나는 마늘을 어디까지 먹어도 되는지"를 알게 됩니다.'
    );

  form.addMultipleChoiceItem()
    .setTitle('14. 위 방법을 몇 번까지 하실 수 있을 것 같나요?')
    .setHelpText('1번 = 3일 시도 + 쉬는 기간')
    .setChoiceValues(['한 번도 못 할 것 같다', '1번', '2번', '3번', '4번 이상'])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('15. 가장 부담되는 부분은 무엇인가요? (최대 2개)')
    .setChoiceValues([
      '3일 연속 지켜야 하는 것',
      '그동안 다른 음식을 못 먹는 것',
      '외식·약속 자리에서 지키기 어려움',
      '매번 기록해야 하는 것',
      '여러 번 반복해야 하는 것',
      '일부러 증상을 유발할 수도 있다는 점',
      '별로 부담되지 않음'
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('16. 최근 1년간, 3일 이상 연속으로 무언가를 지켜본 경험이 있나요?')
    .setHelpText('식단 관리, 운동, 복약, 습관 챌린지 등')
    .setChoiceValues([
      '있고, 끝까지 완주했다',
      '있었지만 중간에 그만뒀다',
      '시도해본 적 없다'
    ])
    .setRequired(true);

  // ────────────────────────────────
  // 섹션 6. 비용
  // ────────────────────────────────
  form.addPageBreakItem().setTitle('비용');

  form.addMultipleChoiceItem()
    .setTitle('17. 이 증상 때문에 최근 1년간 쓰신 비용은 대략 얼마인가요?')
    .setHelpText('병원·검사·유산균·건강기능식품 등 포함')
    .setChoiceValues(['0원', '5만 원 미만', '5~20만 원', '20~50만 원', '50만 원 이상'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('18. 아팠던 원인을 찾아주고 먹을 수 있는 양을 알려주는 앱이 있다면, 월 얼마까지 낼 수 있나요?')
    .setChoiceValues([
      '무료만 쓰겠다',
      '3,000원 이하',
      '5,000원대',
      '10,000원대',
      '20,000원 이상'
    ])
    .setRequired(true);

  // ────────────────────────────────
  // 섹션 7. 자유 응답
  // ────────────────────────────────
  form.addPageBreakItem().setTitle('마지막으로');

  form.addParagraphTextItem()
    .setTitle('19. 배가 아플 때 가장 답답한 점이 무엇인가요? 편하게 적어주세요.')
    .setRequired(false);

  form.setConfirmationMessage('응답해주셔서 감사합니다. 큰 도움이 됩니다.');

  // ────────────────────────────────
  Logger.log('■ 편집 링크: ' + form.getEditUrl());
  Logger.log('■ 응답 링크: ' + form.getPublishedUrl());
  Logger.log('■ 짧은 링크: ' + form.shortenFormUrl(form.getPublishedUrl()));
}
