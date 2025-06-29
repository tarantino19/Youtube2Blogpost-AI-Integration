import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	server: {
		port: 3000,
		// Only use proxy in development mode
		...(mode === 'development' && {
			proxy: {
				'/api': {
					target: 'http://localhost:4001',
					changeOrigin: true,
				},
			},
		}),
	},
	build: {
		// CRITICAL: Disable source maps to prevent source code exposure in ALL modes
		sourcemap: false,
		// Minimize bundle size and remove debug info
		minify: mode === 'production' ? 'terser' : 'esbuild',
		terserOptions:
			mode === 'production'
				? {
						compress: {
							drop_console: true,
							drop_debugger: true,
						},
				  }
				: undefined,
	},
	// CRITICAL: Also disable sourcemaps in development mode
	css: {
		devSourcemap: false,
	},
	esbuild: {
		// Remove console.log and debugger in both development and production
		drop: ['console', 'debugger'],
	},
	define: {
		// Remove development tools in production
		__DEV__: mode === 'development',
	},
}));
