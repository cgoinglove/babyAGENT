import chalk from 'chalk';
import inquirer from 'inquirer';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

interface ExampleFile {
  name: string;
  path: string;
  relativePath: string;
}

// Find all example.ts files recursively in a directory
function findExampleFiles(dirPath: string): ExampleFile[] {
  const examples: ExampleFile[] = [];

  function searchDirectory(currentPath: string) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        // Recursively search subdirectories
        searchDirectory(itemPath);
      } else if (item === 'example.ts') {
        // Only exact match for example.ts
        // It's an example file
        const relativePath = itemPath.replace(process.cwd(), '').replace(/^\//, '');

        // Extract filename and directory for display
        const fileName = path.basename(itemPath);

        examples.push({
          name: fileName,
          path: itemPath,
          relativePath,
        });
      }
    }
  }

  searchDirectory(dirPath);
  return examples;
}

async function selectAndRunExample() {
  const rootDir = path.join(process.cwd(), 'src');
  console.log(`🔍 Searching for example.ts files in ${chalk.blue(rootDir)}...`);

  // Find all example files
  const exampleFiles = findExampleFiles(rootDir);

  if (exampleFiles.length === 0) {
    console.log(`❌ ${chalk.red('No example.ts files found')} in the src directory`);
    return;
  }

  console.log(`✨ Found ${chalk.green(exampleFiles.length)} example.ts files`);

  // Sort examples by path for better organization
  exampleFiles.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  // Create formatted choices for the inquirer prompt
  const choices = exampleFiles.map((example) => {
    const green = chalk.green;
    // Display the full relative path
    return {
      name: `${green('📄')} ${example.relativePath}`,
      value: example.relativePath,
    };
  });

  // Add exit option at the top
  choices.push({
    name: chalk.red('exit'),
    value: 'exit',
  });

  // Prompt user to select an example
  const { selectedExample } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedExample',
      message: 'Select an example to run:',
      pageSize: 15,
      choices,
    },
  ]);

  // Check if user selected exit
  if (selectedExample === 'exit') {
    console.log(chalk.yellow('Exiting...'));
    process.exit(0);
  }

  // Run the selected example
  console.log(`🚀 Running: ${chalk.cyan(selectedExample)}`);
  spawn(`pnpm tsx ${selectedExample}`, { shell: true, stdio: 'inherit' });
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
  // Search mode - find matching example files
  const searchPattern = args[0].toLowerCase();
  const rootDir = path.join(process.cwd(), 'src');

  // Find all example files
  const allExampleFiles = findExampleFiles(rootDir);

  // Filter by the search pattern
  const matchingFiles = allExampleFiles.filter((file) => {
    const dirName = path.dirname(file.relativePath).toLowerCase();
    return dirName.includes(searchPattern);
  });

  if (matchingFiles.length > 0) {
    const selectedFile = matchingFiles[0].relativePath;
    console.log(`✨ Running: ${chalk.green(selectedFile)}`);
    spawn(`pnpm tsx ${selectedFile}`, { shell: true, stdio: 'inherit' });
  } else {
    console.log(`❌ No example.ts files found in directories matching: ${chalk.red(searchPattern)}`);
  }
} else {
  // Interactive mode
  selectAndRunExample();
}
