# babyAGENT

## 시작하기

```bash
# 의존성 설치
pnpm install

# examples 디렉토리로 이동하여 테스트 실행
cd examples
pnpm example
```

## 프로젝트 구조

- `baby`: 구현체 🚧
- `examples`: 에이전트 구현을 위한 예제
- `shared`: 공유 유틸리티, 환경 설정 및 공통 도구
- `ui`: 에이전트를 위한 시각적 인터페이스 🚧

## 환경 설정

OpenAI API 키를 등록하기 위해 환경 설정 파일을 복사하세요:

```bash
cp shared/env/src/global/.env.example shared/env/src/global/.env
```

복사한 `.env` 파일에 OpenAI API 키를 추가해주세요.

## 요구사항

- pnpm 패키지 매니저
- Ollama (로컬 모델 사용 시 권장)
