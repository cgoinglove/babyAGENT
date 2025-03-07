import '@shared/env/global';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import { STUPID_MODEL } from './src/models';
import { exit } from 'process';
import fs from 'fs';
import path from 'path';

const FLAG_FILE = path.join(process.cwd(), 'node_modules/.__check__');

function checkFlag() {
  // Check if the flag file exists in node_modules
  try {
    return fs.existsSync(FLAG_FILE);
  } catch {
    return false;
  }
}

function createFlag() {
  // Create the flag file in node_modules directory
  try {
    // Create with current timestamp to track when the check was last run
    const timestamp = new Date().toISOString();
    fs.writeFileSync(FLAG_FILE, timestamp);
    return true;
  } catch (error) {
    console.warn(chalk.yellow(`Unable to create flag file: ${(error as Error).message}`));
    return false;
  }
}

// Early exit if check has already been performed
if (checkFlag()) {
  // Silently exit if already checked
  exit(0);
}

/**
 * Checks if required environment variables are set
 * If not, provides helpful instructions to set them up
 */
if (!process.env.OPENAI_API_KEY) {
  let instructionMessage = chalk.yellow('\n⚠️  WARNING: OPENAI_API_KEY environment variable is not set!\n\n');

  instructionMessage += `Please copy the ${chalk.cyan('.env.example')} template to ${chalk.cyan('.env')} in the following directory:\n`;
  instructionMessage += `📂 ${chalk.cyan('shared/env/src/global')}\n\n`;
  instructionMessage += `Then add your OpenAI API key to the .env file:\n`;
  instructionMessage += `${chalk.green('OPENAI_API_KEY=your_api_key_here')}\n`;
  console.warn(instructionMessage);
}

const execAsync = promisify(exec);

async function checkOllamaAndModel() {
  try {
    const { stdout } = await execAsync('ollama ls');

    if (!stdout.includes(STUPID_MODEL)) {
      console.warn(chalk.yellow(`\n🦙🦙🦙 The Ollama default model ${chalk.cyan(STUPID_MODEL)} is not installed.`));
      console.warn(chalk.cyan(`You can download it using: ${chalk.green(`ollama pull ${STUPID_MODEL}`)}\n\n`));
    } else {
      console.log(chalk.green(`\n✅ Found required model: ${STUPID_MODEL}`));
      createFlag();
    }
  } catch {
    console.warn(chalk.yellow('\n⚠️ Ollama is not installed on your system!'));
    console.warn(chalk.cyan('Please visit https://ollama.com/ to download and install Ollama first.\n\n'));
  } finally {
    exit(0);
  }
}

checkOllamaAndModel();
