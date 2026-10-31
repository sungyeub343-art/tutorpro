import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const siteUrl = "https://tutorpro.kr";
const phone = "010-2928-3614";
const phoneHref = "tel:+821029283614";

const regions = [
  { slug: "jochivon", name: "조치원읍", group: "북부권", nearby: "신흥리·죽림리·침산리", focus: "학교 진도와 시험 일정에 맞춘 내신 관리" },
  { slug: "yeongi", name: "연기면", group: "면 지역", nearby: "보통리·눌왕리·수산리", focus: "개념의 빈틈부터 채우는 단계별 학습" },
  { slug: "yeondong", name: "연동면", group: "면 지역", nearby: "내판리·명학리·예양리", focus: "기초 연산과 문제 해석을 연결하는 수업" },
  { slug: "bugang", name: "부강면", group: "면 지역", nearby: "부강리·문곡리·갈산리", focus: "학습 습관과 취약 단원을 함께 관리하는 수업" },
  { slug: "geumnam", name: "금남면", group: "남부권", nearby: "용포리·대평리·호탄리", focus: "중등 내신부터 고등 과정까지 이어지는 학습 설계" },
  { slug: "janggun", name: "장군면", group: "서부권", nearby: "도계리·봉안리·대교리", focus: "학생 일정과 이동 여건을 고려한 맞춤 진도" },
  { slug: "yeonseo", name: "연서면", group: "북서권", nearby: "봉암리·월하리·쌍류리", focus: "반복 학습으로 개념과 풀이 습관을 다지는 수업" },
  { slug: "jeonui", name: "전의면", group: "북부권", nearby: "읍내리·동교리·유천리", focus: "학년 전환기 복습과 선행의 균형" },
  { slug: "jeondong", name: "전동면", group: "북부권", nearby: "노장리·청람리·송곡리", focus: "현재 실력에서 시작하는 현실적인 학습 계획" },
  { slug: "sojeong", name: "소정면", group: "북부권", nearby: "소정리·대곡리·고등리", focus: "학습 공백을 줄이는 밀착형 개념 수업" },
  { slug: "hansol", name: "한솔동", group: "1생활권", nearby: "첫마을·나리로·노을로", focus: "학교별 시험 범위에 맞춘 꼼꼼한 내신 대비" },
  { slug: "saerom", name: "새롬동", group: "2생활권", nearby: "새롬중앙로·다정남로 인근", focus: "개념 설명과 서술형 풀이를 연결하는 수업" },
  { slug: "naseong", name: "나성동", group: "2생활권", nearby: "나성북로·나성남로 인근", focus: "학생의 목표와 생활 리듬을 반영한 학습 관리" },
  { slug: "dodam", name: "도담동", group: "1생활권", nearby: "도램마을·보듬로·다솜로", focus: "오답 원인을 찾고 같은 실수를 줄이는 수업" },
  { slug: "eojin", name: "어진동", group: "1생활권", nearby: "도움로·절재로·가름로", focus: "기초 개념부터 응용까지 연결하는 일대일 수업" },
  { slug: "areum", name: "아름동", group: "1생활권", nearby: "범지기마을·보듬로 인근", focus: "중등 과정의 탄탄한 이해와 고등 선행 준비" },
  { slug: "jongchon", name: "종촌동", group: "1생활권", nearby: "가재마을·도움로·달빛로", focus: "시험 결과를 다음 학습 계획으로 연결하는 관리" },
  { slug: "goun", name: "고운동", group: "1생활권", nearby: "가락마을·마음로·고운서길", focus: "학생별 진도 차이를 줄이는 맞춤 커리큘럼" },
  { slug: "sodam", name: "소담동", group: "3생활권", nearby: "새샘마을·한누리대로 인근", focus: "내신과 선행을 균형 있게 이어가는 학습" },
  { slug: "bangok", name: "반곡동", group: "4생활권", nearby: "수루배마을·한누리대로 인근", focus: "문제의 조건을 읽고 풀이를 설명하는 훈련" },
  { slug: "boram", name: "보람동", group: "3생활권", nearby: "호려울마을·남세종로 인근", focus: "학교 일정과 목표 성적을 반영한 내신 관리" },
  { slug: "daepyeong", name: "대평동", group: "3생활권", nearby: "해들마을·대평로·갈매로", focus: "취약 단원 진단부터 시작하는 맞춤 수업" },
  { slug: "dajeong", name: "다정동", group: "2생활권", nearby: "가온마을·다정중앙로 인근", focus: "학습 루틴을 만들고 성취를 쌓는 꾸준한 관리" },
  { slug: "haemil", name: "해밀동", group: "6생활권", nearby: "해밀마을·한누리대로 인근", focus: "학교 진도와 개인 선행을 조율하는 수업" },
  { slug: "sanul", name: "산울동", group: "6생활권", nearby: "산울마을·세종로 인근", focus: "새로운 학습 환경에 맞춘 안정적인 진도 관리" },
  { slug: "jiphyeon", name: "집현동", group: "4생활권", nearby: "새나루마을·집현중앙로 인근", focus: "개념을 스스로 설명하는 힘을 기르는 수업" }
];

const schoolData = JSON.parse(await readFile(path.join(root, "src", "data", "sejong-schools.json"), "utf8"));
const schoolTypes = { elementary: "초등학교", middle: "중학교", high: "고등학교" };
const schoolNotes = { elementary: "교과 진도·단원평가 맞춤 수학수업", middle: "시험 범위·서술형 맞춤 수학내신", high: "학교 기출·부교재 맞춤 내신·수능대비" };
const schoolSource = `학교 정보: ${schoolData.source}, ${schoolData.baseDate} 기준`;
const schoolsIn = (region, type) => schoolData.schools.filter(school => school.area === region.name && (!type || school.level === type));
const schoolsOf = type => schoolData.schools.filter(school => school.level === type);
function nearestSchools(region, type, count = 3) {
  const own = schoolsIn(region);
  const lat = own.reduce((sum, school) => sum + school.lat, 0) / own.length;
  const lng = own.reduce((sum, school) => sum + school.lng, 0) / own.length;
  return schoolsOf(type).filter(school => school.area !== region.name).map(school => ({ ...school, distance: Math.hypot(school.lat - lat, (school.lng - lng) * Math.cos(lat * Math.PI / 180)) })).sort((a, b) => a.distance - b.distance).slice(0, count);
}
function localSchools(region, type) {
  const own = schoolsIn(region, type);
  return own.length ? { schools: own, nearby: false } : { schools: nearestSchools(region, type), nearby: true };
}
const schoolItem = (school, note, nearby) => `<li><strong>${schoolLink(school)}</strong><span>${nearby ? `${school.area} · ` : ""}${school.founded.slice(0, 4)}년 개교 · ${note}</span></li>`;
const distanceKm = (a, b) => Math.hypot(a.lat - b.lat, (a.lng - b.lng) * Math.cos(a.lat * Math.PI / 180)) * 111;
const kmText = value => value < 1 ? `약 ${Math.round(value * 1000 / 100) * 100}m` : `약 ${value.toFixed(1)}km`;
function regionCenter(region) {
  const own = schoolsIn(region);
  return { lat: own.reduce((sum, school) => sum + school.lat, 0) / own.length, lng: own.reduce((sum, school) => sum + school.lng, 0) / own.length };
}
const closestRegions = (region, count) => regions.filter(item => item !== region).map(item => ({ region: item, distance: distanceKm(regionCenter(region), regionCenter(item)) })).sort((a, b) => a.distance - b.distance).slice(0, count);
const closestSchools = (origin, type, count, exclude) => schoolsOf(type).filter(school => school.name !== exclude).map(school => ({ ...school, distance: distanceKm(origin, school) })).sort((a, b) => a.distance - b.distance).slice(0, count);
function regionFacts(region) {
  const own = [...schoolsIn(region)].sort((a, b) => a.founded.localeCompare(b.founded));
  const counts = Object.values(schoolTypes).map(type => [type, schoolsIn(region, type).length]).filter(([, count]) => count).map(([type, count]) => `${type} ${count}곳`).join(", ");
  const history = own.length > 1 ? ` 가장 오래된 학교는 ${own[0].founded.slice(0, 4)}년에 문을 연 ${own[0].name}이고, 가장 최근에 개교한 학교는 ${own.at(-1).founded.slice(0, 4)}년 ${own.at(-1).name}입니다.` : ` ${own[0].name}는 ${own[0].founded.slice(0, 4)}년에 문을 열었습니다.`;
  const near = closestRegions(region, 3).map(item => `${item.region.name}(${kmText(item.distance)})`).join(", ");
  return `${region.name}에는 ${counts}이 있습니다.${history} 학교 위치 기준으로 가까운 지역은 ${near}입니다.`;
}

const grades = [
  ["예비중1", "초등 연산과 문장제의 빈틈을 확인하고 문자와 식, 기본 도형으로 이어지는 중학 수학의 첫 틀을 만듭니다."],
  ["예비중2", "일차방정식과 좌표, 기본 도형을 복습한 뒤 식의 계산과 연립방정식을 안정적으로 연결합니다."],
  ["예비중3", "고등 수학의 바탕이 되는 함수·방정식·도형을 정리하고 다음 학년의 내신 난도에 대비합니다."],
  ["예비고1", "중학 전 범위의 취약점을 진단하고 공통수학의 다항식, 방정식, 경우의 수를 체계적으로 시작합니다."],
  ["예비고2", "공통수학의 빈틈을 보완하고 학교 선택 과목과 진로에 맞춰 대수·미적분 학습 순서를 설계합니다."],
  ["예비고3", "수능 출제 단원별 개념과 기출을 연결하고 제한 시간 안에 점수를 만드는 실전 루틴을 다집니다."]
];

const levels = [
  {
    slug: "elementary",
    label: "초등",
    learner: "초등학생",
    en: "ELEMENTARY MATH",
    range: "초1~초6",
    titleTail: "기초수학·수학공부 1:1 맞춤 수업",
    descKeywords: "초등 수학수업·수학공부·기초수학",
    summary: "연산 정확도, 분수 개념, 문장제 해석을 다지는 초등 수학",
    grades: [
      ["초1", "수 세기와 가르기·모으기, 한 자리 덧셈·뺄셈으로 수 감각과 연산의 기초를 만듭니다."],
      ["초2", "받아올림·받아내림과 곱셈구구를 정확히 익히고 길이 재기, 시각 읽기로 생활 속 수학을 연결합니다."],
      ["초3", "나눗셈과 분수·소수의 첫 개념을 그림과 식으로 이해하고 문장제를 식으로 바꾸는 연습을 시작합니다."],
      ["초4", "큰 수, 분수의 덧셈·뺄셈, 각도와 삼각형을 다루며 계산 속도보다 정확한 이해를 먼저 다집니다."],
      ["초5", "약수와 배수, 약분·통분, 분수의 곱셈처럼 중학 수학으로 이어지는 핵심 연산을 집중 관리합니다."],
      ["초6", "분수·소수의 나눗셈, 비와 비율, 원의 넓이를 정리하고 예비중1 과정으로 자연스럽게 넘어갑니다."]
    ],
    topics: [
      ["수학수업", "교과서 진도를 그대로 따라가기보다 학생이 개념을 말로 설명할 수 있는지 확인하며 수업합니다. 그림, 수 모형, 짧은 문장제를 함께 사용해 이해가 눈에 보이도록 돕습니다."],
      ["수학공부", "하루 20~30분이라도 혼자 공부할 수 있는 분량과 순서를 정합니다. 문제집을 많이 푸는 것보다 틀린 문제를 다시 풀고 이유를 적는 습관을 먼저 만듭니다."],
      ["기초수학", "연산 실수, 분수 개념, 문장제 해석처럼 학년이 올라가며 커지는 빈틈을 진단해 이전 학년 내용부터 다시 채웁니다."]
    ],
    paragraphs: [
      "초등 수학은 다음 학년의 기초가 됩니다. 연산 정확도, 분수 개념, 문장제 해석을 학년별로 점검해 중학 수학까지 무리 없이 이어지도록 준비합니다.",
      "문제를 빨리 푸는 것보다 왜 그렇게 푸는지 설명하는 힘을 기릅니다. 수업마다 짧은 확인 문제를 두어 이해한 내용이 실제로 남았는지 점검합니다.",
      "학교 단원평가 일정에 맞춰 복습 시점을 정하고, 아이가 혼자 풀 수 있는 문제 수준을 조금씩 높여 갑니다."
    ],
    faqs: place => [
      [`${place} 초등 수학과외는 몇 학년부터 가능한가요?`, "초등 1학년부터 6학년까지 가능합니다. 학년보다 현재 이해 수준을 먼저 확인해 수업 난이도와 진도를 정합니다."],
      ["기초수학이 많이 부족해도 수업할 수 있나요?", "가능합니다. 이전 학년 연산과 개념부터 진단해 빈틈을 채운 뒤 현재 학년 진도로 연결합니다."],
      ["초등 수학공부는 집에서 어떻게 해야 하나요?", "수업마다 학생이 혼자 해낼 수 있는 분량의 과제를 정하고, 틀린 문제를 다시 풀며 이유를 적는 습관을 만들도록 안내합니다."],
      [`${place} 초등 수학수업 시간과 장소는 어떻게 정하나요?`, "세부 위치와 희망 요일·시간을 확인한 뒤 전화 상담에서 가능한 일정과 수업 방식을 안내합니다."]
    ]
  },
  {
    slug: "middle",
    label: "중등",
    learner: "중학생",
    en: "MIDDLE SCHOOL MATH",
    range: "중1~중3",
    titleTail: "수학내신·기초수학 1:1 맞춤 수업",
    descKeywords: "중등 수학수업·수학공부·기초수학·수학내신",
    summary: "학교 내신과 서술형, 고등 선행까지 연결하는 중등 수학",
    grades: [
      ["중1", "소인수분해, 정수와 유리수, 문자와 식, 일차방정식, 좌표평면과 그래프로 중학 수학의 기본 언어를 익힙니다."],
      ["중2", "유리수와 순환소수, 식의 계산, 연립방정식, 일차함수, 도형의 성질과 확률을 서술형 풀이까지 연결합니다."],
      ["중3", "제곱근과 실수, 인수분해, 이차방정식과 이차함수, 삼각비와 원의 성질을 정리하며 고등 수학을 준비합니다."]
    ],
    topics: [
      ["수학수업", "개념 설명, 대표 유형, 변형 문제 순서로 수업하고 학생이 풀이 과정을 직접 설명하게 해 이해 정도를 확인합니다."],
      ["수학공부", "수업과 수업 사이의 자습 계획을 함께 세웁니다. 교재 분량, 오답 정리 방법, 복습 주기를 학생 일정에 맞춰 정합니다."],
      ["기초수학", "방정식과 함수가 어렵다면 이전 학년 개념이 비어 있는 경우가 많습니다. 꼭 필요한 단원만 골라 짧게 보완하고 현재 진도와 병행합니다."],
      ["수학내신", "학교별 시험 범위, 교과서, 기출 경향을 확인해 시험 4주 전부터 개념 정리, 유형 연습, 서술형 대비, 실전 점검 순서로 준비합니다."]
    ],
    paragraphs: [
      "중등 수학은 학교 내신이 처음으로 성적표에 남는 시기입니다. 개념 이해와 서술형 풀이, 시험 범위별 유형 연습을 균형 있게 관리합니다.",
      "중학교에서 흔들린 함수와 방정식은 고등 수학에서 더 큰 공백이 됩니다. 현재 학년 진도와 이전 학년 복습을 함께 설계합니다.",
      "시험 기간과 방학을 구분해 선행과 내신 대비의 비중을 조정하고, 학생이 혼자 공부하는 시간까지 계획에 포함합니다."
    ],
    faqs: place => [
      [`${place} 중등 수학내신은 어떻게 대비하나요?`, "학교별 시험 범위와 교과서, 기출 경향을 확인해 시험 4주 전부터 개념 정리, 유형 연습, 서술형 대비, 실전 점검 순서로 준비합니다."],
      ["중학 수학 기초가 부족하면 선행보다 복습이 먼저인가요?", "대부분 그렇습니다. 진단 후 꼭 필요한 이전 단원만 골라 짧게 보완하고 현재 학년 진도와 병행합니다."],
      ["예비고1 선행도 가능한가요?", "중3 과정을 마무리하며 공통수학1·2를 단계적으로 시작합니다. 선행 속도는 학생의 이해도에 맞춰 조정합니다."],
      [`${place} 중등 수학과외 수업료는 어떻게 되나요?`, "학년과 주당 수업 횟수, 수업 시간에 따라 달라지며 전화 상담 시 자세히 안내합니다."]
    ]
  },
  {
    slug: "high",
    label: "고등",
    learner: "고등학생",
    en: "HIGH SCHOOL MATH",
    range: "고1~고3",
    titleTail: "수학내신·수능수학 1:1 맞춤 수업",
    descKeywords: "고등 수학내신·수능대비·수능수학·기초수학",
    summary: "내신 등급과 수능 수학을 함께 준비하는 고등 수학",
    grades: [
      ["고1", "공통수학1·2의 다항식, 방정식과 부등식, 경우의 수, 행렬, 도형의 방정식, 집합과 명제, 함수를 내신 중심으로 다집니다."],
      ["고2", "대수, 미적분Ⅰ, 확률과 통계 등 학교 선택 과목에 맞춰 내신과 모의고사를 함께 대비합니다."],
      ["고3", "수능 출제 범위의 개념과 기출을 연결하고, 시간 배분과 실수 관리까지 포함한 실전 모의고사 루틴을 만듭니다."]
    ],
    topics: [
      ["수학수업", "개념의 정의와 성질을 먼저 정리하고 교과서 예제, 학교 기출, 모의고사 문항으로 난도를 높여 가며 수업합니다."],
      ["수학공부", "내신 기간과 비내신 기간의 공부 비중을 나누고, 주간 단위로 문제 풀이량과 오답 복습 일정을 관리합니다."],
      ["기초수학", "고등 수학이 어려운 이유가 중학 개념의 빈틈인 경우가 많습니다. 인수분해, 함수, 방정식처럼 필요한 단원만 골라 빠르게 보완합니다."],
      ["수학내신", "학교별 기출과 부교재, 수행평가 일정을 확인해 서술형과 고난도 문항까지 대비하는 시험 계획을 세웁니다."],
      ["수능대비", "모의고사 성적표로 취약 단원과 시간 손실 구간을 찾고 기출 분석, 유형 정리, 실전 모의고사 순서로 준비합니다."],
      ["수능수학", "고난도 문항에만 매달리기보다 공통 과목의 정확도를 먼저 높이고, 문항별 풀이 시간을 관리해 등급을 안정시킵니다."]
    ],
    paragraphs: [
      "고등 수학은 내신 등급과 수능을 함께 준비해야 합니다. 학교별 시험 경향과 모의고사 결과를 함께 보고 시기별 학습 비중을 조정합니다.",
      "개념을 알아도 시험에서 점수가 나오지 않는다면 풀이 순서와 시간 관리의 문제일 수 있습니다. 실전 형식의 연습으로 점수로 이어지는 공부를 합니다.",
      "고1 공통수학부터 고3 수능 수학까지 학년별 과제가 다릅니다. 진로와 선택 과목을 고려해 지금 집중해야 할 범위를 정합니다."
    ],
    faqs: place => [
      [`${place} 고등 수학내신과 수능대비를 함께 할 수 있나요?`, "시험 기간에는 내신 비중을, 시험이 끝난 뒤에는 모의고사와 수능 수학 비중을 높이는 방식으로 함께 관리합니다."],
      ["고등학생인데 기초수학부터 다시 해도 될까요?", "고등 수학에 필요한 중학 개념만 골라 빠르게 보완합니다. 기초를 다지면서 현재 학교 진도도 함께 따라갑니다."],
      ["수능 수학 등급을 올리려면 무엇부터 해야 하나요?", "최근 모의고사에서 틀린 문항을 개념 부족, 풀이 시간, 계산 실수로 나누어 원인부터 확인하고 그에 맞춰 기출과 실전 연습의 비중을 정합니다."],
      [`${place} 고등 수학과외 수업료는 어떻게 되나요?`, "학년과 주당 수업 횟수, 수업 시간에 따라 달라지며 전화 상담 시 자세히 안내합니다."]
    ]
  }
];

const pick = (items, index) => items[index % items.length];
const pageUrl = (...parts) => `${siteUrl}/${parts.filter(Boolean).join("/")}${parts.length ? "/" : ""}`;
const regionPath = (region, level) => `/areas/${region.slug}/${level ? `${level.slug}/` : ""}`;

const gradeCards = grades.map(([name, text]) => `<article class="grade-card"><span>PREP COURSE</span><h3>${name} 수학과외</h3><p>${text}</p></article>`).join("");
const regionLinks = regions.map(region => `<a class="region-link" href="/areas/${region.slug}/"><small>${region.group}</small><strong>${region.name} 수학과외</strong><span aria-hidden="true">↗</span></a>`).join("");
const regionSelectLinks = regions.map((region, index) => `<a class="region-select-link" href="/areas/${region.slug}/"><span>${String(index + 1).padStart(2, "0")}</span><strong>${region.name}</strong><i aria-hidden="true">↗</i></a>`).join("");

function levelCards(place, region) {
  return levels.map((level, index) => `<a class="level-card" href="${region ? regionPath(region, level) : `/${level.slug}/`}"><span>0${index + 1} · ${level.en}</span><h3>${place} ${level.label} 수학과외</h3><p>${level.summary}. ${level.topics.map(([topic]) => `${level.label} ${topic}`).join(" · ")}</p><b>${level.range} 수업 안내 <i aria-hidden="true">→</i></b></a>`).join("");
}

function faqSection(faqs, heading) {
  return `<section class="faq-section" id="faq"><div class="wrap"><div class="section-heading"><div><p class="kicker">FAQ</p><h2>${heading}</h2></div><p>상담 전에 많이 물어보시는 내용을 정리했습니다. 더 궁금한 점은 전화로 편하게 문의해 주세요.</p></div><div class="faq-list">${faqs.map(([question, answer], index) => `<details${index === 0 ? " open" : ""}><summary>${question}</summary><p>${answer}</p></details>`).join("")}</div></div></section>`;
}

function faqSchema(faqs) {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
}

function breadcrumbSchema(items) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(([name, item], index) => ({ "@type": "ListItem", position: index + 1, name, item })) };
}

function ctaSection(heading) {
  return `<section class="local-cta"><div class="wrap"><div><p class="kicker">CONSULTATION</p><h2>${heading}</h2></div><a class="button button-primary" href="${phoneHref}" aria-label="${phone}로 전화 상담">${phone} <span>→</span></a></div></section>`;
}

function layout({ title, description, canonical, body, schema = [], robots = "index, follow, max-image-preview:large", image = `${siteUrl}/og.png`, fullOrganization = false }) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "세종 수학과외",
    url: siteUrl,
    logo: `${siteUrl}/icon-512.png`,
    telephone: phone,
    image,
    areaServed: fullOrganization ? [{ "@type": "City", name: "세종특별자치시" }, ...regions.map(region => ({ "@type": "Place", name: `세종 ${region.name}` }))] : { "@type": "City", name: "세종특별자치시" },
    knowsAbout: ["초등 수학", "중등 수학", "고등 수학", "수학내신", "수능수학", "기초수학"],
    description
  };
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="${robots}">
  <meta name="naver-site-verification" content="6ded063826d77fdf063c2c08043715e4de8bbc7f">
  <meta name="google-site-verification" content="AMVRxffaVWjg7V-Ulls6OyuWKA7SUR1baVA6bwdj1f4">
  <meta name="theme-color" content="#12304a">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" type="application/rss+xml" title="세종 수학과외" href="${siteUrl}/rss.xml">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="세종 수학과외">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=Song+Myung&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/style.css">
  ${[organization, ...schema].map(data => `<script type="application/ld+json">${JSON.stringify(data)}</script>`).join("\n  ")}
</head>
<body>
  <a class="skip-link" href="#main">본문으로 바로가기</a>
  <header class="site-header"><div class="wrap nav-inner"><a class="brand" href="/"><span aria-hidden="true">S</span>세종 수학과외</a><nav aria-label="주요 메뉴"><a href="/process/">수업 방식</a>${levels.map(level => `<a href="/${level.slug}/">${level.label} 수학</a>`).join("")}<a href="/guide/">학습 가이드</a><a href="/#areas">지역 찾기</a></nav><a class="nav-cta" href="${phoneHref}" aria-label="${phone}로 전화 상담">${phone}</a></div></header>
  ${body}
  <footer><div class="wrap footer-inner"><a class="brand footer-brand" href="/"><span aria-hidden="true">S</span>세종 수학과외</a><p>학생의 이해에서 시작하는 1:1 맞춤 수업 · <a href="/grades/">학년별 수학과외</a> · <a href="/schools/">학교별 수학과외</a> · <a href="/guide/">학습 가이드</a> · <a href="${phoneHref}">${phone}</a></p><p>© 2026 세종 수학과외</p></div></footer>
</body>
</html>`;
}

const homeFaqs = [
  ["세종 수학과외는 어느 지역까지 가능한가요?", "조치원읍과 9개 면, 한솔동부터 집현동까지 세종특별자치시 26개 읍·면·동 전 지역 상담이 가능합니다. 세부 위치에 따라 수업 방식을 안내합니다."],
  ["초등·중등·고등 수업은 어떻게 다른가요?", "초등은 연산과 기초수학, 중등은 수학내신과 서술형, 고등은 내신 등급과 수능수학에 초점을 맞춥니다. 학년보다 현재 실력을 먼저 진단해 출발점을 정합니다."],
  ["학원과 1:1 수학과외는 무엇이 다른가요?", "1:1 수학과외는 학생 한 명의 진도와 이해 속도에 맞춰 수업합니다. 막힌 단원에서 충분히 머물고, 이미 아는 내용은 빠르게 넘어갈 수 있습니다."],
  ["수업료와 수업 횟수는 어떻게 정하나요?", "학년, 주당 수업 횟수, 수업 시간에 따라 달라지며 전화 상담에서 학생 상황을 확인한 뒤 자세히 안내합니다."]
];

function homePage() {
  const title = "세종 수학과외 | 초등·중등·고등 1:1 수학수업, 내신·수능 대비";
  const description = `세종특별자치시 26개 읍·면·동 초중고 1:1 수학과외. 초등 기초수학, 중등 수학내신, 고등 수능수학까지 학년별 맞춤 수업. 전화 상담 ${phone}`;
  const body = `<div class="region-selector" id="region-selector" hidden><div class="region-selector-backdrop" data-region-close></div><section class="region-selector-panel" role="dialog" aria-modal="true" aria-labelledby="region-selector-title"><button class="region-selector-close" type="button" aria-label="지역 선택창 닫기" data-region-close>×</button><p class="region-selector-kicker">REGION SELECT</p><h2 id="region-selector-title">어느 지역의<br>수학과외를 찾으시나요?</h2><p class="region-selector-copy">지역을 선택하면 해당 지역 수업 안내로 바로 이동합니다.</p><div class="region-selector-grid">${regionSelectLinks}</div></section></div>
  <main id="main">
    <section class="hero"><img src="/images/hero.webp" width="1800" height="1200" fetchpriority="high" alt="세종 수학과외 수업 공간의 수학 도형과 공식"><div class="hero-overlay"></div><div class="wrap hero-content"><p class="eyebrow">SEJONG · PRIVATE MATH COACHING</p><h1>세종<br>수학과외</h1><p class="hero-copy">답보다 먼저, 막힌 이유를 찾습니다.<br>초등 기초수학부터 고등 수능수학까지, 학생의 이해 속도에 맞춘 1:1 수업.</p><div class="hero-actions"><a class="button button-primary" href="#areas">우리 지역 수업 찾기 <span>→</span></a><a class="button button-phone" href="${phoneHref}" aria-label="${phone}로 전화 상담">${phone}</a></div></div><div class="hero-facts"><span>초등 · 중등 · 고등</span><span>내신 · 선행 · 수능</span><span>세종 전 지역 상담</span></div></section>
    <section class="method" id="method"><div class="wrap"><div class="section-heading"><div><p class="kicker">01 · HOW WE TEACH</p><h2>풀이가 아니라<br>생각의 순서를 봅니다</h2></div><p>같은 문제를 틀려도 이유는 다릅니다. 개념이 비어 있는지, 문제의 조건을 놓쳤는지, 계산 습관이 흔들리는지 먼저 구분한 뒤 수업의 출발점을 정합니다.</p></div><div class="method-grid"><article><b>01</b><h3>현재 학습 진단</h3><p>최근 시험지와 교재를 통해 정확한 취약 지점을 확인합니다.</p></article><article><b>02</b><h3>개인 진도 설계</h3><p>학교 일정, 목표 성적, 가능한 학습 시간을 함께 반영합니다.</p></article><article><b>03</b><h3>이해 중심 수업</h3><p>학생이 풀이의 이유를 자신의 말로 설명할 때까지 확인합니다.</p></article><article><b>04</b><h3>오답과 습관 관리</h3><p>반복되는 실수는 기록하고 다음 수업 계획에 바로 반영합니다.</p></article></div></div></section>
    <section class="level-section" id="levels"><div class="wrap"><div class="section-heading"><div><p class="kicker">02 · BY SCHOOL LEVEL</p><h2>초등·중등·고등<br>단계별 수학수업</h2></div><p>초등 수학공부 습관, 중등 수학내신, 고등 수능대비까지 학교급마다 필요한 수업이 다릅니다. 학생의 단계에 맞는 세종 수학과외를 확인하세요.</p></div><div class="level-grid">${levelCards("세종")}</div></div></section>
    <section class="grade-section" id="grades"><div class="wrap"><div class="section-heading light"><div><p class="kicker">03 · GRADE TRANSITION</p><h2>학년이 바뀌면<br>준비도 달라야 합니다</h2></div><p>빠른 선행보다 중요한 것은 다음 과정에 필요한 이전 개념을 정확히 연결하는 일입니다.</p></div><div class="grade-grid">${gradeCards}</div></div></section>
    <section class="study-scene"><img src="/images/study.webp" width="1400" height="933" alt="노트에 수학 공부 내용을 정리하는 학생" loading="lazy"><div><p class="kicker">STUDY WITH DIRECTION</p><h2>혼자 공부할 때도<br>흔들리지 않도록</h2><p>과외 시간에만 풀 수 있는 문제는 오래 남지 않습니다. 문제를 읽고, 조건을 표시하고, 풀이를 검토하는 루틴을 반복해 스스로 공부하는 기준을 만듭니다.</p><ul><li>학교별 시험 범위와 일정 반영</li><li>매 수업 오답 원인 기록</li><li>개인별 과제량과 복습 주기 조정</li></ul></div></section>
    <section class="areas" id="areas"><div class="wrap"><div class="section-heading"><div><p class="kicker">04 · LOCAL CLASS</p><h2>세종 우리 동네<br>수학과외 찾기</h2></div><p>세종은 자치구가 없는 단층제 도시입니다. 세종 초등학교 ${schoolsOf("초등학교").length}곳, 중학교 ${schoolsOf("중학교").length}곳, 고등학교 ${schoolsOf("고등학교").length}곳 학생을 위한 지역별 수학과외 안내를 확인하세요.</p></div><div class="region-grid">${regionLinks}</div></div></section>
    <section class="level-section guide-section" id="guide"><div class="wrap"><div class="section-heading"><div><p class="kicker">05 · STUDY GUIDE</p><h2>세종 학부모님이<br>자주 찾는 수학 정보</h2></div><p>수학학원과 과외 선택 기준, 예비중1·예비고1 방학 로드맵, 중·고등 수학 내신과 영재교육원 준비까지 정리했습니다.</p></div><div class="level-grid">${guideCards(guides)}</div></div></section>
    ${faqSection(homeFaqs, "세종 수학과외<br>자주 묻는 질문")}
    <section class="consult" id="consult"><div class="wrap consult-inner"><div><p class="kicker">06 · CONSULTATION</p><h2>현재 고민부터<br>차근히 확인합니다</h2></div><div><p>학생 학년, 거주 지역, 최근 성적과 목표를 기준으로 필요한 수업 방향을 안내합니다. 전화로 편하게 상담을 신청해 주세요.</p><a class="button button-dark" href="${phoneHref}" aria-label="${phone}로 전화 상담">${phone} <span>→</span></a></div></div></section>
  </main>
  <script>
    const selector = document.querySelector("#region-selector");
    const closeButtons = selector.querySelectorAll("[data-region-close]");
    const closeSelector = () => {
      selector.hidden = true;
      document.body.classList.remove("region-selector-open");
    };
    let seen = false;
    try {
      seen = sessionStorage.getItem("regionSelectorSeen") === "1";
      sessionStorage.setItem("regionSelectorSeen", "1");
    } catch {}
    if (!seen) {
      selector.hidden = false;
      document.body.classList.add("region-selector-open");
      closeButtons.forEach(button => button.addEventListener("click", closeSelector));
      document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !selector.hidden) closeSelector();
      });
      selector.querySelector(".region-selector-close").focus();
    }
  </script>`;
  return layout({ title, description, canonical: `${siteUrl}/`, body, schema: [faqSchema(homeFaqs)], fullOrganization: true });
}

function regionSchoolSection(region) {
  const columns = levels.map(level => {
    const { schools, nearby } = localSchools(region, schoolTypes[level.slug]);
    return `<div class="school-column"><h3>${region.name} ${nearby ? "인근 " : ""}${schoolTypes[level.slug]}</h3><ul class="school-list">${schools.map(school => schoolItem(school, schoolNotes[level.slug], nearby)).join("")}</ul><a href="${regionPath(region, level)}">${region.name} ${level.label} 수학과외 →</a></div>`;
  }).join("");
  const own = schoolsIn(region).map(school => school.name);
  return `<section class="school-section"><div class="wrap"><div class="section-heading"><div><p class="kicker">LOCAL SCHOOLS</p><h2>${region.name} 학교별<br>수학 내신 대비</h2></div><p>${regionFacts(region)} ${own.join(", ")} 학생의 교과서, 시험 범위, 학교 진도에 맞춰 수업합니다.</p></div><div class="school-grid">${columns}</div><p class="school-source">${schoolSource}</p></div></section>`;
}

function regionPage(region, index) {
  const title = `세종 ${region.name} 수학과외 | 초등·중등·고등 1:1 수학수업`;
  const description = `세종 ${region.name} 수학과외. 초등 기초수학부터 중등 수학내신, 고등 수능수학까지 학년별 1:1 맞춤 수업. ${region.nearby} 인근 전화 상담 ${phone}`;
  const nearby = closestRegions(region, 8).map(item => `<a href="/areas/${item.region.slug}/">${item.region.name} 수학과외<span>${kmText(item.distance)}</span></a>`).join("");
  const faqs = [
    [`${region.name} 수학과외는 어떤 학생이 받을 수 있나요?`, `세종 ${region.name}에 사는 초등학생부터 고3까지, 예비중·예비고 학생 모두 상담할 수 있습니다. 현재 실력과 목표를 확인해 수업 출발점을 정합니다.`],
    [`${region.name} 초등·중등·고등 수학수업은 어떻게 다른가요?`, "초등은 연산과 기초수학, 중등은 수학내신과 서술형 풀이, 고등은 내신 등급과 수능수학에 중점을 둡니다."],
    [`${region.name} 수학과외 수업 시간과 방식은 어떻게 정하나요?`, `${region.nearby} 등 세부 위치와 희망 요일·시간을 확인한 뒤 전화 상담에서 가능한 일정과 수업 방식을 안내합니다.`],
    ["수업료는 어떻게 되나요?", "학년과 주당 수업 횟수, 수업 시간에 따라 달라지며 전화 상담 시 자세히 안내합니다."]
  ];
  const body = `<main id="main" class="local-page">
    <section class="local-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="현재 위치"><a href="/">세종</a><span>/</span><strong>${region.name}</strong></nav><p class="eyebrow">${region.group} · LOCAL MATH COACHING</p><h1>${region.name}<br>수학과외</h1><p>${region.nearby}에서 만나는 1:1 맞춤 수업. ${region.focus} 방식으로 학생의 공부 흐름을 바로잡습니다.</p></div></section>
    <section class="local-intro"><div class="wrap section-heading"><div><p class="kicker">LOCAL STUDY PLAN</p><h2>가까운 곳에서<br>꾸준히 배우는 수학</h2></div><div><p>세종 ${region.name} 수학과외는 최근 시험지와 현재 사용하는 교재를 먼저 살펴봅니다. 정답 개수만 확인하지 않고 개념 이해, 풀이 순서, 계산 습관 중 어디에서 막혔는지 구분해 다음 학습량을 정합니다.</p><p>${region.focus}. 초등 개념과 연산, 중등 내신의 서술형 풀이, 고등 수학의 개념 연결과 문제 해석까지 현재 필요한 단계에 집중합니다.</p></div></div></section>
    ${regionSchoolSection(region)}
    <section class="level-section"><div class="wrap"><div class="section-heading"><div><p class="kicker">BY SCHOOL LEVEL</p><h2>${region.name} 초등·중등·고등<br>수학수업 안내</h2></div><p>${pick(levels, index).paragraphs[0]}</p></div><div class="level-grid">${levelCards(region.name, region)}</div></div></section>
    <section class="grade-section local-grades" id="grades"><div class="wrap"><div class="section-heading light"><div><p class="kicker">GRADE BY GRADE</p><h2>${region.name} 학년별<br>수학과외</h2></div><p>학년마다 꼭 잡아야 할 단원이 다릅니다. 학년을 선택하면 주요 단원과 공부법을 확인할 수 있습니다.</p></div><div class="grade-links">${gradeGuides.map(grade => `<a href="${gradePath(grade.name)}"><small>${grade.full}</small><strong>${region.name} ${grade.name} 수학과외</strong><span>${grade.focus}</span></a>`).join("")}</div></div></section>
    ${faqSection(faqs, `${region.name} 수학과외<br>자주 묻는 질문`)}
    <section class="local-details"><div class="wrap detail-grid"><article><p class="kicker">LESSON FOCUS</p><h2>${region.name} 학생에게 맞는<br>현실적인 계획</h2><p>학교별 시험 일정과 학생의 생활 패턴을 고려해 무리하지 않고 이어갈 수 있는 주간 계획을 세웁니다. 대면 수업 가능 여부와 시간은 세부 위치와 희망 일정에 따라 상담 후 안내합니다.</p></article><article><p class="kicker">NEARBY AREAS</p><h3>세종 다른 지역 수학과외</h3><div class="nearby-links">${nearby}</div></article></div></section>
    ${ctaSection(`${region.name} 수학과외 상담`)}
  </main>`;
  const schema = [faqSchema(faqs), breadcrumbSchema([["세종 수학과외", `${siteUrl}/`], [`${region.name} 수학과외`, pageUrl("areas", region.slug)]])];
  return layout({ title, description, canonical: pageUrl("areas", region.slug), body, schema });
}

function levelPage(level, region, index = 0) {
  const place = region ? region.name : "세종";
  const fullPlace = region ? `세종 ${region.name}` : "세종";
  const levelIndex = levels.indexOf(level);
  const title = `${fullPlace} ${level.label} 수학과외 | ${level.titleTail}`;
  const descSchools = region ? localSchools(region, schoolTypes[level.slug]).schools.slice(0, 2).map(school => school.name).join("·") : "";
  const description = `${fullPlace} ${level.label} 수학과외. ${level.descKeywords}까지 ${level.range} 학년별 1:1 맞춤 관리. ${region ? descSchools : `세종 ${schoolTypes[level.slug]} ${schoolsOf(schoolTypes[level.slug]).length}곳`} 학생 맞춤, 전화 상담 ${phone}`;
  const lead = region ? pick([
    `세종 ${region.name} ${level.label} 수학과외는 ${region.nearby} 인근 ${level.learner}의 학교 진도와 현재 실력을 먼저 확인하고 수업을 시작합니다.`,
    `${region.group} ${region.name}에서 ${level.learner} 수학을 1:1로 관리합니다. 최근 시험지와 사용 중인 교재를 살펴 막힌 단원부터 정리합니다.`,
    `${region.name} ${level.learner}의 수학 고민은 저마다 다릅니다. 개념, 풀이 순서, 계산 습관 중 어디서 흔들리는지 구분해 수업 방향을 정합니다.`,
    `${region.nearby}에 사는 ${level.learner}를 위한 ${region.name} ${level.label} 수학수업입니다. ${region.focus}에 초점을 맞춥니다.`
  ], index + levelIndex) : `세종특별자치시 26개 읍·면·동의 ${level.learner}를 위한 1:1 ${level.label} 수학과외입니다. 학교 진도와 현재 실력을 먼저 확인하고 수업을 시작합니다.`;
  const paragraphs = [pick(level.paragraphs, index), pick(level.paragraphs, index + 1)];
  const schoolType = schoolTypes[level.slug];
  const local = region ? localSchools(region, schoolType) : null;
  const faqs = level.faqs(place);
  if (local && !local.nearby) faqs.splice(1, 0, [`${local.schools[0].name} 학생도 ${level.label} 수학과외를 받을 수 있나요?`, `네. ${local.schools.map(school => school.name).join(", ")} 등 ${region.name} ${schoolType} 학생의 교과서와 시험 범위, 학교 진도를 확인해 맞춤 수업을 진행합니다.`]);
  const schoolSection = region
    ? `<section class="school-section"><div class="wrap"><div class="section-heading"><div><p class="kicker">LOCAL SCHOOLS</p><h2>${region.name}${local.nearby ? " 인근" : ""} ${schoolType}<br>${level.label} 수학과외</h2></div><p>${local.nearby ? `${region.name}과 가까운 ${local.schools.map(school => `${school.area} ${school.name}`).join(", ")} 학생도 상담할 수 있습니다.` : `${region.name}의 ${local.schools.map(school => school.name).join(", ")} 학생을 위한 ${level.label} 수학과외입니다.`} 학교별 교과서와 시험 범위를 확인해 수업을 준비합니다. ${regionFacts(region)}</p></div><ul class="school-list school-list-wide">${local.schools.map(school => schoolItem(school, schoolNotes[level.slug], local.nearby)).join("")}</ul><p class="school-source">${schoolSource}</p></div></section>`
    : `<section class="school-section"><div class="wrap"><div class="section-heading"><div><p class="kicker">SEJONG SCHOOLS</p><h2>세종 ${schoolType}<br>${level.label} 수학과외</h2></div><p>세종특별자치시 ${schoolType} ${schoolsOf(schoolType).length}곳 학생의 학교 진도와 시험 범위에 맞춰 수업합니다. 지역을 선택하면 해당 지역 ${level.label} 수학과외 안내로 이동합니다.</p></div><div class="school-directory">${regions.filter(item => schoolsIn(item, schoolType).length).map(item => `<div><a href="${regionPath(item, level)}">${item.name} ${level.label} 수학과외 →</a><p>${schoolsIn(item, schoolType).map(schoolLink).join(", ")}</p></div>`).join("")}${schoolsOf(schoolType).filter(school => !regions.some(item => item.name === school.area)).map(school => `<div><strong>${school.area}</strong><p>${schoolLink(school)}</p></div>`).join("")}</div><p class="school-source">${schoolSource}</p></div></section>`;
  const topicCards = level.topics.map(([topic, text], topicIndex) => `<article><b>${String(topicIndex + 1).padStart(2, "0")}</b><h3>${place} ${level.label} ${topic}</h3><p>${text}</p></article>`).join("");
  const levelGradeCards = level.grades.map(([name, text]) => region ? `<article class="grade-card grade-card-compact"><span>${level.en}</span><h3>${place} ${name} 수학과외</h3>${gradeMore(name)}</article>` : `<article class="grade-card"><span>${level.en}</span><h3>${place} ${name} 수학과외</h3><p>${text}</p>${gradeMore(name)}</article>`).join("");
  const otherLevels = levels.filter(item => item !== level).map(item => `<a href="${region ? regionPath(region, item) : `/${item.slug}/`}">${place} ${item.label} 수학과외<span>→</span></a>`).join("");
  const guideLinks = levelGuides[level.slug].map(slug => guides.find(guide => guide.slug === slug)).map(guide => `<a href="${guidePath(guide)}">세종 ${guide.label} 가이드<span>→</span></a>`).join("");
  const related = (region
    ? `<a href="${regionPath(region)}">${region.name} 수학과외<span>→</span></a>${otherLevels}<a href="/${level.slug}/">세종 ${level.label} 수학과외<span>→</span></a>`
    : `<a href="/">세종 수학과외<span>→</span></a>${otherLevels}`) + guideLinks;
  const nearbyRegions = region
    ? closestRegions(region, 6).map(item => item.region)
    : [];
  const nearbyBlock = region
    ? `<article><p class="kicker">NEARBY AREAS</p><h3>세종 다른 지역 ${level.label} 수학과외</h3><div class="nearby-links">${nearbyRegions.map(item => `<a href="${regionPath(item, level)}">${item.name} ${level.label} 수학<span>→</span></a>`).join("")}</div></article>`
    : `<article><p class="kicker">LESSON FOCUS</p><h3>${level.label} 수학, 이런 학생에게 맞습니다</h3><p>${level.paragraphs[2]}</p></article>`;
  const regionSection = region ? "" : `<section class="areas"><div class="wrap"><div class="section-heading"><div><p class="kicker">LOCAL CLASS</p><h2>지역별 세종<br>${level.label} 수학과외</h2></div><p>가까운 읍·면·동을 선택하면 해당 지역 ${level.label} 수학수업 안내를 확인할 수 있습니다.</p></div><div class="region-grid">${regions.map(item => `<a class="region-link" href="${regionPath(item, level)}"><small>${item.group}</small><strong>${item.name} ${level.label} 수학과외</strong><span aria-hidden="true">↗</span></a>`).join("")}</div></div></section>`;
  const crumbs = region
    ? `<a href="/">세종</a><span>/</span><a href="${regionPath(region)}">${region.name}</a><span>/</span><strong>${level.label}</strong>`
    : `<a href="/">세종</a><span>/</span><strong>${level.label} 수학과외</strong>`;
  const body = `<main id="main" class="local-page">
    <section class="local-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="현재 위치">${crumbs}</nav><p class="eyebrow">${region ? `${region.group} · ` : ""}${level.en} · ${level.range}</p><h1>${place}<br>${level.label} 수학과외</h1><p>${lead}</p></div></section>
    <section class="local-intro"><div class="wrap section-heading"><div><p class="kicker">STUDY PLAN</p><h2>${place} ${level.label} 수학,<br>지금 필요한 단계부터</h2></div><div><p>${paragraphs[0]}</p><p>${paragraphs[1]}</p></div></div></section>
    ${schoolSection}
    <section class="topic-section"><div class="wrap"><div class="section-heading"><div><p class="kicker">LESSON PROGRAM</p><h2>${place} ${level.label}<br>수학 수업 구성</h2></div><p>${level.descKeywords}까지 학생에게 지금 필요한 수업을 골라 진행합니다.</p></div><div class="topic-grid">${topicCards}</div></div></section>
    <section class="grade-section local-grades" id="grades"><div class="wrap"><div class="section-heading light"><div><p class="kicker">GRADE BY GRADE</p><h2>${place} ${level.range}<br>학년별 수학과외</h2></div><p>학년마다 꼭 잡아야 할 단원이 다릅니다. 현재 학년 진도와 이전 학년 복습을 함께 설계합니다.</p></div><div class="grade-grid">${levelGradeCards}</div></div></section>
    ${regionSection}
    ${faqSection(faqs, `${place} ${level.label} 수학과외<br>자주 묻는 질문`)}
    <section class="local-details"><div class="wrap detail-grid"><article><p class="kicker">RELATED CLASS</p><h2>함께 찾는<br>${place} 수학수업</h2><div class="nearby-links">${related}</div></article>${nearbyBlock}</div></section>
    ${ctaSection(`${place} ${level.label} 수학과외 상담`)}
  </main>`;
  const canonical = region ? pageUrl("areas", region.slug, level.slug) : pageUrl(level.slug);
  const crumbData = region
    ? [["세종 수학과외", `${siteUrl}/`], [`${region.name} 수학과외`, pageUrl("areas", region.slug)], [`${region.name} ${level.label} 수학과외`, canonical]]
    : [["세종 수학과외", `${siteUrl}/`], [`세종 ${level.label} 수학과외`, canonical]];
  return { title, description, url: canonical, html: layout({ title, description, canonical, body, schema: [faqSchema(faqs), breadcrumbSchema(crumbData)] }) };
}

const guides = [
  {
    slug: "academy-vs-tutoring",
    label: "학원 vs 과외",
    title: "세종 수학학원 vs 수학과외 | 우리 아이에게 맞는 선택 기준",
    description: `세종 수학학원과 1:1 수학과외의 차이, 학원 순위보다 먼저 확인할 것, 학생 유형별 추천을 정리했습니다. 초등·중등·고등 상담 ${phone}`,
    h1: "세종 수학학원<br>vs 수학과외",
    kicker: "CHOOSING GUIDE",
    lead: "세종 수학학원 순위나 추천 글을 찾고 계신가요? 어디가 유명한지보다 우리 아이에게 어떤 수업 형태가 맞는지가 먼저입니다.",
    sections: [
      ["학원 순위보다 먼저 확인할 네 가지", `<p>같은 수학학원에 다녀도 성적이 오르는 학생과 그렇지 않은 학생이 있습니다. 학원이나 과외를 고르기 전에 아래 네 가지를 먼저 확인해 보세요.</p><ol><li><strong>현재 실력</strong>: 지금 학년 진도를 따라가고 있는지, 이전 학년 개념부터 비어 있는지</li><li><strong>수업 속도</strong>: 여러 명과 같은 속도로 나가도 괜찮은지</li><li><strong>질문 습관</strong>: 모르는 것을 수업 중에 스스로 질문하는 편인지</li><li><strong>자기 주도성</strong>: 숙제와 오답 정리를 혼자 해내는지</li></ol>`],
      ["세종 수학학원과 1:1 수학과외 비교", `<div class="table-wrap"><table><thead><tr><th>항목</th><th>수학학원</th><th>1:1 수학과외</th></tr></thead><tbody><tr><th>수업 인원</th><td>여러 명이 같은 반에서 수업</td><td>학생 한 명</td></tr><tr><th>진도</th><td>반 커리큘럼 기준</td><td>학생 이해 속도 기준</td></tr><tr><th>질문</th><td>수업 후 질문 시간 활용</td><td>수업 중 바로 질문</td></tr><tr><th>내신 대비</th><td>학교별 반이 있으면 효과적</td><td>학생 학교의 범위·부교재에 맞춤</td></tr><tr><th>강점</th><td>체계적 커리큘럼, 또래와의 경쟁</td><td>빈틈 진단과 보완, 일정 조율</td></tr></tbody></table></div>`],
      ["1:1 수학과외가 더 잘 맞는 학생", `<ul><li>이전 학년 개념이 비어 있어 반 진도를 따라가기 어려운 학생</li><li>수업 중에 질문하기를 어려워하는 학생</li><li>학원 진도보다 빠르게, 또는 더 깊게 공부하고 싶은 학생</li><li>운동, 예체능, 이동 거리 때문에 정해진 반 시간에 맞추기 어려운 학생</li><li>시험 범위와 부교재가 다른 학교에 다녀 맞춤 내신 대비가 필요한 학생</li></ul>`],
      ["수학학원이 더 잘 맞는 학생", `<ul><li>현재 학년 진도를 무리 없이 따라가고 있는 학생</li><li>또래와 함께할 때 동기부여가 되는 학생</li><li>숙제와 오답 정리를 혼자서도 꾸준히 해내는 학생</li></ul><p>학원에 다니면서 특정 단원이나 시험 기간에만 1:1 수업으로 보완하는 방법도 많이 선택합니다.</p>`],
      ["상담할 때 꼭 물어볼 체크리스트", `<ul><li>첫 수업 전에 현재 실력을 진단하나요?</li><li>우리 아이 학교의 시험 범위와 기출을 반영하나요?</li><li>오답은 어떻게 기록하고 다시 확인하나요?</li><li>학습 상황을 얼마나 자주, 어떤 방식으로 알려 주나요?</li><li>집에서 오가는 시간까지 고려했을 때 꾸준히 다닐 수 있나요?</li></ul>`]
    ],
    faqs: [
      ["세종 수학학원 순위를 참고해도 될까요?", "참고는 할 수 있지만 순위가 높은 곳이 모든 학생에게 맞는 것은 아닙니다. 학생의 현재 실력, 수업 속도, 질문 습관에 맞는지가 더 중요합니다."],
      ["학원과 과외를 같이 해도 되나요?", "가능합니다. 학원에서 진도를 나가고, 1:1 수업에서 막힌 단원과 내신 대비를 보완하는 방식이 많이 쓰입니다. 다만 숙제 분량이 과하지 않도록 조율해야 합니다."],
      ["1:1 수학과외는 언제 시작하는 게 좋나요?", "성적이 떨어진 뒤보다 학년이 바뀌기 전 방학이나, 같은 단원에서 반복해서 막히기 시작할 때 시작하는 것이 효과적입니다."]
    ],
    related: ["/elementary/", "/middle/", "/high/"]
  },
  {
    slug: "pre-middle1",
    label: "예비중1 수학",
    title: "세종 예비중1 수학 | 겨울방학 중학 수학 준비 로드맵",
    description: `세종 예비중1 수학 준비, 겨울방학 12주 로드맵과 초6 수학 점검 항목, 선행 속도 기준을 정리했습니다. 1:1 수학과외 상담 ${phone}`,
    h1: "세종 예비중1<br>수학 로드맵",
    kicker: "WINTER PREP · 초6 → 중1",
    lead: "중학교에서는 수학이 처음으로 시험 점수와 성적표로 남습니다. 초등 과정의 빈틈을 먼저 채우고, 중1 첫 단원을 무리 없이 시작하는 순서를 정리했습니다.",
    sections: [
      ["예비중1 수학이 중요한 이유", `<p>중1 수학은 정수와 유리수, 문자와 식처럼 <strong>수학의 언어가 바뀌는</strong> 단원으로 시작합니다. 초등학교 때 분수·소수 계산과 문장제 해석이 흔들렸던 학생은 이 시기에 처음 어려움을 느끼기 쉽습니다.</p><p>자유학기 운영 여부와 시험 일정은 학교마다 다르므로 입학 예정 학교의 일정을 함께 확인하는 것이 좋습니다.</p>`],
      ["초6 수학 점검 체크리스트", `<ul><li>분수의 사칙연산을 실수 없이 할 수 있나요?</li><li>약수와 배수, 최대공약수·최소공배수를 설명할 수 있나요?</li><li>비와 비율, 백분율 문제를 식으로 세울 수 있나요?</li><li>문장제를 읽고 무엇을 구하는지 정리할 수 있나요?</li><li>도형의 넓이와 부피 공식을 이유와 함께 기억하나요?</li></ul><p>두 개 이상 자신이 없다면 중1 선행보다 초등 과정 보완을 먼저 권합니다.</p>`],
      ["겨울방학 12주 로드맵", `<div class="table-wrap"><table><thead><tr><th>기간</th><th>학습 내용</th><th>목표</th></tr></thead><tbody><tr><th>1~3주</th><td>분수·소수 연산, 약수와 배수, 비와 비율 복습</td><td>초등 연산 정확도 확보</td></tr><tr><th>4~6주</th><td>소인수분해, 정수와 유리수</td><td>음수 계산 규칙 이해</td></tr><tr><th>7~9주</th><td>문자의 사용과 식의 계산, 일차방정식</td><td>식 세우기와 풀이 과정 서술</td></tr><tr><th>10~12주</th><td>좌표평면과 그래프, 정비례와 반비례</td><td>함수 개념의 첫 연결</td></tr></tbody></table></div><p>속도는 학생에 따라 조정합니다. 빠르게 많이 나가는 것보다 한 단원을 스스로 설명할 수 있을 때 다음 단원으로 넘어가는 것이 중학교 첫 시험에서 더 유리합니다.</p>`],
      ["선행은 어디까지 하면 좋을까요?", `<p>초등 과정이 탄탄하다면 중1 1학기 과정을 한 번 정리하고 중1 2학기 도형 단원을 맛보는 정도가 적당합니다. 초등 과정에 빈틈이 있다면 중1 1학기 앞부분까지만 나가고 복습 비중을 높입니다.</p>`]
    ],
    faqs: [
      ["예비중1 수학은 언제부터 준비하나요?", "초6 2학기 기말고사 이후 겨울방학에 시작하는 경우가 가장 많습니다. 초등 과정에 빈틈이 있다면 가을부터 복습을 시작하면 여유가 생깁니다."],
      ["중1 수학 선행은 몇 학기 앞서야 하나요?", "학생마다 다릅니다. 초등 연산과 문장제가 안정적이면 한 학기 정도 앞서 나가고, 그렇지 않다면 복습을 우선합니다."],
      ["예비중1도 1:1 수학과외가 효과적인가요?", "초등 과정의 어느 부분이 비어 있는지 정확히 찾아 보완해야 하는 시기라 1:1 진단 수업의 효과가 큰 편입니다."]
    ],
    related: ["/elementary/", "/middle/", "/guide/gifted/"]
  },
  {
    slug: "pre-high1",
    label: "예비고1 수학",
    title: "세종 예비고1 수학 | 공통수학1·2 선행과 중학 수학 복습 순서",
    description: `세종 예비고1 수학 준비, 공통수학1·2 단원 구성과 중학 필수 복습 단원, 겨울방학 학습 순서를 정리했습니다. 1:1 수학과외 상담 ${phone}`,
    h1: "세종 예비고1<br>수학 준비",
    kicker: "WINTER PREP · 중3 → 고1",
    lead: "고1 수학은 내신 등급과 이후 수능 준비의 출발점입니다. 중학 수학의 어떤 단원을 다시 보고, 공통수학을 어떤 순서로 시작할지 정리했습니다.",
    sections: [
      ["고1 수학, 무엇이 달라지나요?", `<p>2022 개정 교육과정에서 고1은 <strong>공통수학1</strong>과 <strong>공통수학2</strong>를 배웁니다. 내용이 많아지고 문제의 조건이 길어져 중학교 때처럼 유형 암기만으로는 점수를 유지하기 어렵습니다.</p><div class="table-wrap"><table><thead><tr><th>과목</th><th>주요 단원</th></tr></thead><tbody><tr><th>공통수학1</th><td>다항식, 방정식과 부등식, 경우의 수, 행렬</td></tr><tr><th>공통수학2</th><td>도형의 방정식, 집합과 명제, 함수와 그래프</td></tr></tbody></table></div>`],
      ["먼저 복습해야 할 중학 수학 단원", `<ul><li><strong>다항식의 곱셈과 인수분해</strong>: 공통수학1 다항식 단원의 바탕</li><li><strong>이차방정식</strong>: 근의 공식, 판별식, 근과 계수의 관계로 이어짐</li><li><strong>일차함수와 이차함수</strong>: 함수와 그래프, 도형의 방정식의 바탕</li><li><strong>부등식과 연립방정식</strong>: 방정식과 부등식 단원의 기본</li></ul><p>이 단원에서 막힌다면 공통수학 선행 속도를 늦추고 중학 복습을 병행하는 것이 결과적으로 더 빠릅니다.</p>`],
      ["겨울방학 학습 순서 예시", `<div class="table-wrap"><table><thead><tr><th>기간</th><th>학습 내용</th></tr></thead><tbody><tr><th>1~2주</th><td>중학 인수분해·이차방정식·이차함수 집중 복습</td></tr><tr><th>3~6주</th><td>공통수학1 다항식, 방정식과 부등식</td></tr><tr><th>7~9주</th><td>공통수학1 경우의 수, 행렬과 1학기 범위 정리</td></tr><tr><th>10~12주</th><td>공통수학2 도형의 방정식 시작, 고1 1학기 중간고사 범위 문제 연습</td></tr></tbody></table></div>`],
      ["선행보다 중요한 것", `<p>고1 첫 시험은 학교마다 범위와 난도가 다릅니다. 진학 예정 학교의 교과서와 부교재를 확인하고, 개념 설명 → 교과서 문제 → 학교 기출 순서로 연습해야 실제 점수로 이어집니다.</p>`]
    ],
    faqs: [
      ["예비고1은 공통수학을 어디까지 선행해야 하나요?", "중학 과정이 탄탄하다면 공통수학1 전체와 공통수학2 앞부분까지 정리하는 학생이 많습니다. 중학 함수와 인수분해가 흔들리면 공통수학1 정리에 집중하는 것이 좋습니다."],
      ["중3 겨울방학에 중학 복습도 해야 하나요?", "인수분해, 이차방정식, 이차함수는 고1 수학 전반에 쓰이므로 짧게라도 꼭 다시 점검하는 것을 권합니다."],
      ["고1 내신 대비는 언제부터 하나요?", "입학 후 첫 중간고사 4주 전부터 학교 교과서와 부교재 중심으로 준비합니다. 방학 동안 개념을 미리 정리해 두면 시험 대비 기간에 문제 연습 비중을 높일 수 있습니다."]
    ],
    related: ["/middle/", "/high/", "/guide/school-exam/"]
  },
  {
    slug: "school-exam",
    label: "중·고등 수학 내신",
    title: "세종 중학교·고등학교 수학 내신 대비법 | 시험 4주 전 계획",
    description: `세종 중학교·고등학교 수학 내신 시험 대비 방법. 학교별 범위 확인부터 4주 학습 계획, 서술형 감점 줄이기, 시험 후 분석까지 정리했습니다. 상담 ${phone}`,
    h1: "세종 중·고등<br>수학 내신 대비",
    kicker: "SCHOOL EXAM GUIDE",
    lead: "같은 학년이어도 학교마다 교과서, 부교재, 서술형 비율이 다릅니다. 세종 중학교·고등학교 수학 내신을 준비하는 순서를 4주 계획으로 정리했습니다.",
    sections: [
      ["학교마다 수학 시험이 다른 이유", `<ul><li><strong>교과서 출판사</strong>: 같은 단원이라도 예제와 문제 구성이 다릅니다.</li><li><strong>부교재와 프린트</strong>: 학교에 따라 시험 문제의 상당 부분이 부교재에서 변형되어 나옵니다.</li><li><strong>서술형 비율</strong>: 풀이 과정 채점 기준을 알아야 감점을 줄일 수 있습니다.</li><li><strong>수행평가</strong>: 지필 시험과 별도로 성적에 반영되므로 일정을 함께 관리해야 합니다.</li></ul>`],
      ["시험 4주 전 학습 계획", `<div class="table-wrap"><table><thead><tr><th>시기</th><th>할 일</th></tr></thead><tbody><tr><th>4주 전</th><td>시험 범위·교과서·부교재 확인, 단원별 개념 정리</td></tr><tr><th>3주 전</th><td>교과서와 부교재 문제 전체 풀이, 틀린 문제 표시</td></tr><tr><th>2주 전</th><td>학교 기출 경향에 맞춘 유형 연습, 서술형 풀이 쓰기</td></tr><tr><th>1주 전</th><td>실전 시간에 맞춘 모의 시험, 오답만 다시 풀기</td></tr></tbody></table></div>`],
      ["서술형 감점을 줄이는 방법", `<ul><li>구하려는 값을 문자로 정의하고 시작합니다.</li><li>식을 세운 이유를 한 줄로 적습니다.</li><li>계산 과정은 중간 단계를 생략하지 않습니다.</li><li>마지막에 단위와 조건(정수, 양수 등)을 확인합니다.</li></ul>`],
      ["시험이 끝난 뒤가 더 중요합니다", `<p>틀린 문제를 <strong>개념 부족, 문제 해석 실수, 계산 실수, 시간 부족</strong>으로 나누어 기록하면 다음 시험에서 무엇을 바꿔야 하는지 분명해집니다. 이 기록을 다음 학기 학습 계획에 반영합니다.</p>`]
    ],
    faqs: [
      ["세종 중학교 수학 내신은 언제부터 준비하나요?", "보통 시험 4주 전부터 시작합니다. 평소에 개념과 오답을 정리해 두었다면 시험 기간에는 학교 기출과 서술형 연습에 집중할 수 있습니다."],
      ["고등학교 수학 내신과 모의고사는 어떻게 함께 준비하나요?", "시험 4주 전부터는 내신 비중을 높이고, 시험이 끝난 뒤에는 모의고사와 수능형 문제 비중을 높이는 방식으로 번갈아 관리합니다."],
      ["학교 기출문제는 어떻게 활용하나요?", "문제를 외우기보다 자주 나오는 단원, 서술형 형태, 난도 분포를 파악하는 데 사용합니다."]
    ],
    related: ["/schools/", "/middle/", "/high/", "/guide/pre-high1/"]
  },
  {
    slug: "gifted",
    label: "영재교육원 수학",
    title: "세종 영재교육원 수학 준비 | 초등·중등 영재 선발 대비 방법",
    description: `세종 영재교육원·영재학급 수학 분야 준비 방법. 선발 과정에서 보는 능력, 사고력 문제 연습법, 학년별 준비 순서를 정리했습니다. 상담 ${phone}`,
    h1: "세종 영재교육원<br>수학 준비",
    kicker: "GIFTED PROGRAM GUIDE",
    lead: "영재교육원 수학 분야는 문제를 빨리 푸는 능력보다 새로운 문제를 끝까지 생각하고 설명하는 힘을 봅니다. 세종 영재교육원과 영재학급을 준비하는 방법을 정리했습니다.",
    sections: [
      ["선발 과정 이해하기", `<p>영재교육원과 영재학급은 대체로 <strong>교사 관찰·추천</strong>을 거쳐 <strong>창의적 문제해결력 평가</strong>와 <strong>면접</strong> 등으로 선발합니다. 모집 시기, 대상 학년, 전형 방법은 기관과 연도마다 다르므로 세종특별자치시교육청과 각 영재교육기관의 모집 공고를 반드시 확인해야 합니다.</p>`],
      ["수학 분야에서 보는 능력", `<ul><li><strong>문제 이해력</strong>: 처음 보는 조건을 정리하고 무엇을 구할지 파악하는 힘</li><li><strong>논리적 사고</strong>: 규칙을 찾고 그 규칙이 왜 성립하는지 설명하는 힘</li><li><strong>다양한 풀이</strong>: 한 가지 방법에 머물지 않고 다른 접근을 시도하는 태도</li><li><strong>표현력</strong>: 생각한 과정을 글과 그림으로 전달하는 능력</li></ul>`],
      ["학년별 준비 순서", `<div class="table-wrap"><table><thead><tr><th>시기</th><th>준비 내용</th></tr></thead><tbody><tr><th>초3~초4</th><td>교과 개념을 탄탄히 하고 퍼즐·규칙 찾기 등 사고력 문제에 익숙해지기</td></tr><tr><th>초5~초6</th><td>경우의 수, 수의 성질, 도형 문제를 깊게 다루고 풀이 과정 서술 연습</td></tr><tr><th>중등</th><td>교과 심화와 함께 증명형 문제, 탐구형 과제 경험 쌓기</td></tr></tbody></table></div>`],
      ["집과 수업에서 할 수 있는 연습", `<p>한 문제를 오래 붙잡고 생각해 보는 경험이 가장 중요합니다. 정답을 바로 알려 주기보다 <strong>어디까지 알았는지, 다음에 무엇을 시도해 볼지</strong>를 말로 설명하게 하고, 풀이를 글로 정리하는 습관을 만듭니다. 1:1 수업에서는 학생의 사고 과정을 따라가며 막히는 지점에서 질문으로 방향을 잡아 줄 수 있습니다.</p>`]
    ],
    faqs: [
      ["영재교육원 수학은 선행을 많이 해야 하나요?", "선행 진도보다 현재 학년 개념을 깊게 이해하고 새로운 문제를 끝까지 생각하는 힘이 더 중요합니다. 다만 교과 개념이 탄탄하지 않으면 사고력 문제에서도 한계가 생깁니다."],
      ["세종 영재교육원 모집 일정은 어디서 확인하나요?", "세종특별자치시교육청과 각 영재교육기관의 모집 공고를 확인해야 합니다. 일정과 전형은 해마다 달라질 수 있습니다."],
      ["영재교육원 준비와 학교 수학 공부를 함께 할 수 있나요?", "가능합니다. 교과 개념을 다지는 수업에 사고력·서술형 문제를 조금씩 더하는 방식이 무리가 적습니다."]
    ],
    related: ["/elementary/", "/middle/", "/guide/pre-middle1/"]
  }
];

const guidePath = guide => `/guide/${guide.slug}/`;
const pathTitle = href => {
  const level = levels.find(item => `/${item.slug}/` === href);
  if (level) return `세종 ${level.label} 수학과외`;
  if (href === "/schools/") return "세종 학교별 수학과외";
  if (href === "/grades/") return "세종 학년별 수학과외";
  const guide = guides.find(item => guidePath(item) === href);
  return guide ? `세종 ${guide.label} 가이드` : "세종 수학과외";
};
const guideCards = list => list.map((guide, index) => `<a class="level-card" href="${guidePath(guide)}"><span>GUIDE ${String(index + 1).padStart(2, "0")}</span><h3>세종 ${guide.label}</h3><p>${guide.lead}</p><b>가이드 읽기 <i aria-hidden="true">→</i></b></a>`).join("");
const levelGuides = { elementary: ["pre-middle1", "gifted"], middle: ["school-exam", "pre-high1"], high: ["school-exam", "pre-high1"] };

function guidePage(guide) {
  const canonical = pageUrl("guide", guide.slug);
  const toc = guide.sections.map(([heading], index) => `<a href="#s${index + 1}">${heading}</a>`).join("");
  const sections = guide.sections.map(([heading, html], index) => `<section id="s${index + 1}"><h2>${heading}</h2>${html}</section>`).join("");
  const related = guide.related.map(href => `<a href="${href}">${pathTitle(href)}<span>→</span></a>`).join("") + `<a href="/guide/">세종 수학 학습 가이드 전체<span>→</span></a>`;
  const body = `<main id="main" class="local-page">
    <section class="local-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="현재 위치"><a href="/">세종</a><span>/</span><a href="/guide/">학습 가이드</a><span>/</span><strong>${guide.label}</strong></nav><p class="eyebrow">${guide.kicker}</p><h1>${guide.h1}</h1><p>${guide.lead}</p></div></section>
    <section class="article-section"><div class="wrap article-layout"><aside class="article-toc" aria-label="목차"><p class="kicker">CONTENTS</p>${toc}</aside><article class="article-body">${sections}<p class="article-note">이 글은 세종 수학과외의 수업 경험을 바탕으로 정리한 일반적인 안내입니다. 학교 일정과 전형은 해당 학교와 교육청 공지를 확인해 주세요.</p></article></div></section>
    ${faqSection(guide.faqs, `세종 ${guide.label}<br>자주 묻는 질문`)}
    <section class="local-details"><div class="wrap detail-grid"><article><p class="kicker">RELATED</p><h2>함께 보면 좋은<br>세종 수학 정보</h2><div class="nearby-links">${related}</div></article><article><p class="kicker">LOCAL CLASS</p><h3>우리 동네 수학과외 찾기</h3><div class="nearby-links">${regions.slice(10, 18).map(item => `<a href="${regionPath(item)}">${item.name} 수학과외<span>→</span></a>`).join("")}</div></article></div></section>
    ${ctaSection(`세종 ${guide.label} 상담`)}
  </main>`;
  const article = { "@context": "https://schema.org", "@type": "Article", headline: guide.title.split(" | ")[0], description: guide.description, inLanguage: "ko", mainEntityOfPage: canonical, datePublished: "2026-10-24", dateModified: "2026-10-24", author: { "@type": "Organization", name: "세종 수학과외", url: siteUrl }, publisher: { "@type": "Organization", name: "세종 수학과외", logo: { "@type": "ImageObject", url: `${siteUrl}/icon-512.png` } } };
  const schema = [article, faqSchema(guide.faqs), breadcrumbSchema([["세종 수학과외", `${siteUrl}/`], ["세종 수학 학습 가이드", pageUrl("guide")], [guide.title.split(" | ")[0], canonical]])];
  return { title: guide.title, description: guide.description, url: canonical, html: layout({ title: guide.title, description: guide.description, canonical, body, schema }) };
}

function guideIndexPage() {
  const title = "세종 수학 학습 가이드 | 학원·과외 선택, 예비중1·예비고1, 내신, 영재교육원";
  const description = `세종 수학학원과 과외 선택 기준, 예비중1·예비고1 수학 로드맵, 중·고등 수학 내신 대비, 영재교육원 수학 준비까지 정리한 학습 가이드. 상담 ${phone}`;
  const canonical = pageUrl("guide");
  const body = `<main id="main" class="local-page">
    <section class="local-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="현재 위치"><a href="/">세종</a><span>/</span><strong>학습 가이드</strong></nav><p class="eyebrow">SEJONG MATH GUIDE</p><h1>세종 수학<br>학습 가이드</h1><p>학원과 과외 중 무엇이 맞을지, 방학에는 무엇을 준비할지, 내신과 영재교육원은 어떻게 대비할지 학부모님이 자주 묻는 내용을 정리했습니다.</p></div></section>
    <section class="level-section"><div class="wrap"><div class="level-grid">${guideCards(guides)}</div></div></section>
    ${ctaSection("세종 수학 학습 상담")}
  </main>`;
  const schema = [breadcrumbSchema([["세종 수학과외", `${siteUrl}/`], ["세종 수학 학습 가이드", canonical]])];
  return { title, description, url: canonical, html: layout({ title, description, canonical, body, schema }) };
}

const pageSchoolTypes = ["중학교", "고등학교"];
const schoolPages = schoolData.schools.filter(school => pageSchoolTypes.includes(school.level));
const hasSchoolPage = school => pageSchoolTypes.includes(school.level);
const schoolPath = school => `/schools/${school.name}/`;
const schoolUrl = school => `${siteUrl}/schools/${encodeURIComponent(school.name)}/`;
const shortSchool = name => name.replace(/여자고등학교$/, "여고").replace(/고등학교$/, "고").replace(/중학교$/, "중");
const schoolLevel = school => levels.find(level => schoolTypes[level.slug] === school.level);
const schoolRegion = school => regions.find(region => region.name === school.area);
const schoolLink = school => hasSchoolPage(school) ? `<a href="${schoolPath(school)}">${school.name}</a>` : school.name;
function nearbySameLevel(school, count = 4) {
  return schoolsOf(school.level).filter(item => item.name !== school.name).map(item => ({ ...item, distance: Math.hypot(item.lat - school.lat, (item.lng - school.lng) * Math.cos(school.lat * Math.PI / 180)) })).sort((a, b) => a.distance - b.distance).slice(0, count);
}

function schoolPage(school, index) {
  const short = shortSchool(school.name);
  const level = schoolLevel(school);
  const region = schoolRegion(school);
  const isHigh = school.level === "고등학교";
  const canonical = schoolUrl(school);
  const title = `${school.name} 수학과외 | 세종 ${school.area} ${short} 수학내신 1:1 맞춤 수업`;
  const description = `세종 ${school.area} ${school.name} 학생 1:1 수학과외. ${short} 교과서·부교재·시험 범위에 맞춘 수학내신 대비와 ${isHigh ? "모의고사·수능수학" : "서술형·고등 선행"}까지. 전화 상담 ${phone}`;
  const lead = pick([
    `${school.name}는 세종 ${school.area}에 있는 ${school.level}입니다. ${short} 학생의 교과서, 부교재, 시험 범위를 먼저 확인하고 현재 실력에 맞춰 1:1 수학 수업을 설계합니다.`,
    `${short} 수학 시험은 학교 진도와 출제 경향을 알고 준비할 때 결과가 달라집니다. ${school.area} ${school.name} 학생을 위해 내신 일정에 맞춘 학습 계획을 세웁니다.`,
    `${school.area}에서 ${school.name}에 다니는 학생을 위한 1:1 수학과외입니다. 개념 이해, 풀이 순서, 계산 습관 중 어디서 점수를 잃는지 진단한 뒤 수업을 시작합니다.`
  ], index);
  const focus = isHigh
    ? [`${short} 교과서와 부교재 중심의 내신 대비`, "학교 기출 경향에 맞춘 고난도 문항 연습", "서술형 채점 기준에 맞춘 풀이 쓰기와 수행평가 대비", "학력평가·모의고사 결과로 취약 단원 분석", "선택 과목과 진로에 맞춘 수능 수학 계획"]
    : [`${short} 교과서 출판사와 단원 순서 확인`, "학교 프린트·부교재 문제 반복 연습", "서술형 풀이 과정을 끝까지 쓰는 연습", "수행평가 일정과 과제 함께 관리", "예비고1 공통수학 선행으로 자연스럽게 연결"];
  const plan = isHigh
    ? [["4주 전", "시험 범위·교과서·부교재 확인, 단원별 개념 정리"], ["3주 전", "교과서·부교재 전체 풀이, 틀린 문제 표시"], ["2주 전", `${short} 기출 경향에 맞춘 유형·고난도 문항 연습`], ["1주 전", "실전 시간 모의 시험, 서술형 점검, 오답 재풀이"], ["시험 후", "오답 원인 분석 후 모의고사·수능 수학 학습으로 전환"]]
    : [["4주 전", "시험 범위·교과서·학교 프린트 확인, 개념 정리"], ["3주 전", "교과서와 부교재 문제 전체 풀이"], ["2주 전", `${short} 기출 형태에 맞춘 유형 연습과 서술형 쓰기`], ["1주 전", "실전 시간 모의 시험, 오답만 다시 풀기"], ["시험 후", "틀린 문제를 원인별로 기록하고 다음 단원 계획에 반영"]];
  const faqs = [
    [`${school.name} 수학 내신 대비가 가능한가요?`, `네. ${short} 교과서와 부교재, 시험 범위를 확인해 시험 4주 전부터 개념 정리, 문제 연습, 서술형 대비, 실전 점검 순서로 준비합니다.`],
    isHigh
      ? [`${short} 내신과 수능 수학을 함께 준비할 수 있나요?`, "시험 기간에는 내신 비중을, 시험이 끝난 뒤에는 모의고사와 수능 수학 비중을 높이는 방식으로 함께 관리합니다."]
      : [`${short} 학생도 고등 수학 선행을 할 수 있나요?`, "현재 학년 내신을 안정적으로 관리하면서 이해도에 맞춰 다음 학년과 공통수학 선행을 단계적으로 진행합니다."],
    [`${short} 학생 수업 시간과 장소는 어떻게 정하나요?`, `${school.area} 인근 세부 위치와 학교 일과, 다른 학원 일정을 확인한 뒤 전화 상담에서 가능한 시간과 수업 방식을 안내합니다.`]
  ];
  const gradeCardsHtml = level.grades.map(([name]) => `<article class="grade-card grade-card-compact"><span>${level.en}</span><h3>${short} ${name} 수학과외</h3>${gradeMore(name)}</article>`).join("");
  const sameNearest = closestSchools(school, school.level, 1, school.name)[0];
  const linkedTypes = isHigh ? ["중학교"] : ["초등학교", "고등학교"];
  const [foundedYear, foundedMonth] = school.founded.split("-");
  const infoRows = [["개교", `${foundedYear}년 ${Number(foundedMonth)}월`], ["설립", `${school.type} ${school.level}`], ["위치", `${school.address} (${school.area})`], [`가장 가까운 ${school.level}`, `${schoolLink(sameNearest)} · ${kmText(sameNearest.distance)}`], ...linkedTypes.map(type => [`인근 ${type}`, closestSchools(school, type, 3).map(item => `${schoolLink(item)} ${kmText(item.distance)}`).join(", ")])];
  const facts = `${school.name}는 ${foundedYear}년 ${Number(foundedMonth)}월 개교한 ${school.type} ${school.level}로 ${school.area}에 있습니다. 가장 가까운 ${school.level}는 ${sameNearest.name}(${kmText(sameNearest.distance)})입니다.`;
  const nearby = nearbySameLevel(school).map(item => `<a href="${schoolPath(item)}">${item.name} 수학과외<span>→</span></a>`).join("");
  const related = `${region ? `<a href="${regionPath(region, level)}">${region.name} ${level.label} 수학과외<span>→</span></a><a href="${regionPath(region)}">${region.name} 수학과외<span>→</span></a>` : ""}<a href="/${level.slug}/">세종 ${level.label} 수학과외<span>→</span></a><a href="/guide/school-exam/">세종 중·고등 수학 내신 가이드<span>→</span></a><a href="/schools/">세종 학교별 수학과외 전체<span>→</span></a>`;
  const body = `<main id="main" class="local-page">
    <section class="local-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="현재 위치"><a href="/">세종</a><span>/</span><a href="/schools/">학교별</a><span>/</span><strong>${school.name}</strong></nav><p class="eyebrow">${school.area} · ${level.en}</p><h1>${school.name}<br>수학과외</h1><p>${lead}</p></div></section>
    <section class="local-intro"><div class="wrap section-heading"><div><p class="kicker">SCHOOL FOCUS</p><h2>${short} 수학,<br>이렇게 준비합니다</h2></div><div><ul class="school-focus">${focus.map(item => `<li>${item}</li>`).join("")}</ul></div></div></section>
    <section class="school-section"><div class="wrap"><div class="section-heading"><div><p class="kicker">SCHOOL INFO</p><h2>${short}<br>학교 정보</h2></div><p>${facts} 주변 학교와의 거리를 참고해 수업 장소와 시간을 정합니다.</p></div><div class="article-body school-plan"><div class="table-wrap"><table><tbody>${infoRows.map(([key, value]) => `<tr><th>${key}</th><td>${value}</td></tr>`).join("")}</tbody></table></div></div><p class="school-source">${schoolSource}</p></div></section>
    <section class="article-section"><div class="wrap"><div class="section-heading"><div><p class="kicker">EXAM PLAN</p><h2>${short} 수학 시험<br>4주 대비 계획</h2></div><p>${pick(level.paragraphs, index)}</p></div><div class="article-body school-plan"><div class="table-wrap"><table><thead><tr><th>시기</th><th>할 일</th></tr></thead><tbody>${plan.map(([when, what]) => `<tr><th>${when}</th><td>${what}</td></tr>`).join("")}</tbody></table></div></div></div></section>
    <section class="grade-section local-grades" id="grades"><div class="wrap"><div class="section-heading light"><div><p class="kicker">GRADE BY GRADE</p><h2>${short} 학년별<br>수학과외</h2></div><p>학년마다 꼭 잡아야 할 단원이 다릅니다. ${short} 진도에 맞춰 현재 학년과 이전 학년 복습을 함께 설계합니다.</p></div><div class="grade-grid">${gradeCardsHtml}</div></div></section>
    ${faqSection(faqs, `${short} 수학과외<br>자주 묻는 질문`)}
    <section class="local-details"><div class="wrap detail-grid"><article><p class="kicker">RELATED CLASS</p><h2>함께 찾는<br>${school.area} 수학수업</h2><div class="nearby-links">${related}</div></article><article><p class="kicker">NEARBY SCHOOLS</p><h3>가까운 ${school.level} 수학과외</h3><div class="nearby-links">${nearby}</div></article></div></section>
    ${ctaSection(`${short} 수학과외 상담`)}
  </main>`;
  const schoolEntity = { "@context": "https://schema.org", "@type": isHigh ? "HighSchool" : "MiddleSchool", name: school.name, address: { "@type": "PostalAddress", streetAddress: school.address.replace(/^세종특별자치시 /, ""), addressLocality: school.area, addressRegion: "세종특별자치시", addressCountry: "KR" }, geo: { "@type": "GeoCoordinates", latitude: school.lat, longitude: school.lng } };
  const schema = [faqSchema(faqs), breadcrumbSchema([["세종 수학과외", `${siteUrl}/`], ["세종 학교별 수학과외", pageUrl("schools")], [`${school.name} 수학과외`, canonical]]), schoolEntity];
  return { title, description, url: canonical, html: layout({ title, description, canonical, body, schema }) };
}

function schoolIndexPage() {
  const title = "세종 학교별 수학과외 | 중학교·고등학교 수학내신 1:1 맞춤 수업";
  const description = `세종 중학교 ${schoolsOf("중학교").length}곳, 고등학교 ${schoolsOf("고등학교").length}곳 학교별 수학과외 안내. 학교 교과서·시험 범위에 맞춘 수학내신 대비. 전화 상담 ${phone}`;
  const canonical = pageUrl("schools");
  const groups = pageSchoolTypes.map(type => {
    const level = levels.find(item => schoolTypes[item.slug] === type);
    const areas = [...new Set(schoolsOf(type).map(school => school.area))];
    return `<section class="school-section"><div class="wrap"><div class="section-heading"><div><p class="kicker">${level.en}</p><h2>세종 ${type}별<br>수학과외</h2></div><p>세종 ${type} ${schoolsOf(type).length}곳의 학교별 수학 내신 대비 안내입니다. 학교 이름을 선택하세요.</p></div><div class="school-directory">${areas.map(area => `<div><strong>${area}</strong><p>${schoolsOf(type).filter(school => school.area === area).map(school => `<a href="${schoolPath(school)}">${school.name}</a>`).join(", ")}</p></div>`).join("")}</div><p class="school-source">${schoolSource}</p></div></section>`;
  }).join("");
  const body = `<main id="main" class="local-page">
    <section class="local-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="현재 위치"><a href="/">세종</a><span>/</span><strong>학교별 수학과외</strong></nav><p class="eyebrow">SEJONG SCHOOLS</p><h1>세종 학교별<br>수학과외</h1><p>같은 학년이어도 학교마다 교과서, 부교재, 시험 범위가 다릅니다. 다니는 학교에 맞춘 수학 내신 대비 안내를 확인하세요.</p></div></section>
    ${groups}
    ${ctaSection("학교별 수학과외 상담")}
  </main>`;
  return { title, description, url: canonical, html: layout({ title, description, canonical, body, schema: [breadcrumbSchema([["세종 수학과외", `${siteUrl}/`], ["세종 학교별 수학과외", canonical]])] }) };
}

const gradeGuides = [
  { name: "초1", level: "elementary", full: "초등학교 1학년", focus: "수 감각과 덧셈·뺄셈",
    core: "초1 수학은 숫자를 세는 것에서 시작해 수를 묶고 나누는 감각을 만드는 시기입니다. 이때 만든 10의 묶음 감각이 이후 모든 연산의 바탕이 됩니다.",
    units: [["100까지의 수", "수 세기, 10씩 묶어 세기", "10 묶음과 낱개를 섞어 세기"], ["덧셈과 뺄셈", "가르기와 모으기, 받아올림 없는 계산", "10을 만드는 수 조합"], ["여러 가지 모양", "평면·입체 모양 분류", "분류 기준을 말로 설명하기"], ["비교하기와 시각", "길이·무게·넓이 비교, 시각 읽기", "몇 시 30분 읽기"]],
    tips: ["바둑돌, 수 모형처럼 손으로 만질 수 있는 도구로 수를 묶어 봅니다.", "덧셈·뺄셈은 빠르기보다 10 만들기 방법을 말로 설명하게 합니다.", "생활 속 물건 개수 세기와 시계 읽기를 자주 연습합니다.", "하루 10~15분, 짧고 꾸준한 공부 습관을 만듭니다."],
    next: "초2에서는 받아올림·받아내림과 곱셈구구가 시작됩니다. 10 만들기와 가르기·모으기가 익숙해야 계산 실수가 줄어듭니다.",
    advance: "초1은 선행보다 현재 학년 개념을 손과 말로 충분히 익히는 것이 더 중요합니다. 수 감각이 탄탄하다면 초2 덧셈·뺄셈 앞부분을 가볍게 경험하는 정도가 적당합니다." },
  { name: "초2", level: "elementary", full: "초등학교 2학년", focus: "받아올림·받아내림과 곱셈구구",
    core: "초2 수학은 세 자리 수와 받아올림·받아내림 계산, 곱셈구구를 배우며 계산의 기본기가 결정되는 시기입니다.",
    units: [["세 자리 수와 네 자리 수", "자릿값과 수의 크기 비교", "0이 들어 있는 자리 읽고 쓰기"], ["덧셈과 뺄셈", "받아올림·받아내림 있는 계산", "받아내림 후 앞자리 숫자 줄이기"], ["곱셈과 곱셈구구", "묶어 세기, 몇의 몇 배, 구구단", "외우기만 하고 곱셈의 뜻 놓치기"], ["길이 재기와 시간", "cm와 m, 시각과 시간", "단위 바꾸기와 시간 계산"], ["분류하기와 표·그래프", "기준에 따라 분류하고 표로 정리", "그래프에서 필요한 정보 찾기"]],
    tips: ["세로셈을 할 때 자릿값을 맞춰 쓰는 습관을 들입니다.", "구구단은 외우기 전에 묶어 세기 그림으로 뜻을 먼저 이해합니다.", "틀린 계산은 다시 풀며 어느 자리에서 틀렸는지 표시합니다.", "길이와 시간은 실제로 재고 확인하는 활동으로 익힙니다."],
    next: "초3에서는 나눗셈과 분수가 처음 등장합니다. 곱셈구구가 정확해야 나눗셈의 뜻과 계산을 무리 없이 받아들일 수 있습니다.",
    advance: "곱셈구구와 받아내림 계산이 정확하다면 초3 곱셈·나눗셈의 기초를 미리 경험해도 좋습니다. 계산 실수가 잦다면 복습이 우선입니다." },
  { name: "초3", level: "elementary", full: "초등학교 3학년", focus: "나눗셈과 분수·소수의 시작",
    core: "초3 수학은 나눗셈과 분수·소수를 처음 배우며 수의 개념이 넓어지는 시기입니다. 많은 학생이 이 시기에 처음으로 수학이 어렵다고 느낍니다.",
    units: [["덧셈·뺄셈과 곱셈", "세 자리 수 계산, 두 자리 수 곱셈", "곱셈 세로셈의 자리 맞추기"], ["나눗셈", "똑같이 나누기, 나머지가 있는 나눗셈", "나눗셈과 곱셈의 관계 이해"], ["분수와 소수", "단위분수, 분수의 크기 비교, 소수 첫째 자리", "전체와 부분의 관계 파악"], ["평면도형과 원", "직각, 직사각형과 정사각형, 원의 반지름·지름", "도형의 성질을 정확한 말로 설명하기"], ["길이·시간, 들이·무게", "mm와 km, 초 단위, L와 mL, kg과 g", "단위가 섞인 계산"]],
    tips: ["분수는 피자, 색종이처럼 그림으로 먼저 이해합니다.", "나눗셈은 곱셈구구로 확인하는 습관을 들입니다.", "문장제는 구하는 것에 밑줄을 긋고 식으로 바꾸는 연습을 합니다.", "단위가 바뀌는 문제는 단위를 꼭 함께 씁니다."],
    next: "초4에서는 분수의 덧셈·뺄셈과 큰 수, 각도를 배웁니다. 분수의 뜻을 그림으로 설명할 수 있어야 분수 계산으로 넘어갈 수 있습니다.",
    advance: "분수의 뜻과 나눗셈이 탄탄하다면 초4 1학기 범위를 한 번 살펴봐도 좋습니다. 문장제 해석이 약하다면 선행보다 독해형 문제 연습이 먼저입니다." },
  { name: "초4", level: "elementary", full: "초등학교 4학년", focus: "큰 수, 분수 계산, 도형",
    core: "초4 수학은 큰 수와 분수·소수의 계산, 각도와 여러 도형을 다루며 고학년 수학의 기초를 만드는 시기입니다.",
    units: [["큰 수", "만, 억, 조와 자릿값", "큰 수 읽기와 크기 비교"], ["곱셈과 나눗셈", "세 자리 수 × 두 자리 수, 두 자리 수로 나누기", "몫의 자리 정하기"], ["분수와 소수의 덧셈·뺄셈", "분모가 같은 분수 계산, 소수 두 자리 계산", "대분수와 가분수 바꾸기"], ["각도와 도형", "각도 재기, 삼각형·사각형·다각형 분류", "도형 이름과 성질 구분"], ["규칙 찾기와 그래프", "수 배열 규칙, 막대·꺾은선그래프", "규칙을 식으로 나타내기"]],
    tips: ["나눗셈은 어림하기로 몫을 먼저 예상하는 연습을 합니다.", "도형은 직접 그리고 접어 보며 성질을 확인합니다.", "분수 계산 전에 대분수·가분수 바꾸기를 충분히 연습합니다.", "오답 노트에 틀린 이유를 한 줄로 적습니다."],
    next: "초5에서는 약수와 배수, 약분·통분, 분수의 곱셈을 배웁니다. 초4 분수 개념과 나눗셈이 정확해야 초5 분수 계산이 쉬워집니다.",
    advance: "초4 겨울방학은 초5 약수·배수와 분수 단원을 미리 준비하기 좋은 시기입니다. 나눗셈이 느리거나 부정확하다면 그 부분부터 보완합니다." },
  { name: "초5", level: "elementary", full: "초등학교 5학년", focus: "약수·배수와 분수 계산",
    core: "초5 수학은 약수와 배수, 약분과 통분, 분수의 곱셈처럼 중학 수학으로 바로 이어지는 단원이 많아 가장 중요한 학년 중 하나입니다.",
    units: [["자연수의 혼합 계산", "괄호와 계산 순서", "곱셈·나눗셈을 먼저 하는 순서"], ["약수와 배수", "최대공약수와 최소공배수", "두 개념을 문장제에서 구분하기"], ["약분과 통분", "크기가 같은 분수, 분모가 다른 분수 계산", "통분 과정의 계산 실수"], ["분수와 소수의 곱셈", "분수 × 분수, 소수 × 소수", "소수점 위치 정하기"], ["도형과 측정", "다각형의 넓이, 합동과 대칭, 직육면체", "넓이 공식의 이유 이해"], ["평균과 가능성", "평균 구하기, 일이 일어날 가능성", "평균을 이용한 역계산"]],
    tips: ["약수·배수는 문제 상황이 '나누기'인지 '모으기'인지 먼저 판단합니다.", "분수 계산은 약분 시점을 정해 실수를 줄입니다.", "넓이 공식은 외우기 전에 도형을 잘라 붙여 이유를 확인합니다.", "주 1회 누적 복습으로 앞 단원을 잊지 않게 합니다."],
    next: "초6에서는 분수·소수의 나눗셈과 비와 비율을 배우고, 이어서 중1 소인수분해와 정수·유리수로 연결됩니다.",
    advance: "초5 과정이 탄탄하다면 초6 분수의 나눗셈과 비율을 미리 학습해도 좋습니다. 약분·통분 실수가 많다면 연산 정확도를 먼저 높입니다." },
  { name: "초6", level: "elementary", full: "초등학교 6학년", focus: "비와 비율, 예비중1 준비",
    core: "초6 수학은 분수·소수의 나눗셈, 비와 비율, 입체도형을 마무리하며 중학교 수학으로 넘어가는 다리 역할을 합니다.",
    units: [["분수와 소수의 나눗셈", "분수 ÷ 분수, 소수 ÷ 소수", "나누는 수를 뒤집는 이유 이해"], ["비와 비율", "비율, 백분율, 비례식과 비례배분", "비율을 식으로 세우기"], ["입체도형", "각기둥과 각뿔, 원기둥·원뿔·구", "전개도 상상하기"], ["원의 넓이와 부피", "원주율, 원의 넓이, 직육면체의 부피와 겉넓이", "공식에 넣을 값 찾기"], ["여러 가지 그래프", "띠그래프와 원그래프", "비율과 그래프 연결하기"]],
    tips: ["비와 비율은 생활 속 할인, 농도 문제로 연결해 이해합니다.", "분수 나눗셈은 계산 규칙과 함께 그림으로 의미를 확인합니다.", "입체도형은 실제 모형이나 전개도를 만들어 봅니다.", "2학기부터는 중1 수학 준비를 조금씩 병행합니다."],
    next: "중1에서는 소인수분해, 정수와 유리수, 문자와 식이 시작됩니다. 초6 분수·비율이 흔들리면 중1 계산에서 실수가 많아집니다.",
    advance: "초6 겨울방학에는 초등 연산 점검 후 중1 1학기 과정을 정리하는 것이 일반적입니다. 자세한 순서는 예비중1 가이드를 참고하세요." },
  { name: "중1", level: "middle", full: "중학교 1학년", focus: "정수·유리수와 일차방정식",
    core: "중1 수학은 음수와 문자를 처음 다루며 수학의 언어가 바뀌는 시기입니다. 계산 규칙을 이해하지 못하고 외우기만 하면 중2 이후에 큰 공백이 생깁니다.",
    units: [["소인수분해", "소수와 합성수, 최대공약수·최소공배수", "거듭제곱 표현"], ["정수와 유리수", "음수의 사칙연산", "부호 실수와 괄호 계산"], ["문자와 식", "식의 값, 일차식의 계산", "분배법칙 적용"], ["일차방정식", "등식의 성질, 방정식 활용", "문장제를 식으로 세우기"], ["좌표평면과 그래프", "순서쌍, 정비례와 반비례", "그래프 해석"], ["도형과 자료", "기본 도형, 작도, 평면·입체도형, 자료의 정리와 해석", "도형 용어와 성질 구분"]],
    tips: ["음수 계산 규칙은 수직선으로 이유를 확인합니다.", "방정식 활용은 미지수를 무엇으로 정할지 먼저 씁니다.", "서술형 대비를 위해 풀이 과정을 생략하지 않고 씁니다.", "시험 범위의 교과서와 학교 프린트를 빠짐없이 풉니다."],
    next: "중2에서는 연립방정식과 일차함수, 도형의 증명을 배웁니다. 중1 일차방정식과 좌표평면이 정확해야 중2 진도가 수월합니다.",
    advance: "중1 과정이 안정적이라면 중2 1학기 식의 계산과 연립방정식까지 선행하는 학생이 많습니다. 음수 계산과 방정식 활용이 약하다면 복습이 먼저입니다." },
  { name: "중2", level: "middle", full: "중학교 2학년", focus: "연립방정식·일차함수와 도형 증명",
    core: "중2 수학은 연립방정식, 일차함수, 도형의 증명과 확률까지 다루며 중학교 수학 중 내용이 가장 많고 서술형 비중이 커지는 시기입니다.",
    units: [["유리수와 순환소수", "순환소수를 분수로 나타내기", "순환마디 처리"], ["식의 계산", "지수법칙, 다항식의 계산", "지수법칙 혼동"], ["부등식과 연립방정식", "일차부등식, 연립일차방정식과 활용", "부등호 방향 바꾸기, 활용 식 세우기"], ["일차함수", "기울기와 절편, 그래프, 일차방정식과의 관계", "그래프와 식을 오가는 해석"], ["도형의 성질과 닮음", "삼각형·사각형의 성질, 닮음, 피타고라스 정리", "증명 서술의 논리 순서"], ["확률", "경우의 수와 확률", "중복해서 세거나 빠뜨리기"]],
    tips: ["일차함수는 표, 식, 그래프를 서로 바꿔 보는 연습을 합니다.", "도형 증명은 가정과 결론을 먼저 쓰고 근거를 하나씩 붙입니다.", "연립방정식 활용은 단위와 조건을 식 옆에 적어 둡니다.", "시험 2주 전부터는 서술형 답안을 직접 써 보고 점검합니다."],
    next: "중3에서는 제곱근, 인수분해, 이차방정식과 이차함수를 배웁니다. 중2 식의 계산과 일차함수가 그 바탕이 됩니다.",
    advance: "중2 겨울방학은 중3 과정과 고등 공통수학을 준비하기 시작하는 학생이 많은 시기입니다. 일차함수와 도형 증명이 약하다면 먼저 보완합니다." },
  { name: "중3", level: "middle", full: "중학교 3학년", focus: "인수분해·이차함수와 고등 준비",
    core: "중3 수학은 제곱근과 실수, 인수분해, 이차방정식과 이차함수를 다루며 고등 수학의 직접적인 바탕이 되는 학년입니다.",
    units: [["제곱근과 실수", "제곱근의 성질, 무리수, 근호 계산", "분모의 유리화"], ["다항식의 곱셈과 인수분해", "곱셈 공식, 인수분해 공식", "공식 선택과 공통인수 놓치기"], ["이차방정식", "인수분해와 근의 공식, 활용", "활용 문제의 조건 확인"], ["이차함수", "그래프의 꼭짓점과 축, 평행이동", "식에서 그래프 특징 읽기"], ["삼각비와 원의 성질", "삼각비, 원과 직선, 원주각", "도형 속 숨은 직각삼각형 찾기"], ["통계", "대푯값과 산포도, 상관관계", "분산과 표준편차 계산"]],
    tips: ["인수분해는 공식 암기보다 전개와 인수분해를 오가며 연습합니다.", "이차함수는 꼭짓점 형태로 바꾸는 과정을 손에 익힙니다.", "학교 시험 범위가 끝나면 고등 공통수학과 연결되는 단원을 다시 점검합니다.", "고입 이후 일정까지 고려해 겨울방학 계획을 미리 세웁니다."],
    next: "고1에서는 공통수학1·2를 배웁니다. 인수분해, 이차방정식, 이차함수는 고1 수학 전반에 계속 쓰입니다.",
    advance: "중3 2학기부터 공통수학1 선행을 시작하는 학생이 많습니다. 자세한 순서는 예비고1 가이드를 참고하세요." },
  { name: "고1", level: "high", full: "고등학교 1학년", focus: "공통수학1·2와 첫 내신",
    core: "고1 수학은 공통수학1·2를 배우며 고등학교 첫 내신 등급이 결정되는 시기입니다. 중학교보다 내용이 많고 문제가 길어져 공부 방법을 바꿔야 합니다.",
    units: [["다항식", "다항식의 연산, 나머지정리, 인수분해", "조립제법과 나머지정리 활용"], ["방정식과 부등식", "복소수, 이차방정식과 이차함수, 여러 가지 방정식·부등식", "판별식과 근과 계수의 관계"], ["경우의 수와 행렬", "순열과 조합, 행렬의 연산", "순열과 조합 구분"], ["도형의 방정식", "점과 직선, 원의 방정식, 도형의 이동", "좌표 계산의 복잡도"], ["집합과 명제", "집합의 연산, 명제와 증명", "필요조건·충분조건"], ["함수와 그래프", "합성함수, 역함수, 유리함수·무리함수", "그래프 개형 그리기"]],
    tips: ["개념서 정리 후 학교 교과서와 부교재를 반드시 풉니다.", "시험 4주 전부터 학교 기출 경향에 맞춰 고난도 문항을 연습합니다.", "학력평가는 성적보다 틀린 문항의 원인 분석에 활용합니다.", "고2 선택 과목을 고려해 겨울방학 학습 계획을 세웁니다."],
    next: "고2에서는 대수, 미적분Ⅰ, 확률과 통계 등을 배웁니다. 고1 함수와 방정식이 고2 수학 전체의 바탕이 됩니다.",
    advance: "고1 과정이 안정적이라면 겨울방학에 고2 대수와 미적분Ⅰ을 준비합니다. 학교마다 고2 과목 편성이 다르므로 학교 교육과정을 확인하는 것이 좋습니다." },
  { name: "고2", level: "high", full: "고등학교 2학년", focus: "대수·미적분Ⅰ·확률과 통계",
    core: "고2 수학은 학교 선택 과목에 따라 대수, 미적분Ⅰ, 확률과 통계 등을 배우며 내신과 수능 준비가 본격적으로 겹치는 시기입니다.",
    units: [["대수", "지수와 로그, 삼각함수, 수열", "로그 성질과 삼각함수 그래프"], ["미적분Ⅰ", "함수의 극한과 연속, 미분, 적분", "극한 개념과 미분 활용"], ["확률과 통계", "경우의 수, 확률, 통계적 추정", "조건부확률과 분포 해석"]],
    tips: ["학교 선택 과목과 시험 범위를 학기 초에 정확히 확인합니다.", "내신 기간이 끝나면 같은 단원의 모의고사 문항으로 연결합니다.", "개념 정의를 말로 설명할 수 있을 때 다음 유형으로 넘어갑니다.", "고3 수능 과목 선택을 염두에 두고 학습 비중을 정합니다."],
    next: "고3에서는 수능 대비가 중심이 됩니다. 고2 과정의 개념 빈틈이 수능 고난도 문항에서 그대로 드러납니다.",
    advance: "고2 겨울방학은 수능 범위 전체를 한 번 정리하는 마지막 긴 방학입니다. 취약 단원 보완과 기출 분석을 함께 시작합니다." },
  { name: "고3", level: "high", full: "고등학교 3학년", focus: "수능 수학과 마지막 내신",
    core: "고3 수학은 수능 수학과 마지막 학기 내신을 함께 관리해야 하는 시기입니다. 새로운 문제를 많이 푸는 것보다 아는 문제를 시간 안에 정확히 푸는 것이 점수를 결정합니다.",
    units: [["수능 공통 과목", "학년도별 수능 출제 범위의 공통 과목", "시간 압박 속 계산 실수"], ["수능 선택 과목", "학생이 응시하는 선택 과목", "선택 과목 고난도 문항 시간 배분"], ["학교 내신", "3학년 학교 수학 과목", "수능 공부와 내신 일정 조율"], ["실전 모의고사", "6월·9월 모의평가와 실전 연습", "문항 순서와 시간 전략"]],
    tips: ["출제 범위와 선택 과목은 해당 학년도 수능 시행 기본계획으로 확인합니다.", "기출은 정답보다 출제 의도와 풀이 흐름을 분석합니다.", "주 1회 이상 실제 시험 시간에 맞춘 실전 연습을 합니다.", "오답은 개념, 해석, 계산, 시간 부족으로 나누어 관리합니다."],
    next: "고3은 수능 이후까지 고려해야 하는 학년입니다. 수시 일정과 내신 반영 학기를 함께 확인하며 학습 비중을 조정합니다.",
    advance: "고3은 선행보다 수능 범위 전체의 완성도가 중요합니다. 취약 단원을 먼저 보완하고 실전 연습 비중을 점차 늘립니다." }
];

const gradePath = name => `/grades/${name}/`;
const gradeUrl = name => `${siteUrl}/grades/${encodeURIComponent(name)}/`;
const gradeGuideByName = name => gradeGuides.find(grade => grade.name === name);
const gradeMore = name => gradeGuideByName(name) ? `<a class="grade-more" href="${gradePath(name)}">${name} 수학 단원 보기 →</a>` : "";

function gradePage(grade, index) {
  const level = levels.find(item => item.slug === grade.level);
  const prev = gradeGuides[index - 1];
  const next = gradeGuides[index + 1];
  const canonical = gradeUrl(grade.name);
  const title = `세종 ${grade.name} 수학과외 | ${grade.focus} 1:1 맞춤 수업`;
  const description = `세종 ${grade.name} 수학과외. ${grade.full} 수학 주요 단원과 자주 막히는 부분, 공부법, 선행 기준까지 정리했습니다. ${grade.units.slice(0, 3).map(unit => unit[0]).join("·")} 1:1 맞춤 수업, 전화 상담 ${phone}`;
  const faqs = [
    [`세종 ${grade.name} 수학, 가장 많이 막히는 부분은 무엇인가요?`, `${grade.units[0][0]}에서는 '${grade.units[0][2]}', ${grade.units[1][0]}에서는 '${grade.units[1][2]}'에서 어려움을 겪는 학생이 많습니다. 수업에서는 이 부분을 먼저 점검합니다.`],
    [`${grade.name} 수학 선행은 어디까지 하면 좋을까요?`, grade.advance],
    [`세종 ${grade.name} 수학과외는 어떻게 진행되나요?`, `최근 시험지와 사용 중인 교재로 현재 실력을 진단한 뒤 ${grade.name} 학교 진도와 이전 학년 복습을 함께 설계합니다. 수업 시간과 방식은 전화 상담에서 안내합니다.`]
  ];
  const schoolType = schoolTypes[grade.level];
  const schoolLinks = hasSchoolPage({ level: schoolType })
    ? `<article><p class="kicker">SCHOOLS</p><h3>세종 ${schoolType}별 ${grade.name} 수학</h3><div class="nearby-links">${schoolsOf(schoolType).slice(index * 2 % schoolsOf(schoolType).length).concat(schoolsOf(schoolType)).slice(0, 8).map(school => `<a href="${schoolPath(school)}">${shortSchool(school.name)} ${grade.name} 수학<span>→</span></a>`).join("")}</div></article>`
    : `<article><p class="kicker">LOCAL CLASS</p><h3>세종 지역별 ${level.label} 수학과외</h3><div class="nearby-links">${regions.slice(index * 3 % regions.length).concat(regions).slice(0, 8).map(region => `<a href="${regionPath(region, level)}">${region.name} ${grade.name} 수학<span>→</span></a>`).join("")}</div></article>`;
  const related = `<a href="/${level.slug}/">세종 ${level.label} 수학과외<span>→</span></a>${prev ? `<a href="${gradePath(prev.name)}">세종 ${prev.name} 수학과외<span>→</span></a>` : ""}${next ? `<a href="${gradePath(next.name)}">세종 ${next.name} 수학과외<span>→</span></a>` : ""}<a href="/grades/">세종 학년별 수학 전체<span>→</span></a>${grade.name === "초6" ? `<a href="/guide/pre-middle1/">세종 예비중1 수학 가이드<span>→</span></a>` : ""}${grade.name === "중3" ? `<a href="/guide/pre-high1/">세종 예비고1 수학 가이드<span>→</span></a>` : ""}${grade.level !== "elementary" ? `<a href="/guide/school-exam/">세종 중·고등 수학 내신 가이드<span>→</span></a>` : ""}`;
  const body = `<main id="main" class="local-page">
    <section class="local-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="현재 위치"><a href="/">세종</a><span>/</span><a href="/grades/">학년별</a><span>/</span><strong>${grade.name}</strong></nav><p class="eyebrow">${level.en} · ${grade.full}</p><h1>세종 ${grade.name}<br>수학과외</h1><p>${grade.core}</p></div></section>
    <section class="article-section"><div class="wrap"><div class="section-heading"><div><p class="kicker">KEY UNITS</p><h2>${grade.name} 수학<br>주요 단원과 막히는 지점</h2></div><p>${grade.name} 수학의 핵심은 ${grade.focus}입니다. 단원마다 학생들이 자주 막히는 지점을 먼저 확인합니다.</p></div><div class="article-body school-plan"><div class="table-wrap"><table><thead><tr><th>단원</th><th>핵심 개념</th><th>자주 막히는 지점</th></tr></thead><tbody>${grade.units.map(([unit, concept, stuck]) => `<tr><th>${unit}</th><td>${concept}</td><td>${stuck}</td></tr>`).join("")}</tbody></table></div><p class="article-note">교육과정 적용 시기와 교과서에 따라 단원 이름과 순서가 다를 수 있습니다. 정확한 범위는 학교 교과서와 시험 범위 공지를 확인해 주세요.</p></div></div></section>
    <section class="local-intro"><div class="wrap section-heading"><div><p class="kicker">HOW TO STUDY</p><h2>${grade.name} 수학<br>이렇게 공부합니다</h2></div><div><ul class="school-focus">${grade.tips.map(tip => `<li>${tip}</li>`).join("")}</ul><p>${grade.next}</p></div></div></section>
    ${faqSection(faqs, `세종 ${grade.name} 수학과외<br>자주 묻는 질문`)}
    <section class="local-details"><div class="wrap detail-grid"><article><p class="kicker">RELATED</p><h2>함께 보면 좋은<br>${grade.name} 수학 정보</h2><div class="nearby-links">${related}</div></article>${schoolLinks}</div></section>
    ${ctaSection(`세종 ${grade.name} 수학과외 상담`)}
  </main>`;
  const schema = [faqSchema(faqs), breadcrumbSchema([["세종 수학과외", `${siteUrl}/`], ["세종 학년별 수학과외", pageUrl("grades")], [`세종 ${grade.name} 수학과외`, canonical]])];
  return { title, description, url: canonical, html: layout({ title, description, canonical, body, schema }) };
}

function gradeIndexPage() {
  const title = "세종 학년별 수학과외 | 초1~고3 주요 단원과 공부법";
  const description = `세종 초1부터 고3까지 학년별 수학 주요 단원, 자주 막히는 부분, 공부법과 선행 기준을 정리했습니다. 1:1 수학과외 상담 ${phone}`;
  const canonical = pageUrl("grades");
  const groups = levels.map(level => `<div class="grade-group"><h2>${level.label}</h2><div class="level-grid">${gradeGuides.filter(grade => grade.level === level.slug).map(grade => `<a class="level-card" href="${gradePath(grade.name)}"><span>${level.en}</span><h3>세종 ${grade.name} 수학과외</h3><p>${grade.focus}. ${grade.units.slice(0, 3).map(unit => unit[0]).join(", ")}</p><b>단원과 공부법 보기 <i aria-hidden="true">→</i></b></a>`).join("")}</div></div>`).join("");
  const body = `<main id="main" class="local-page">
    <section class="local-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="현재 위치"><a href="/">세종</a><span>/</span><strong>학년별 수학과외</strong></nav><p class="eyebrow">GRADE BY GRADE</p><h1>세종 학년별<br>수학과외</h1><p>학년마다 꼭 잡아야 할 단원과 자주 막히는 지점이 다릅니다. 초1부터 고3까지 학년별 수학 핵심을 정리했습니다.</p></div></section>
    <section class="level-section"><div class="wrap">${groups}</div></section>
    ${ctaSection("세종 학년별 수학 상담")}
  </main>`;
  return { title, description, url: canonical, html: layout({ title, description, canonical, body, schema: [breadcrumbSchema([["세종 수학과외", `${siteUrl}/`], ["세종 학년별 수학과외", canonical]])] }) };
}

const processSteps = [
  ["전화 상담", "학생 학년, 거주 지역, 최근 성적, 목표와 고민을 듣고 수업이 필요한 이유를 함께 정리합니다."],
  ["학습 진단", "최근 시험지와 사용 중인 교재를 보고 개념 이해, 풀이 순서, 계산 습관 중 어디에서 점수를 잃는지 구분합니다."],
  ["학습 계획", "학교 시험 일정, 목표 성적, 가능한 공부 시간을 반영해 현재 학년 진도와 복습·선행 비중을 정합니다."],
  ["1:1 수업", "개념 설명, 대표 문제, 변형 문제 순서로 진행하고 학생이 풀이 이유를 자신의 말로 설명할 때까지 확인합니다."],
  ["점검과 조정", "반복되는 실수와 오답 원인을 기록하고, 시험 결과를 다음 학습 계획에 바로 반영합니다."]
];
const processFaqs = [
  ["상담만 받아도 되나요?", "네. 전화 상담에서 학생의 현재 상황을 듣고 필요한 수업 방향을 먼저 안내합니다. 수업 여부는 상담 후에 결정하시면 됩니다."],
  ["수업료는 어떻게 정해지나요?", "학년, 주당 수업 횟수, 1회 수업 시간에 따라 달라지며 전화 상담에서 학생 상황을 확인한 뒤 자세히 안내합니다."],
  ["수업 장소와 시간은 어떻게 정하나요?", "세종 26개 읍·면·동 중 학생의 세부 위치와 학교·학원 일정을 확인한 뒤 가능한 시간과 수업 방식을 안내합니다."],
  ["수업 중 학습 상황은 어떻게 알 수 있나요?", "상담 때 학생과 학부모님이 원하시는 확인 방법을 정하고, 시험 전후에는 학습 계획과 결과를 함께 점검합니다."]
];
function processPage() {
  const title = "세종 수학과외 수업 진행 과정 | 상담·진단·계획·1:1 수업";
  const description = `세종 수학과외의 상담부터 학습 진단, 계획, 1:1 수업, 점검까지 수업 진행 과정과 수업료·장소 안내. 전화 상담 ${phone}`;
  const canonical = pageUrl("process");
  const body = `<main id="main" class="local-page">
    <section class="local-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="현재 위치"><a href="/">세종</a><span>/</span><strong>수업 진행 과정</strong></nav><p class="eyebrow">HOW IT WORKS</p><h1>수업 진행<br>과정</h1><p>전화 상담부터 첫 수업, 시험 후 점검까지 어떤 순서로 진행되는지 안내합니다.</p></div></section>
    <section class="topic-section"><div class="wrap"><div class="section-heading"><div><p class="kicker">5 STEPS</p><h2>상담에서 수업까지<br>다섯 단계</h2></div><p>같은 학년이어도 출발점은 다릅니다. 진단과 계획을 먼저 세운 뒤 수업을 시작합니다.</p></div><div class="topic-grid">${processSteps.map(([step, text], index) => `<article><b>STEP ${index + 1}</b><h3>${step}</h3><p>${text}</p></article>`).join("")}</div></div></section>
    ${faqSection(processFaqs, "수업 진행<br>자주 묻는 질문")}
    <section class="local-details"><div class="wrap detail-grid"><article><p class="kicker">BY LEVEL</p><h2>학교급별<br>수업 안내</h2><div class="nearby-links">${levels.map(level => `<a href="/${level.slug}/">세종 ${level.label} 수학과외<span>→</span></a>`).join("")}<a href="/grades/">세종 학년별 수학과외<span>→</span></a><a href="/schools/">세종 학교별 수학과외<span>→</span></a></div></article><article><p class="kicker">STUDY GUIDE</p><h3>학습 가이드</h3><div class="nearby-links">${guides.map(guide => `<a href="${guidePath(guide)}">세종 ${guide.label}<span>→</span></a>`).join("")}</div></article></div></section>
    ${ctaSection("세종 수학과외 상담")}
  </main>`;
  return { title, description, url: canonical, html: layout({ title, description, canonical, body, schema: [faqSchema(processFaqs), breadcrumbSchema([["세종 수학과외", `${siteUrl}/`], ["수업 진행 과정", canonical]])] }) };
}

const lastmodPath = path.join(root, "src", "data", "lastmod.json");
const lastmodStore = JSON.parse(await readFile(lastmodPath, "utf8").catch(() => "{}"));
const today = new Date().toISOString().slice(0, 10);
function stampLastmod(url, html) {
  const hash = createHash("sha1").update(html).digest("hex").slice(0, 12);
  if (lastmodStore[url]?.hash !== hash) lastmodStore[url] = { hash, date: today };
  return lastmodStore[url].date;
}

const pages = [];
const addPage = async (relativeDir, html, meta) => {
  const directory = path.join(dist, ...relativeDir);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), html);
  pages.push({ ...meta, lastmod: stampLastmod(meta.url, html) });
};

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "assets"), { recursive: true });
await writeFile(path.join(dist, "assets", "style.css"), await readFile(path.join(root, "src", "style.css"), "utf8"));
for (const icon of ["favicon.ico", "apple-touch-icon.png", "icon-512.png"]) await copyFile(path.join(root, "src", "icons", icon), path.join(dist, icon));
await mkdir(path.join(dist, "images"), { recursive: true });
for (const image of ["hero.webp", "study.webp"]) await copyFile(path.join(root, "src", "images", image), path.join(dist, "images", image));
await copyFile(path.join(root, "src", "images", "og.png"), path.join(dist, "og.png"));
await addPage([], homePage(), { title: "세종 수학과외 | 초등·중등·고등 1:1 수학수업", description: "세종특별자치시 26개 읍·면·동 초중고 1:1 수학과외", url: `${siteUrl}/`, priority: "1.0" });
const processInfo = processPage();
await addPage(["process"], processInfo.html, { ...processInfo, priority: "0.8" });
for (const level of levels) {
  const page = levelPage(level, null);
  await addPage([level.slug], page.html, { ...page, priority: "0.9" });
}
const guideIndex = guideIndexPage();
await addPage(["guide"], guideIndex.html, { ...guideIndex, priority: "0.8" });
for (const guide of guides) {
  const page = guidePage(guide);
  await addPage(["guide", guide.slug], page.html, { ...page, priority: "0.8" });
}
const schoolIndex = schoolIndexPage();
await addPage(["schools"], schoolIndex.html, { ...schoolIndex, priority: "0.8" });
for (const [index, school] of schoolPages.entries()) {
  const page = schoolPage(school, index);
  await addPage(["schools", school.name], page.html, { ...page, priority: "0.7" });
}
const gradeIndex = gradeIndexPage();
await addPage(["grades"], gradeIndex.html, { ...gradeIndex, priority: "0.8" });
for (const [index, grade] of gradeGuides.entries()) {
  const page = gradePage(grade, index);
  await addPage(["grades", grade.name], page.html, { ...page, priority: "0.7" });
}
for (const [index, region] of regions.entries()) {
  await addPage(["areas", region.slug], regionPage(region, index), { title: `세종 ${region.name} 수학과외`, description: `세종 ${region.name} 초중고 1:1 수학과외`, url: pageUrl("areas", region.slug), priority: "0.8" });
  for (const level of levels) {
    const page = levelPage(level, region, index);
    await addPage(["areas", region.slug, level.slug], page.html, { ...page, priority: "0.7" });
  }
}
await writeFile(lastmodPath, `${JSON.stringify(Object.fromEntries(Object.entries(lastmodStore).filter(([url]) => pages.some(page => page.url === url)).sort()), null, 1)}\n`);
const feedItems = [...pages].sort((a, b) => b.lastmod.localeCompare(a.lastmod) || Number(b.priority) - Number(a.priority));
await writeFile(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(page => `\n  <url><loc>${page.url}</loc><lastmod>${page.lastmod}</lastmod><changefreq>weekly</changefreq><priority>${page.priority}</priority></url>`).join("")}\n</urlset>\n`);
await writeFile(path.join(dist, "rss.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>세종 수학과외</title><link>${siteUrl}/</link><description>세종특별자치시 초등·중등·고등 1:1 수학과외</description><language>ko</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${feedItems.map(page => `\n  <item><title>${page.title}</title><link>${page.url}</link><guid isPermaLink="true">${page.url}</guid><description>${page.description}</description><pubDate>${new Date(`${page.lastmod}T09:00:00+09:00`).toUTCString()}</pubDate></item>`).join("")}\n</channel></rss>\n`);
await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
await writeFile(path.join(dist, "CNAME"), "tutorpro.kr\n");
await writeFile(path.join(dist, ".nojekyll"), "");
await writeFile(path.join(dist, "404.html"), layout({ title: "페이지를 찾을 수 없습니다 | 세종 수학과외", description: "요청하신 페이지를 찾을 수 없습니다.", canonical: `${siteUrl}/404.html`, robots: "noindex, follow", body: `<main class="not-found"><div><p class="kicker">404 ERROR</p><h1>페이지를 찾을 수 없습니다</h1><p>주소가 변경되었거나 존재하지 않는 페이지입니다.</p><a class="button button-primary" href="/">홈으로 돌아가기</a></div></main>` }));
console.log(`Built ${pages.length} pages for ${siteUrl}`);
