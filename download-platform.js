/**
 * Platform Download Script
 * ----------------------
 * This script creates a downloadable ZIP archive of the entire platform.
 * 
 * Usage:
 * 1. Run this script with Node.js: node download-platform.js
 * 2. The script will create a zip file named "xtend-outreach-platform.zip" in the current directory
 * 3. Download this file to have a complete backup of your platform
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream, statSync, existsSync, readdirSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories to include in the download
const INCLUDE_DIRS = [
  'client',
  'server',
  'shared',
  'public',
  'uploads'
];

// Files to include in the download
const INCLUDE_FILES = [
  'package.json',
  'package-lock.json',
  'drizzle.config.ts',
  'vite.config.ts',
  'tsconfig.json',
  'tailwind.config.ts',
  'postcss.config.js',
  'components.json',
  '.gitignore',
  'README.md'
];

// Files and directories to exclude
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  '.env',
  '.DS_Store',
  '*.log'
];

/**
 * Check if a file or directory should be excluded based on patterns
 */
function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => {
    if (pattern.includes('*')) {
      const regexPattern = pattern.replace('.', '\\.').replace('*', '.*');
      return new RegExp(regexPattern).test(filePath);
    }
    return filePath.includes(pattern);
  });
}

/**
 * Create the platform download zip file
 */
async function createDownloadZip() {
  console.log('Creating platform download package...');
  
  // First make sure archiver is installed
  try {
    await ensureArchiverInstalled();
    
    // Dynamic import of archiver (ESM compatible)
    const archiverModule = await import('archiver');
    const archiver = archiverModule.default;
    
    const output = createWriteStream('./xtend-outreach-platform.zip');
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    // Listen for warnings and errors
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Warning:', err);
      } else {
        throw err;
      }
    });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    // Pipe archive data to the output file
    archive.pipe(output);
    
    // Add directories to the archive
    for (const dir of INCLUDE_DIRS) {
      if (existsSync(dir) && statSync(dir).isDirectory()) {
        archive.directory(dir, dir, (entry) => {
          if (shouldExclude(entry.name)) {
            return false;
          }
          return entry;
        });
      } else {
        console.warn(`Directory not found: ${dir}`);
      }
    }
    
    // Add individual files to the archive
    for (const file of INCLUDE_FILES) {
      if (existsSync(file)) {
        archive.file(file, { name: file });
      } else {
        console.warn(`File not found: ${file}`);
      }
    }
    
    // Add documentation files
    if (existsSync('docs')) {
      archive.directory('docs', 'docs');
    }
    
    // Add setup scripts
    const setupScripts = readdirSync('.').filter(file => 
      (file.startsWith('setup-') || file.startsWith('import-')) && 
      (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.ts'))
    );
    
    for (const script of setupScripts) {
      archive.file(script, { name: script });
    }
    
    // Add README with installation instructions
    archive.append(`# Xtend Outreach Platform

## Installation

1. Extract this zip file to a directory
2. Run \`npm install\` to install dependencies
3. Set up your environment variables in a \`.env\` file
4. Start the development server with \`npm run dev\`

## Database Setup

To set up the database:

1. Configure your database connection in \`.env\` file
2. Run \`npm run db:push\` to create all database tables
3. Run \`node setup-database-tables.js\` to initialize basic data

## Email Account Setup

For email functionality:

1. Go to Email Accounts section in the platform
2. Add your SMTP email accounts
3. For Gmail accounts with 2FA, follow the App Password setup guide

## Contact Import

To import your contacts:

1. Use the Contact Import feature in the platform
2. Or run \`node import-contacts-from-excel.mjs\` with your contacts file

## Documentation

Refer to the docs directory for detailed documentation.
`, { name: 'INSTALLATION.md' });
    
    // Return a promise that resolves when the archive is finalized
    return new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log('Download package created: ./xtend-outreach-platform.zip');
        console.log('File size:', (statSync('./xtend-outreach-platform.zip').size / (1024 * 1024)).toFixed(2), 'MB');
        resolve();
      });
      
      archive.finalize();
    });
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    throw error;
  }
}

// Only install archiver if it's not already installed
async function ensureArchiverInstalled() {
  try {
    // Try to dynamically import archiver
    await import('archiver');
    console.log('Archiver already installed, proceeding...');
  } catch (err) {
    console.log('Installing archiver package...');
    try {
      await execAsync('npm install archiver --no-save');
      console.log('Archiver installed successfully');
    } catch (installError) {
      console.error('Failed to install archiver:', installError);
      throw installError;
    }
  }
}

// Main execution
async function main() {
  try {
    await createDownloadZip();
    
    console.log('\nSuccess! Your platform download package is ready.');
    console.log('Download the file "xtend-outreach-platform.zip" for a complete backup.');
  } catch (error) {
    console.error('Error creating download package:', error);
    process.exit(1);
  }
}

main();