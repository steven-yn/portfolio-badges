const fs = require("fs");
const https = require("https");
const path = require("path");

// assets.md 파일 읽기
const assetsContent = fs.readFileSync("assets.md", "utf8");

// img 태그에서 src URL 추출하는 정규표현식
const imgRegex = /<img\s+src="([^"]+)"/g;
const urls = [];
let match;

while ((match = imgRegex.exec(assetsContent)) !== null) {
  urls.push(match[1]);
}

console.log(`총 ${urls.length}개의 뱃지 이미지를 찾았습니다.`);

// assets 폴더 생성
const assetsDir = path.join(__dirname, "assets");
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// 각 URL에서 뱃지 이름 추출하는 함수
function getBadgeName(url) {
  const urlParts = new URL(url);
  const pathParts = urlParts.pathname.split("/");
  const badge = pathParts[pathParts.length - 1]; // badge 이름

  // URL 파라미터에서 기술 스택 이름 추출
  const params = new URLSearchParams(urlParts.search);
  let techName = badge;

  // 일부 뱃지는 URL 경로에서 기술명을 추출할 수 있음
  if (badge && badge !== "badge") {
    techName = badge;
  }

  return techName.toLowerCase().replace(/[^a-z0-9]/g, "-");
}

// 이미지 다운로드 함수
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(assetsDir, filename);
    const file = fs.createWriteStream(filePath);

    https
      .get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on("finish", () => {
            file.close();
            console.log(`✓ ${filename} 다운로드 완료`);
            resolve();
          });
        } else {
          reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        }
      })
      .on("error", (err) => {
        fs.unlink(filePath, () => {}); // 실패시 파일 삭제
        reject(err);
      });
  });
}

// 모든 이미지 다운로드
async function downloadAllImages() {
  console.log("뱃지 이미지 다운로드를 시작합니다...\n");

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const badgeName = getBadgeName(url);
    const filename = `${String(i + 1).padStart(2, "0")}-${badgeName}.svg`;

    try {
      await downloadImage(url, filename);
    } catch (error) {
      console.error(`✗ ${filename} 다운로드 실패:`, error.message);
    }
  }

  console.log("\n모든 다운로드가 완료되었습니다!");
  console.log(`이미지들은 ${assetsDir} 폴더에 저장되었습니다.`);
}

// 다운로드 시작
downloadAllImages().catch(console.error);
