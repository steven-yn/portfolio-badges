const fs = require("fs");
const path = require("path");

// 결합할 뱃지 파일들 (순서대로)
const badgeFiles = [
  "32-cursor-000000.svg",
  "33-codex-ffffff.svg",
  "34-claude-code-d97757.svg",
  "35-v0-000000.svg",
];

const assetsDir = path.join(__dirname, "../assets");
const outputDir = path.join(__dirname, "../badges");

// SVG 파일에서 내용 추출하는 함수
function extractSvgContent(svgContent) {
  // SVG 태그에서 width와 height 추출
  const widthMatch = svgContent.match(/width="(\d+)"/);
  const heightMatch = svgContent.match(/height="(\d+)"/);

  const width = widthMatch ? parseInt(widthMatch[1]) : 0;
  const height = heightMatch ? parseInt(heightMatch[1]) : 20;

  // SVG 내부 내용 추출 (svg 태그 제외)
  const contentMatch = svgContent.match(/<svg[^>]*>(.*)<\/svg>/s);
  const content = contentMatch ? contentMatch[1] : "";

  return { width, height, content };
}

// Cursor + Codex + Claude Code + V0 뱃지 결합
async function combineAiTools() {
  console.log("AI Tools (Cursor, Codex, Claude Code, V0) 뱃지 결합을 시작합니다...\n");

  // badges 출력 디렉터리 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`✓ ${outputDir} 디렉터리를 생성했습니다.`);
  }

  const badges = [];
  let totalWidth = 0;
  let maxHeight = 0;

  // 각 뱃지 파일 읽기 및 분석
  for (const filename of badgeFiles) {
    const filePath = path.join(assetsDir, filename);

    if (!fs.existsSync(filePath)) {
      console.error(`파일을 찾을 수 없습니다: ${filename}`);
      continue;
    }

    const svgContent = fs.readFileSync(filePath, "utf8");
    const { width, height, content } = extractSvgContent(svgContent);

    badges.push({
      filename,
      width,
      height,
      content,
      x: totalWidth, // 현재 뱃지의 x 위치
    });

    totalWidth += width;
    maxHeight = Math.max(maxHeight, height);

    console.log(`✓ ${filename} 분석 완료 (${width}×${height}px)`);
  }

  console.log(`\n총 크기: ${totalWidth}×${maxHeight}px\n`);

  // 통합 SVG 생성
  let combinedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${maxHeight}" role="img" aria-label="AI Tools (Cursor, Codex, Claude Code, V0)">
  <title>AI Tools (Cursor, Codex, Claude Code, V0)</title>`;

  // 각 뱃지를 그룹으로 감싸서 위치 조정
  badges.forEach((badge) => {
    combinedSvg += `\n  <!-- ${badge.filename} -->`;
    combinedSvg += `\n  <g transform="translate(${badge.x}, 0)">`;
    combinedSvg += `\n    ${badge.content}`;
    combinedSvg += `\n  </g>`;
  });

  combinedSvg += `\n</svg>`;

  // 결합된 SVG 파일 저장
  const outputPath = path.join(outputDir, "ai-tools-2.svg");
  fs.writeFileSync(outputPath, combinedSvg);

  console.log("✅ AI Tools 뱃지 결합이 완료되었습니다!");
  console.log(`📁 저장 위치: ${outputPath}`);
  console.log(`📐 최종 크기: ${totalWidth}×${maxHeight}px`);

  // 뱃지별 위치 정보 출력
  console.log("\n📍 각 뱃지 위치:");
  badges.forEach((badge, index) => {
    console.log(`   ${index + 1}. ${badge.filename}: x=${badge.x}, width=${badge.width}px`);
  });
}

// 실행
combineAiTools().catch(console.error);

