#!/usr/bin/env node

/**
 * Setup Script for CS-Cart MCP Server
 * Helps with initial project setup and configuration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`✓ Created directory: ${dirPath}`, 'green');
  } else {
    log(`✓ Directory already exists: ${dirPath}`, 'yellow');
  }
}

function copyEnvFile() {
  const envExample = path.join(rootDir, '.env.example');
  const envFile = path.join(rootDir, '.env');
  
  if (!fs.existsSync(envFile)) {
    if (fs.existsSync(envExample)) {
      fs.copyFileSync(envExample, envFile);
      log('✓ Created .env file from .env.example', 'green');
      log('⚠️  Please update .env with your CS-Cart API credentials', 'yellow');
    } else {
      log('✗ .env.example file not found', 'red');
    }
  } else {
    log('✓ .env file already exists', 'yellow');
  }
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  
  if (majorVersion >= 18) {
    log(`✓ Node.js version ${nodeVersion} is supported`, 'green');
  } else {
    log(`✗ Node.js version ${nodeVersion} is not supported. Please upgrade to Node.js 18 or higher`, 'red');
    process.exit(1);
  }
}

function checkRequiredFiles() {
  const requiredFiles = [
    'src/index.js',
    'package.json',
    '.env.example',
    'README.md'
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      log(`✓ ${file}`, 'green');
    } else {
      log(`✗ ${file} is missing`, 'red');
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

function setup() {
  log('🚀 Setting up CS-Cart MCP Server...', 'cyan');
  log('');
  
  // Check Node.js version
  log('Checking Node.js version...', 'blue');
  checkNodeVersion();
  log('');
  
  // Check required files
  log('Checking required files...', 'blue');
  const allFilesExist = checkRequiredFiles();
  log('');
  
  if (!allFilesExist) {
    log('✗ Setup failed: Missing required files', 'red');
    process.exit(1);
  }
  
  // Create necessary directories
  log('Creating directories...', 'blue');
  createDirectory(path.join(rootDir, 'logs'));
  createDirectory(path.join(rootDir, 'tests'));
  createDirectory(path.join(rootDir, 'config'));
  createDirectory(path.join(rootDir, 'scripts'));
  log('');
  
  // Copy environment file
  log('Setting up environment configuration...', 'blue');
  copyEnvFile();
  log('');
  
  // Final instructions
  log('🎉 Setup completed successfully!', 'green');
  log('');
  log('Next steps:', 'cyan');
  log('1. Update .env file with your CS-Cart API credentials', 'yellow');
  log('2. Install dependencies: npm install', 'yellow');
  log('3. Run the server: npm start', 'yellow');
  log('');
  log('For Docker deployment:', 'cyan');
  log('1. docker-compose up -d', 'yellow');
  log('');
  log('For more information, see README.md', 'blue');
}

// Run setup
setup();