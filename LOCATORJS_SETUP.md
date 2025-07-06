# LocatorJS Setup for React + Vite Projects

## Installation
```bash
npm install --save-dev @locator/babel-jsx @locator/runtime
```

## Vite Configuration (vite.config.ts)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      babel: {
        plugins: mode === 'development' ? [['@locator/babel-jsx/dist', { env: 'development' }]] : [],
      },
    }),
  ],
  // ... rest of config
}));
```

## Main Entry Point (src/main.tsx)
```typescript
// Initialize locatorjs in development
if (import.meta.env.DEV) {
  import('@locator/runtime').then(({ setupLocator }) => {
    setupLocator();
  });
}
```

## Usage
- Option+Click (Alt+Click) on React components to jump to source code
- Only works in development mode