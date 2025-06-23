# YTtoText Client

React-based frontend for the YouTube to Text Blog Generator application.

## Tech Stack

- React 18 with TypeScript
- React Router 7 for routing
- Tailwind CSS for styling
- React Query for server state management
- Axios for API calls
- Lucide React for icons
- Vite for build tooling

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example`:

```bash
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/      # Reusable UI components
│   └── layouts/    # Layout components
├── contexts/       # React contexts (Auth)
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API service functions
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── router.tsx      # React Router configuration
├── main.tsx        # Application entry point
└── index.css       # Global styles
```

## Features

- User authentication (login/register)
- YouTube video URL processing
- AI-powered blog post generation
- Blog post management (CRUD operations)
- Export functionality (Markdown, HTML, PDF)
- Responsive design
- Protected routes
- Real-time processing status

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.
