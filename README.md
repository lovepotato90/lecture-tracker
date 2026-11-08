# 인강 진도 트래커 (GitHub + Vercel 배포)

## 1. GitHub에 올리기
1. github.com 에서 새 저장소(Repository)를 만들어요. (예: lecture-tracker)
2. 이 폴더 안의 파일을 전부 올려요. (`index.html`, `sync.js`, `sw.js`, `manifest.webmanifest`, `package.json`, `icon-192.png`, `icon-512.png`, `api/sync.js`)
   - 웹에서 `Add file > Upload files` 로 끌어다 놓으면 돼요. `api` 폴더 구조가 유지되어야 해요.

## 2. Vercel에 배포
1. vercel.com 에 GitHub 계정으로 로그인 > `Add New… > Project` > 방금 만든 저장소를 `Import` > `Deploy`.

## 3. 데이터 저장소 연결 (무료)
1. Vercel 프로젝트 화면의 `Storage` 탭 > Marketplace에서 `Upstash Redis`(무료 플랜)를 만들고 이 프로젝트에 연결해요.
2. 연결하면 환경 변수가 자동으로 들어가요. 그 뒤 `Deployments` 탭에서 가장 최근 배포를 `Redeploy` 해요.

## 4. 기기 연결
1. 노트북에서 배포 주소를 열고 오른쪽 아래 `☁ 동기화` > `새 동기화 코드 만들기`.
2. 스마트폰/갤럭시탭에서 같은 주소를 열고 `☁ 동기화`에 그 코드를 붙여넣고 `연결`.
3. 브라우저 메뉴의 `홈 화면에 추가`(또는 `앱 설치`)를 하면 앱처럼 쓸 수 있어요.

## 참고
- 동기화 코드를 아는 사람은 누구나 데이터를 볼 수 있으니 공개하지 마세요.
- 오프라인에서도 입력할 수 있고, 연결되면 자동으로 합쳐져요.
- 두 기기에서 같은 항목을 동시에 고치면 나중에 저장한 쪽이 남아요.
