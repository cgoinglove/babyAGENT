import chalk from 'chalk';
import inquirer from 'inquirer';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

interface FileItem {
  name: string;
  value: string;
  isDirectory: boolean;
}

function ls(rootPath: string, currentPath: string) {
  const items = fs.readdirSync(currentPath);
  const isRoot = rootPath == currentPath;
  const gray = chalk.rgb(120, 120, 120);
  const fileItems: FileItem[] = items.map((item) => {
    const itemPath = path.join(currentPath, item);
    const isDirectory = fs.statSync(itemPath).isDirectory();

    return {
      name: `${isDirectory ? '📂' : '📎'} ${gray(isRoot ? '' : chalk.rgb(120, 120, 120)(currentPath.replace(rootPath, '').replace('/', '')) + '/')}${item}${isDirectory ? '/' : ''}`,
      value: itemPath,
      isDirectory,
    };
  });

  if (!isRoot) {
    fileItems.unshift({
      name: `📂 ${gray('..')}`,
      value: path.join(currentPath, '..'),
      isDirectory: true,
    });
  }
  return fileItems.filter((v) => v.isDirectory || v.value.endsWith('.ts'));
}

// Recursively find all .ts files in a directory and its subdirectories
function lsFlatTs(dirPath: string): string[] {
  let result: string[] = [];

  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const isDirectory = fs.statSync(itemPath).isDirectory();

    if (isDirectory) {
      // Recursively search subdirectories
      result = result.concat(lsFlatTs(itemPath));
    } else if (item.endsWith('.ts')) {
      // Add TypeScript file to results
      result.push(itemPath);
    }
  }

  return result;
}

async function exploreDirectory(rootPath: string): Promise<string> {
  let currentPath = rootPath;
  while (true) {
    const { selectedPath } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedPath',
        message: '',
        choices: () => ls(rootPath, currentPath),
      },
    ]);
    if (fs.statSync(selectedPath).isDirectory()) {
      currentPath = selectedPath;
    } else {
      return selectedPath;
    }
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
  // Search mode - find first matching .ts file
  const searchPattern = args[0];
  const rootDir = path.join(process.cwd(), 'src');

  // Get all .ts files recursively
  const allTsFiles = lsFlatTs(rootDir);

  // Filter by the search pattern
  const matchingFiles = allTsFiles
    .map((file) => ({
      file,
      relativePath: file.replace(process.cwd(), '').replace(/^\//, ''),
    }))
    .filter(({ relativePath }) => {
      const regex = new RegExp(searchPattern, 'i');
      return regex.test(relativePath);
    })
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  if (matchingFiles.length > 0) {
    // Run the first matching file
    const selectedFile = matchingFiles[0].relativePath;
    console.log(`✨ Running: ${chalk.green(selectedFile)}`);
    spawn(`pnpm tsx ${selectedFile}`, { shell: true, stdio: 'inherit' });
  } else {
    console.log(`❌ No .ts files found matching: ${chalk.red(searchPattern)}`);
  }
} else {
  // Interactive mode
  console.log('✨ select file:');
  exploreDirectory(path.join(process.cwd(), 'src')).then((file) => {
    const result = file.replace(process.cwd(), '').replace(/^\//, '');
    spawn(`pnpm tsx ${result}`, { shell: true, stdio: 'inherit' });
  });
}
