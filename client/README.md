# YTtoText Client

React-based frontend for the YouTube to Text Blog Generator application.

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **React Router 7** for routing
- **Tailwind CSS** for styling
- **React Query** for server state management
- **Axios** for API calls
- **Lucide React** for icons
- **Vite** for build tooling

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Create environment file:**

Copy `.env.example` to `.env` and configure:

```bash
cp env.example .env
```

Environment variables:

```env
VITE_API_URL=http://localhost:5000/api
```

3. **Start the development server:**

```bash
npm run dev
```

The application will be available at http://localhost:3000

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   └── layouts/         # Layout components
│       ├── ProtectedLayout.tsx
│       └── RootLayout.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
├── hooks/               # Custom React hooks
├── pages/               # Page components
│   ├── BlogPostPage.tsx
│   ├── BlogPostsPage.tsx
│   ├── DashboardPage.tsx
│   ├── ErrorPage.tsx
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── ProcessVideoPage.tsx
│   ├── ProfilePage.tsx
│   ├── RegisterPage.tsx
│   └── StatsPage.tsx
├── services/            # API service functions
│   ├── api.ts          # Base API configuration
│   ├── authService.ts  # Authentication services
│   ├── postService.ts  # Blog post services
│   └── videoService.ts # Video processing services
├── types/               # TypeScript type definitions
│   └── index.ts        # Shared types
├── utils/               # Utility functions
│   └── cn.ts           # Class name utility
├── styles/              # Additional styles
├── router.tsx           # React Router configuration
├── main.tsx            # Application entry point
└── index.css           # Global styles with Tailwind
```

## ✨ Features

### Core Features

- **User Authentication** - Login/register with JWT tokens
- **YouTube Video Processing** - Submit URLs for AI processing
- **Blog Post Management** - CRUD operations for generated content
- **Export Functionality** - Export posts in Markdown, HTML, PDF formats
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Protected Routes** - Authentication-based route protection
- **Real-time Updates** - Live processing status updates

### UI/UX Features

- Modern, clean interface
- Loading states and error handling
- Toast notifications
- Form validation
- Accessible components
- Dark/light theme support

## 🔐 Authentication

The application uses JWT-based authentication with:

- Secure token storage
- Automatic token refresh
- Protected route components
- Context-based state management

## 🌐 API Integration

### Service Architecture

The client communicates with the backend through organized service modules:

- **authService.ts** - User authentication and profile management
- **videoService.ts** - YouTube video processing and status tracking
- **postService.ts** - Blog post CRUD operations and export

### Error Handling

- Centralized error handling through Axios interceptors
- User-friendly error messages
- Automatic retry for failed requests
- Network error detection

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS with:

- Custom color palette
- Responsive breakpoints
- Component-based styling
- Utility-first approach

### Component Library

Built with reusable components following:

- Consistent design patterns
- Accessibility best practices
- TypeScript for type safety
- Props validation

## 🔧 Development

### Environment Configuration

Environment variables are managed through Vite:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Optional: Custom configuration
VITE_APP_TITLE=YTtoText
VITE_ENABLE_ANALYTICS=false
```

### Code Quality

- **ESLint** for code linting
- **TypeScript** for type checking
- **Prettier** for code formatting
- **Husky** for git hooks (if configured)

### Performance Optimization

- Code splitting with React.lazy
- Image optimization
- Bundle size optimization with Vite
- React Query for efficient data fetching

## 🏗️ Building for Production

### Build Process

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory with:

- Minified and compressed assets
- Optimized images
- Tree-shaken JavaScript
- CSS purging

### Deployment

The built application can be deployed to:

- Vercel (recommended for Vite projects)
- Netlify
- AWS S3 + CloudFront
- Traditional web servers

## 🧪 Testing

### Testing Setup (Future Enhancement)

Recommended testing stack:

- **Vitest** for unit testing
- **React Testing Library** for component testing
- **Cypress** for end-to-end testing
- **MSW** for API mocking

## 🚀 Performance

### Optimization Features

- Lazy loading for route components
- Image optimization
- Efficient re-rendering with React Query
- Minimal bundle size with tree shaking

### Monitoring

Consider integrating:

- Web Vitals monitoring
- Error tracking (Sentry)
- Analytics (Google Analytics)
- Performance monitoring

## 🤝 Contributing

1. Follow the existing code style
2. Write TypeScript for new components
3. Use Tailwind CSS for styling
4. Add proper error handling
5. Test your changes thoroughly

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [React Query Documentation](https://tanstack.com/query/)
