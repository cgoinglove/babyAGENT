import '@shared/env/global';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import { STANDARD_MODEL, STUPID_MODEL } from '@examples/models';
import { exit } from 'process';
import fs from 'fs';
import path from 'path';

const VERSION = '0.3.1';

const FLAG_FILE = path.join(process.cwd(), `node_modules/.__check__${VERSION}`);

function checkFlag() {
  // node_modules에 플래그 파일이 존재하는지 확인
  try {
    return fs.existsSync(FLAG_FILE);
  } catch {
    return false;
  }
}

function createFlag() {
  // node_modules 디렉토리에 플래그 파일 생성
  try {
    // 마지막으로 확인이 실행된 시점을 추적하기 위해 현재 타임스탬프로 생성
    const timestamp = new Date().toISOString();
    fs.writeFileSync(FLAG_FILE, timestamp);
    return true;
  } catch (error) {
    console.warn(chalk.yellow(`플래그 파일을 생성할 수 없습니다: ${(error as Error).message}`));
    return false;
  }
}

// 이미 확인이 수행되었다면 조기 종료
if (checkFlag()) {
  // 이미 확인되었다면 조용히 종료
  exit(0);
}

/**
 * 필요한 환경 변수가 설정되어 있는지 확인
 * 설정되어 있지 않다면 설정 방법에 대한 도움말 제공
 */
if (!process.env.OPENAI_API_KEY) {
  let instructionMessage = chalk.yellow('\n⚠️  경고: OPENAI_API_KEY 환경 변수가 설정되지 않았습니다!\n\n');

  instructionMessage += `다음 디렉토리에서 ${chalk.cyan('.env.example')} 템플릿을 ${chalk.cyan('.env')}로 복사해주세요:\n`;
  instructionMessage += `📂 ${chalk.cyan('shared/env/src/global')}\n\n`;
  instructionMessage += `그런 다음 .env 파일에 OpenAI API 키를 추가하세요:\n`;
  instructionMessage += `${chalk.green('OPENAI_API_KEY=your_api_key_here')}\n`;
  console.warn(instructionMessage);
}

if (!process.env.TAVILY_API_KEY) {
  let instructionMessage = chalk.yellow('\n⚠️  경고: TAVILY_API_KEY 환경 변수가 설정되지 않았습니다!\n\n');
  instructionMessage += `다음 디렉토리에서 ${chalk.cyan('.env.example')} 템플릿을 ${chalk.cyan('.env')}로 복사해주세요:\n`;
  instructionMessage += `📂 ${chalk.cyan('shared/env/src/global')}\n\n`;
  instructionMessage += `그런 다음 .env 파일에 TAVILY_API_KEY를 추가하세요:\n`;
  instructionMessage += `${chalk.green('TAVILY_API_KEY=your_api_key_here')}\n`;
  instructionMessage += `TAVILY_API_KEY를 얻으려면 https://tavily.com/ 에서 회원가입 후 키를 발급받으세요.\n`;
  instructionMessage += `월 1,000회 무료 사용 가능합니다.\n`;
  console.warn(instructionMessage);
}

const execAsync = promisify(exec);

async function checkOllamaAndModel(model: string) {
  try {
    const { stdout } = await execAsync('ollama ls');

    if (!stdout.includes(model)) {
      if (!stdout.includes(model))
        console.warn(
          chalk.yellow(`\n🦙🦙🦙 Project에서 사용 할 기본 모델 ${chalk.cyan(model)}이(가) 설치되어 있지 않습니다.`)
        );
      console.warn(
        chalk.cyan(`다음 명령어를 사용하여 다운로드할 수 있습니다: ${chalk.green(`ollama pull ${model}`)}\n\n`)
      );
    } else {
      createFlag();
    }
  } catch {
    console.warn(chalk.yellow('\n❌ Ollama가 시스템에 설치되어 있지 않습니다!'));
    console.warn(chalk.cyan('   Ollama를 다운로드하고 설치하려면 https://ollama.com/을 방문해주세요.\n\n'));
  } finally {
    exit(0);
  }
}

await checkOllamaAndModel(STUPID_MODEL);
await checkOllamaAndModel(STANDARD_MODEL);
