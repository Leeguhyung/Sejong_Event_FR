# SeQ — 세종대학교 행사 통합 관리 웹 플랫폼 (프론트엔드)

개강총회·전체학생총회 등 **행사 모드**와 세종연회 **축제 모드**를 하나의 웹에서
지원하는 프론트엔드. 별도 앱 설치 없이 QR 링크로 접근한다.

## 기술 스택

| 구분 | 선택 |
|---|---|
| 빌드 | Vite 8 |
| 프레임워크 | React 19 + TypeScript 6 |
| 스타일 | Tailwind CSS 3 + PostCSS + Autoprefixer |
| 라우팅 | react-router-dom 7 |
| 린트 | oxlint |

## 개발

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 타입 검사 + 프로덕션 번들
npm run preview  # 빌드 결과 정적 서빙
```
