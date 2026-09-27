# Sol — Personal portfolio

Atlason 레퍼런스의 배경 + 3패널 구성, 큰 산세리프 글자, 확장 패널, 작업 이미지 그리드를 바탕으로 만든 개인 포트폴리오입니다. 순수 HTML/CSS/JavaScript이며 npm 설치, 빌드, 외부 폰트, 분석 스크립트, 런타임 의존성이 없습니다. 원본 사이트의 사진·폰트·브랜드는 포함하지 않았습니다.

## 시작

프로젝트 루트에서 로컬 정적 서버를 실행한 뒤 접속합니다. Python이 있다면:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

- 사이트: http://127.0.0.1:4173/
- 콘텐츠/암호화 도구: http://127.0.0.1:4173/tools/publish.html
- 최초 샘플은 공개 상태입니다. 실사용 비밀번호는 설정되어 있지 않습니다.
- 소개, Featured/Archive, 카테고리 필터, 프로젝트 상세/다음 작업, More 글 펼치기, 모바일 화면을 지원합니다.
- `#works/project-1` 같은 해시 주소는 GitHub Pages 하위 경로에서도 새로고침/공유할 수 있습니다.

## 내 콘텐츠 넣기

1. 편집 도구에서 `name`, `intro`, `location`, `email`, `instagram`, `tagline`, `notes`, `projects`를 수정합니다. 빈 연락처는 링크로 표시되지 않습니다. Instagram은 `https://www.instagram.com/…` 형식입니다.
2. 프로젝트 `id`는 중복 없이 영문 소문자/숫자/하이픈만 사용합니다. `featured: true`인 작업은 Featured에, 모든 작업은 Archive에 나타납니다.
3. 프로젝트 추가/삭제 후 **내용 적용**을 누릅니다. 비밀번호 입력란이 초기화됩니다.
4. **이미지 넣기**에서 대상과 파일을 고릅니다. 선택한 이미지들로 대상 프로젝트의 갤러리가 교체되며 첫 이미지가 커버가 됩니다. PNG/JPEG/WebP/GIF, 파일당 8MB 이하입니다. 빠른 로딩을 위해 1600–2400px WebP와 적은 파일 수를 권장합니다.
5. **원본 JSON 백업**을 저장소 밖에 안전하게 보관합니다. 암호화한 배포 파일을 편집 도구에서 원본으로 되돌리는 기능은 없습니다. 이후 편집 시 백업 JSON을 가져옵니다.
6. 전체 사이트와 각 프로젝트에 원하는 비밀번호/확인을 입력합니다. 비우면 해당 대상은 공개됩니다. 비밀번호는 12자 이상, 길고 예측하기 어려운 문구를 사용하세요.
7. **배포용 site-data.js 만들기**를 누르고 내려받은 파일로 루트의 `site-data.js`를 교체합니다. 다운로드만으로 기존 파일이 변경되지는 않습니다.
8. 새로고침한 뒤 공개·잠금 상태, 정확한/잘못된 비밀번호를 확인합니다.

`assets/work-*.svg`, `portrait.svg`, `background.svg`는 직접 만든 플레이스홀더입니다. 공개 이미지는 `assets/` 아래 경로도 지원합니다. 비공개 실제 이미지는 반드시 도구의 이미지 넣기를 통해 파일 자체를 포함시키세요. 외부 URL은 뷰어에서 표시하지 않습니다. 사이트 제목과 검색 설명은 `index.html`, 브라우저 아이콘은 `assets/icon.svg`에서 변경합니다.

## 비밀번호가 보호하는 범위

브라우저 Web Crypto의 PBKDF2-SHA-256(600,000회, 매번 새 16바이트 salt)로 키를 만들고 AES-256-GCM(새 12바이트 IV)으로 콘텐츠를 암호화합니다. 비밀번호나 복호화 키는 배포 파일·localStorage·sessionStorage에 저장하지 않습니다. 새로고침하면 다시 잠깁니다. 홈의 Lock session 또는 개별 프로젝트의 Lock으로도 잠글 수 있습니다.

- 전체 잠금: 이름, 소개, 프로젝트 목록과 포함된 이미지까지 `site-data.js` 안에서 암호화합니다. HTML/CSS/공개 플레이스홀더와 일반 페이지 제목은 공개입니다.
- 프로젝트 잠금: 실제 제목·설명·이미지·크레딧은 암호화합니다. 목록에는 Private project와 id·분류·연도·Featured 여부가 공개됩니다. 이 메타데이터도 감추려면 전체 잠금을 사용하세요.
- 공개 경로의 파일은 암호화되지 않습니다. 비공개 원본을 `assets/`나 Git 저장소에 올리지 마세요. Git 기록에 한 번 공개된 콘텐츠는 현재 파일을 지워도 과거 기록에서 접근할 수 있습니다.
- 정적 호스팅은 로그인 서버가 아닙니다. 암호문 다운로드, 오프라인 비밀번호 추측, 잠금 해제한 방문자의 복사·스크린샷을 막지 못합니다. 비밀번호 변경은 이미 다운로드된 이전 버전을 회수하지 못합니다. 강력한 접근 제어·접근 회수·접속자별 권한이 필요하면 서버 인증이 필요합니다.
- HTTPS 또는 localhost가 필요합니다. 비밀번호 분실 시 백업 원본으로 다시 발행하세요.

## GitHub Pages 배포

별도 빌드 없이 저장소 루트를 배포할 수 있습니다. 처음 공개하기 전에 원본/비밀번호/테스트 파일이 포함되지 않았는지 확인합니다. `.private/`와 `*private-source*.json`은 `.gitignore`에 포함되어 있습니다. 원본은 저장소 밖에 보관하는 편이 안전합니다.

1. 다음 배포 파일만 GitHub에 올립니다: `index.html`, `style.css`, `app.js`, `crypto.js`, `site-data.js`, `assets/`, `.nojekyll`. 편집 도구 `tools/`는 선택 사항이며 서버 파일 수정 권한이 없는 로컬 생성 도구입니다.
2. GitHub 저장소 **Settings → Pages → Deploy from a branch**에서 배포할 브랜치와 **/(root)**를 선택합니다.
3. 제공된 Pages 주소에서 확인합니다. 모든 내부 자산 경로는 상대 경로라 저장소 이름 하위 주소도 지원합니다.
4. 사용자 도메인을 쓸 경우 Pages의 Custom domain과 DNS를 설정하고 HTTPS를 사용합니다. 실제 도메인이 정해지기 전에는 CNAME을 추가하지 마세요.

현재 작업에서는 원격 push나 공개 배포를 하지 않았습니다.

## 검증

```sh
node --test tests/crypto.test.cjs
```

Node는 검증 시에만 필요하며 사이트 실행에는 필요하지 않습니다. 암호화 왕복, salt/IV 무작위성, 틀린 비밀번호, 데이터 변조 거부, 사이트/프로젝트 이중 잠금을 검증합니다.

참고: [디자인 레퍼런스](https://atlason.com/), [Web Crypto deriveKey](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey), [GitHub Pages 소개](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
