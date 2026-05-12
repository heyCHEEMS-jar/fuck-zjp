import reactPlugin from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd())
	return {
		plugins: [reactPlugin()],
		server: {
			port: Number(env.VITE_DEV_PORT) || 3000
		}
	}
})
