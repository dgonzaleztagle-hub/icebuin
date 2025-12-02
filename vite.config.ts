import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'image-resolver',
      configureServer(server) {
        server.middlewares.use('/api/image', (req, res) => {
          const url = new URL((req.originalUrl || req.url) ?? '', `http://${req.headers.host ?? 'localhost'}`)
          const sku = url.searchParams.get('sku') || url.pathname.split('/api/image/')[1]

          if (!sku) {
            res.statusCode = 404
            res.end('Not found')
            return
          }

          const imagesDir = path.join(__dirname, 'public', 'images')

          try {
            const files = fs.readdirSync(imagesDir)
            const foundFile = files.find(f =>
              f.toLowerCase().includes(sku.toLowerCase())
            )

            if (foundFile) {
              const filePath = path.join(imagesDir, foundFile)
              const ext = path.extname(foundFile).toLowerCase()
              const mimeTypes: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.webp': 'image/webp',
                '.jfif': 'image/jpeg',
                '.gif': 'image/gif',
              }

              res.setHeader('Content-Type', mimeTypes[ext] || 'image/jpeg')
              res.setHeader('Cache-Control', 'public, max-age=31536000')
              const fileContent = fs.readFileSync(filePath)
              console.log(`✓ Image served: ${foundFile}`)
              res.end(fileContent)
            } else {
              console.log(`✗ Image not found: ${sku} in ${files.slice(0, 5).join(', ')}...`)
              res.statusCode = 404
              res.end('Not found')
            }
          } catch (err) {
            console.error('Image resolver error:', err)
            res.statusCode = 500
            res.end('Error')
          }
        })
      },
    },
  ],
})
