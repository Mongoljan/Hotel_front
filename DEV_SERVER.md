# Development Server

## Quick Start

This project provides multiple ways to start the development server to handle port conflicts automatically.

## Available Commands

### 🚀 Automatic Port Detection (Recommended)
```bash
npm run dev:auto
```
This script automatically finds the first available port between 3000-3010 and starts the development server on it.

### 🎯 Fixed Port Options
```bash
# Default: Start on port 3001
npm run dev

# Start on port 3000 (if available)
npm run dev:3000

# Start on port 3002 (if available)  
npm run dev:3002
```

## Port Conflict Resolution

If you encounter the error `EADDRINUSE: address already in use :::3000`, use one of these solutions:

1. **Use automatic port detection**: `npm run dev:auto`
2. **Use a different port**: `npm run dev` (uses port 3001)
3. **Kill processes on port 3000**:
   ```bash
   # Find processes using port 3000
   lsof -ti:3000
   
   # Kill them (replace PID with actual process ID)
   kill -9 <PID>
   ```

## Features

- 🔍 Automatic port detection and assignment
- 🚦 Multiple fallback ports available
- 📱 Clear console output showing which port is being used
- 🛑 Graceful shutdown handling

Choose the method that works best for your workflow!
