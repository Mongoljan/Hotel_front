#!/usr/bin/env node

const { spawn } = require('child_process');
const net = require('net');

/**
 * Check if a port is available
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, (err) => {
      if (err) {
        resolve(false);
      } else {
        server.once('close', () => {
          resolve(true);
        });
        server.close();
      }
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Find the first available port starting from a given port
 */
async function findAvailablePort(startPort = 3000, maxPort = 3010) {
  for (let port = startPort; port <= maxPort; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available ports found between ${startPort} and ${maxPort}`);
}

/**
 * Start the Next.js dev server on an available port
 */
async function startDev() {
  try {
    console.log('🔍 Finding available port...');
    const port = await findAvailablePort(3000, 3010);
    
    console.log(`🚀 Starting development server on port ${port}`);
    console.log(`📱 Open http://localhost:${port} in your browser\n`);
    
    // Start Next.js dev server
    const child = spawn('npx', ['next', 'dev', '-p', port.toString()], {
      stdio: 'inherit',
      shell: true
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development server...');
      child.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down development server...');
      child.kill('SIGTERM');
    });
    
  } catch (error) {
    console.error('❌ Error starting development server:', error.message);
    process.exit(1);
  }
}

// Run the script
startDev();
