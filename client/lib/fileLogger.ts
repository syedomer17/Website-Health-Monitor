import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Sanitize filename from website name
function sanitizeFileName(name: string): string {
  // Remove invalid characters and replace spaces with underscores
  return name
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

// Create initial file for a website
export function createWebsiteFile(websiteName: string, url: string): void {
  try {
    ensureDataDir();
    const fileName = `${sanitizeFileName(websiteName)}.txt`;
    const filePath = path.join(DATA_DIR, fileName);
    
    const initialContent = `Website Health Monitor - Status Log
===============================
Website Name: ${websiteName}
URL: ${url}
Created: ${new Date().toLocaleString()}

===============================
Health Check Logs:
===============================

`;
    
    fs.writeFileSync(filePath, initialContent, 'utf-8');
  } catch (error) {
    console.error('Failed to create website file:', error);
  }
}

// Append health check log to file
export function appendHealthCheckLog(websiteName: string, log: {
  timestamp: string;
  statusCode: number;
  isHealthy: boolean;
  url: string;
}): void {
  try {
    ensureDataDir();
    const fileName = `${sanitizeFileName(websiteName)}.txt`;
    const filePath = path.join(DATA_DIR, fileName);
    
    // If file doesn't exist, create it first
    if (!fs.existsSync(filePath)) {
      createWebsiteFile(websiteName, log.url);
    }
    
    const date = new Date(log.timestamp);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString();
    const healthStatus = log.isHealthy ? 'Healthy' : 'Unhealthy';
    
    const logEntry = `[${dateStr} ${timeStr}]
Status Code: ${log.statusCode}
Health Status: ${healthStatus}
URL: ${log.url}
----------------------------------------

`;
    
    // Append to file
    fs.appendFileSync(filePath, logEntry, 'utf-8');
  } catch (error) {
    console.error('Failed to append health check log:', error);
  }
}

