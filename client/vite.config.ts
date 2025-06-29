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
		// Disable source maps in production for security
		sourcemap: mode === 'development',
		// Minimize bundle size and remove debug info
		minify: mode === 'production' ? 'terser' : false,
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
	define: {
		// Remove development tools in production
		__DEV__: mode === 'development',
	},
}));
