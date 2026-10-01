import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
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

const grades = [
  ["예비중1", "초등 연산과 문장제의 빈틈을 확인하고 문자와 식, 기본 도형으로 이어지는 중학 수학의 첫 틀을 만듭니다."],
  ["예비중2", "일차방정식과 좌표, 기본 도형을 복습한 뒤 식의 계산과 연립방정식을 안정적으로 연결합니다."],
  ["예비중3", "고등 수학의 바탕이 되는 함수·방정식·도형을 정리하고 다음 학년의 내신 난도에 대비합니다."],
  ["예비고1", "중학 전 범위의 취약점을 진단하고 공통수학의 다항식, 방정식, 경우의 수를 체계적으로 시작합니다."],
  ["예비고2", "공통수학의 빈틈을 보완하고 학교 선택 과목과 진로에 맞춰 대수·미적분 학습 순서를 설계합니다."],
  ["예비고3", "수능 출제 단원별 개념과 기출을 연결하고 제한 시간 안에 점수를 만드는 실전 루틴을 다집니다."]
];

const gradeCards = grades.map(([name, text]) => `<article class="grade-card"><span>PREP COURSE</span><h3>${name} 수학과외</h3><p>${text}</p></article>`).join("");
const regionLinks = regions.map(region => `<a class="region-link" href="/areas/${region.slug}/"><small>${region.group}</small><strong>${region.name} 수학과외</strong><span aria-hidden="true">↗</span></a>`).join("");

function layout({ title, description, canonical, body, image = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=85" }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "세종 수학과외",
    url: siteUrl,
    telephone: phone,
    areaServed: "세종특별자치시",
    description
  };
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="naver-site-verification" content="6ded063826d77fdf063c2c08043715e4de8bbc7f">
  <meta name="google-site-verification" content="AMVRxffaVWjg7V-Ulls6OyuWKA7SUR1baVA6bwdj1f4">
  <meta name="theme-color" content="#12304a">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${image}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=Song+Myung&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/style.css">
  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
</head>
<body>
  <a class="skip-link" href="#main">본문으로 바로가기</a>
  <header class="site-header"><div class="wrap nav-inner"><a class="brand" href="/"><span aria-hidden="true">S</span>세종 수학과외</a><nav aria-label="주요 메뉴"><a href="/#method">수업 방식</a><a href="/#grades">학년별 수업</a><a href="/#areas">지역 찾기</a></nav><a class="nav-cta" href="${phoneHref}" aria-label="${phone}로 전화 상담">${phone}</a></div></header>
  ${body}
  <footer><div class="wrap footer-inner"><a class="brand footer-brand" href="/"><span aria-hidden="true">S</span>세종 수학과외</a><p>학생의 이해에서 시작하는 1:1 맞춤 수업</p><p>© 2026 세종 수학과외</p></div></footer>
</body>
</html>`;
}

function homePage() {
  const title = "세종 수학과외 | 예비중·예비고 1:1 맞춤 수업";
  const description = "세종특별자치시 초중고 1:1 수학과외. 예비중1, 예비중2, 예비중3, 예비고1, 예비고2, 예비고3 학생별 내신·선행·수능 맞춤 수업.";
  const body = `<main id="main">
    <section class="hero"><img src="https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=2000&q=88" alt="수학 도형과 공식이 적힌 학습 공간"><div class="hero-overlay"></div><div class="wrap hero-content"><p class="eyebrow">SEJONG · PRIVATE MATH COACHING</p><h1>세종<br>수학과외</h1><p class="hero-copy">답보다 먼저, 막힌 이유를 찾습니다.<br>학생의 학교 진도와 이해 속도에 맞춘 1:1 수업.</p><a class="button button-primary" href="#areas">우리 지역 수업 찾기 <span>→</span></a></div><div class="hero-facts"><span>초등 · 중등 · 고등</span><span>내신 · 선행 · 수능</span><span>세종 전 지역 상담</span></div></section>
    <section class="method" id="method"><div class="wrap"><div class="section-heading"><div><p class="kicker">01 · HOW WE TEACH</p><h2>풀이가 아니라<br>생각의 순서를 봅니다</h2></div><p>같은 문제를 틀려도 이유는 다릅니다. 개념이 비어 있는지, 문제의 조건을 놓쳤는지, 계산 습관이 흔들리는지 먼저 구분한 뒤 수업의 출발점을 정합니다.</p></div><div class="method-grid"><article><b>01</b><h3>현재 학습 진단</h3><p>최근 시험지와 교재를 통해 정확한 취약 지점을 확인합니다.</p></article><article><b>02</b><h3>개인 진도 설계</h3><p>학교 일정, 목표 성적, 가능한 학습 시간을 함께 반영합니다.</p></article><article><b>03</b><h3>이해 중심 수업</h3><p>학생이 풀이의 이유를 자신의 말로 설명할 때까지 확인합니다.</p></article><article><b>04</b><h3>오답과 습관 관리</h3><p>반복되는 실수는 기록하고 다음 수업 계획에 바로 반영합니다.</p></article></div></div></section>
    <section class="grade-section" id="grades"><div class="wrap"><div class="section-heading light"><div><p class="kicker">02 · GRADE TRANSITION</p><h2>학년이 바뀌면<br>준비도 달라야 합니다</h2></div><p>빠른 선행보다 중요한 것은 다음 과정에 필요한 이전 개념을 정확히 연결하는 일입니다.</p></div><div class="grade-grid">${gradeCards}</div></div></section>
    <section class="study-scene"><img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=85" alt="노트에 학습 내용을 정리하는 학생" loading="lazy"><div><p class="kicker">STUDY WITH DIRECTION</p><h2>혼자 공부할 때도<br>흔들리지 않도록</h2><p>과외 시간에만 풀 수 있는 문제는 오래 남지 않습니다. 문제를 읽고, 조건을 표시하고, 풀이를 검토하는 루틴을 반복해 스스로 공부하는 기준을 만듭니다.</p><ul><li>학교별 시험 범위와 일정 반영</li><li>매 수업 오답 원인 기록</li><li>개인별 과제량과 복습 주기 조정</li></ul></div></section>
    <section class="areas" id="areas"><div class="wrap"><div class="section-heading"><div><p class="kicker">03 · LOCAL CLASS</p><h2>세종 우리 동네<br>수학과외 찾기</h2></div><p>세종은 자치구가 없는 단층제 도시입니다. 읍·면과 생활권별 동 페이지에서 가까운 지역의 수업 안내를 확인하세요.</p></div><div class="region-grid">${regionLinks}</div></div></section>
    <section class="consult" id="consult"><div class="wrap consult-inner"><div><p class="kicker">04 · CONSULTATION</p><h2>현재 고민부터<br>차근히 확인합니다</h2></div><div><p>학생 학년, 거주 지역, 최근 성적과 목표를 기준으로 필요한 수업 방향을 안내합니다. 전화로 편하게 상담을 신청해 주세요.</p><a class="button button-dark" href="${phoneHref}" aria-label="${phone}로 전화 상담">${phone} <span>→</span></a></div></div></section>
  </main>`;
  return layout({ title, description, canonical: `${siteUrl}/`, body });
}

function regionPage(region) {
  const title = `${region.name} 수학과외 | 세종 예비중·예비고 맞춤 수업`;
  const description = `세종 ${region.name} 초중고 1:1 수학과외. 예비중1, 예비중2, 예비중3, 예비고1, 예비고2, 예비고3 학생의 내신·선행·수능 맞춤 학습.`;
  const nearby = regions.filter(item => item.slug !== region.slug).slice(0, 8).map(item => `<a href="/areas/${item.slug}/">${item.name}<span>→</span></a>`).join("");
  const body = `<main id="main" class="local-page">
    <section class="local-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="현재 위치"><a href="/">세종</a><span>/</span><strong>${region.name}</strong></nav><p class="eyebrow">${region.group} · LOCAL MATH COACHING</p><h1>${region.name}<br>수학과외</h1><p>${region.nearby}에서 만나는 1:1 맞춤 수업. ${region.focus} 방식으로 학생의 공부 흐름을 바로잡습니다.</p></div></section>
    <section class="local-intro"><div class="wrap section-heading"><div><p class="kicker">LOCAL STUDY PLAN</p><h2>가까운 곳에서<br>꾸준히 배우는 수학</h2></div><div><p>세종 ${region.name} 수학과외는 최근 시험지와 현재 사용하는 교재를 먼저 살펴봅니다. 정답 개수만 확인하지 않고 개념 이해, 풀이 순서, 계산 습관 중 어디에서 막혔는지 구분해 다음 학습량을 정합니다.</p><p>${region.focus}. 초등 개념과 연산, 중등 내신의 서술형 풀이, 고등 수학의 개념 연결과 문제 해석까지 현재 필요한 단계에 집중합니다.</p></div></div></section>
    <section class="grade-section local-grades" id="grades"><div class="wrap"><div class="section-heading light"><div><p class="kicker">GRADE TRANSITION</p><h2>${region.name} 학년별<br>수학 학습 안내</h2></div><p>학년 전환기의 복습과 선행을 학생별 이해도에 맞춰 조정합니다.</p></div><div class="grade-grid">${gradeCards}</div></div></section>
    <section class="local-details"><div class="wrap detail-grid"><article><p class="kicker">LESSON FOCUS</p><h2>${region.name} 학생에게 맞는<br>현실적인 계획</h2><p>학교별 시험 일정과 학생의 생활 패턴을 고려해 무리하지 않고 이어갈 수 있는 주간 계획을 세웁니다. 대면 수업 가능 여부와 시간은 세부 위치와 희망 일정에 따라 상담 후 안내합니다.</p></article><article><p class="kicker">NEARBY AREAS</p><h3>세종 다른 지역 수학과외</h3><div class="nearby-links">${nearby}</div></article></div></section>
    <section class="local-cta"><div class="wrap"><div><p class="kicker">CONSULTATION</p><h2>${region.name} 수학과외 상담</h2></div><a class="button button-primary" href="${phoneHref}" aria-label="${phone}로 전화 상담">${phone} <span>→</span></a></div></section>
  </main>`;
  return layout({ title, description, canonical: `${siteUrl}/areas/${region.slug}/`, body });
}

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "assets"), { recursive: true });
await writeFile(path.join(dist, "assets", "style.css"), await readFile(path.join(root, "src", "style.css"), "utf8"));
await writeFile(path.join(dist, "index.html"), homePage());
for (const region of regions) {
  const directory = path.join(dist, "areas", region.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), regionPage(region));
}
const urls = [`${siteUrl}/`, ...regions.map(region => `${siteUrl}/areas/${region.slug}/`)];
await writeFile(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `\n  <url><loc>${url}</loc><lastmod>2026-10-01</lastmod><changefreq>weekly</changefreq></url>`).join("")}\n</urlset>\n`);
await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
await writeFile(path.join(dist, "CNAME"), "tutorpro.kr\n");
await writeFile(path.join(dist, ".nojekyll"), "");
await writeFile(path.join(dist, "404.html"), layout({ title: "페이지를 찾을 수 없습니다 | 세종 수학과외", description: "요청하신 페이지를 찾을 수 없습니다.", canonical: `${siteUrl}/404.html`, body: `<main class="not-found"><div><p class="kicker">404 ERROR</p><h1>페이지를 찾을 수 없습니다</h1><p>주소가 변경되었거나 존재하지 않는 페이지입니다.</p><a class="button button-primary" href="/">홈으로 돌아가기</a></div></main>` }));
console.log(`Built ${regions.length + 1} pages for ${siteUrl}`);