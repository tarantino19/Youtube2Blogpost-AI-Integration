# AGENTS.md

## Build/Test Commands

### Client (React/TypeScript)

- `cd client && npm run dev` - Start development server
- `cd client && npm run build` - Build for production
- `cd client && npm run lint` - Run ESLint

### Server (Node.js/Express)

- `cd server && npm run dev` - Start development server with nodemon
- `cd server && npm run start` - Start production server
- `cd server && npm run health` - Run health check
- `cd server && npm run test:ai` - Test AI providers
- `cd server && npm run test:integration` - Run integration tests

## Code Style Guidelines

- **Imports**: Use ES6 imports for client (TypeScript), CommonJS require() for server (JavaScript)
- **Formatting**: Use tabs for indentation, semicolons required
- **Types**: Strict TypeScript on client with Zod validation on both frontend/backend
- **Naming**: camelCase for variables/functions, PascalCase for components/classes
- **Error Handling**: Use try/catch with async/await (preferred over .then), return structured error responses
- **Preferences**: Use map/filter over for loops, avoid classes unless necessary, async/await over promises
- **Security**: Never log secrets, use environment variables, validate all inputs with Zod

## Development Tools Setup

### LocatorJS (Always include in React projects)

```bash
npm install --save-dev @locator/babel-jsx @locator/runtime
```

**Vite Config**: Add to `@vitejs/plugin-react` babel plugins for development mode
**Main Entry**: Initialize `@locator/runtime` with `setupLocator()` in development only
