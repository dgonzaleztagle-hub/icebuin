import { BrowserRouter, Route, Routes } from "react-router-dom"
import { useMemo, useState } from "react"
import { mockProducts, type Product } from "./data/mockProducts"
import { getImagePath } from "./utils/imageLoader"

function ProductCard({
  product,
  onSelect,
}: {
  product: Product
  onSelect: (p: Product) => void
}) {
  return (
    <div
      className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 cursor-pointer hover:border-[#f442ff] hover:shadow-[0_0_20px_rgba(244,66,255,0.3)]"
      onClick={() => onSelect(product)}
    >
      <div className="card-surface p-0 flex flex-col overflow-hidden">
        <div className="relative overflow-hidden h-56 w-full">
          <img
            src={getImagePath(product.sku)}
            alt={product.nombre}
            className="h-full w-full object-contain object-center bg-white transition-transform duration-500 group-hover:scale-110 rounded-t-[16px]"
            onError={(e) => {
              // Si la imagen no existe, mostrar placeholder
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ffffff" width="400" height="300"/%3E%3C/svg%3E'
            }}
          />
        </div>
        <div className="p-7 flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-white leading-tight group-hover:text-[#f442ff] transition-colors">{product.nombre}</h3>
          <p className="text-sm text-[#4ef3ff]">¡Oferta especial! 🎉</p>
        </div>
      </div>
    </div>
  )
}

function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const hasMayorista = product.precioMayor && product.precioMayor > 0
  
  // Buscar archivo de imagen por SKU
  const getImagePath = (sku: string) => {
    const skuNum = parseInt(sku)
    const imageName = `SKU${String(skuNum).padStart(4, '0')}`
    return `/api/image/${imageName}`
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-sm bg-modal-bg rounded-2xl shadow-glow-strong border border-white/8 modal-anim overflow-hidden relative">
        {/* Degradado de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f442ff]/5 to-[#4ef3ff]/5 pointer-events-none" />
        
        <div className="relative overflow-hidden">
          <img
            src={getImagePath(product.sku)}
            alt={product.nombre}
            className="h-48 w-full object-contain object-center bg-white"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ffffff" width="400" height="300"/%3E%3C/svg%3E'
            }}
          />
          {/* Degradado oscuro sobre la imagen */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b12] to-transparent" />
          {/* Botón cerrar sobre la imagen */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition z-20"
          >
            ✕
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 relative">
          <h2 className="text-2xl font-bold text-center text-white font-display">{product.nombre}</h2>
          <div className="space-y-3">
            <div className="rounded-lg border-2 border-[#f442ff]/30 bg-[#f442ff]/5 p-5 text-center transform hover:scale-105 transition-transform cursor-pointer">
              <div className="text-white/60 text-xs uppercase tracking-wide mb-3 flex items-center justify-center gap-2">
                <span>🛒</span>
                <span>Precio Individual</span>
              </div>
              <div className="text-4xl font-extrabold text-[#f442ff] drop-shadow-[0_0_10px_rgba(244,66,255,0.5)]">
                ${product.precioUnit.toLocaleString("es-CL")}
              </div>
            </div>

            <div className={`rounded-lg border-2 p-5 text-center transform hover:scale-105 transition-transform cursor-pointer ${
              hasMayorista 
                ? "border-[#4ef3ff]/30 bg-[#4ef3ff]/5" 
                : "border-white/10 bg-white/5"
            }`}>
              <div className="text-white/60 text-xs uppercase tracking-wide mb-3 flex items-center justify-center gap-2">
                <span>❄️</span>
                <span>Precio al por Mayor</span>
              </div>
              <div className={`text-4xl font-extrabold mb-3 drop-shadow-[0_0_10px_rgba(78,243,255,0.5)] ${
                hasMayorista ? "text-[#4ef3ff]" : "text-white/50"
              }`}>
                {hasMayorista ? `$${product.precioMayor?.toLocaleString("es-CL")}` : "No aplica"}
              </div>
              {hasMayorista && (
                <div className="inline-block bg-[#4ef3ff]/20 text-[#4ef3ff] text-xs font-bold px-3 py-1 rounded-full">
                  ¡AHORRA MÁS! ❄️
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CategoryMenu({
  selected,
  onChange,
  categories,
}: {
  selected: string
  onChange: (cat: string) => void
  categories: string[]
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((cat) => {
        const active = selected === cat
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`px-4 py-2 rounded-full text-sm border transition ${
              active
                ? "border-[#f442ff]/60 text-white bg-[#f442ff]/15 shadow-glow"
                : "border-white/10 text-white/70 hover:border-white/30"
            }`}
          >
            {cat === "todos" ? "Todos" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        )
      })}
    </div>
  )
}

function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [search, setSearch] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const logoSrc = "/logoicebuin.jpg"

  // Cargar productos desde localStorage o usar mockProducts
  const products = useMemo(() => {
    if (typeof window === 'undefined') return mockProducts
    
    const stored = localStorage.getItem('ice_buin_products')
    if (stored) {
      try {
        return JSON.parse(stored) as Product[]
      } catch {
        return mockProducts
      }
    }
    return mockProducts
  }, [])

  // Extraer categorías dinámicamente
  const availableCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.categoria))
    return ["todos", ...Array.from(cats).sort()]
  }, [products])

  const filtered = useMemo(() => {
    return products
      .filter((p) => p.visible !== false)
      .filter((p) => selectedCategory === "todos" || p.categoria === selectedCategory)
      .filter((p) => p.nombre.toLowerCase().includes(search.toLowerCase()))
  }, [selectedCategory, search, products])

  const ordered = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const prio = (p: Product) => (p.superfavorito ? 0 : p.favorito ? 1 : 2)
      const diff = prio(a) - prio(b)
      if (diff !== 0) return diff
      return a.nombre.localeCompare(b.nombre)
    })
  }, [filtered])

  const destacados = ordered.slice(0, 5)

  return (
    <div className="min-h-screen text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient -z-10" />
        <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-20 h-12">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#f442ff] via-[#f442ff55] to-[#4ef3ff] blur-[1px]" />
              <div className="absolute inset-[2px] rounded-lg bg-[#0c0b12]" />
              <img
                src={logoSrc}
                alt="Ice Buin"
                className="relative w-full h-full rounded-lg overflow-hidden border-2 border-[#f442ff]/30 object-cover shadow-[0_0_20px_hsl(320_100%_65%/0.3)]"
              />
            </div>
            <div>
              <div className="text-lg font-bold text-white">Ice Buin</div>
              <div className="text-sm text-white/60">Congelados neon</div>
            </div>
          </div>
          <nav className="hidden md:flex gap-4 text-sm text-white/70">
            <a className="hover:text-white" href="#destacados">
              Destacados
            </a>
            <a className="hover:text-white" href="#catalogo">
              Catálogo
            </a>
            <a className="hover:text-white" href="#visitanos">
              Visítanos
            </a>
          </nav>
        </header>

        <section className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-gradient-to-b from-[#f442ff]/5 via-transparent to-transparent" />
          <div className="max-w-6xl mx-auto px-4 py-10 text-center relative">
            <div className="inline-flex px-4 py-2 rounded-full border border-white/10 text-white/70 text-sm bg-white/5 backdrop-blur">
              ❄️ Congelados a precios irresistibles
            </div>
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="relative w-56 h-32">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#f442ff] via-[#f442ff44] to-[#4ef3ff] shadow-[0_0_50px_hsl(320_100%_65%/0.4)] blur-[1px]" />
                <div className="absolute inset-[4px] rounded-xl bg-[#0c0b12]" />
                <img
                  src={logoSrc}
                  alt="Ice Buin"
                  className="relative w-full h-full rounded-xl overflow-hidden border-4 border-[#f442ff]/30 shadow-[0_0_50px_hsl(320_100%_65%/0.3)] object-cover"
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-display bg-gradient-to-r from-[#f442ff] via-[#b442ff] to-[#4ef3ff] bg-clip-text text-transparent drop-shadow-[0_0_20px_hsl(320_100%_65%/0.3)]">
                Ice Buin
              </h1>
              <p className="text-white/70 max-w-2xl mx-auto">
                Catálogo neon con tus favoritos. Filtra por categoría, busca productos y abre modales con precios
                al detalle y mayorista.
              </p>
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <a
                href="#catalogo"
                className="px-5 py-3 rounded-full bg-gradient-to-r from-[#f442ff] to-[#4ef3ff] text-[#0a0a10] font-semibold shadow-[0_0_20px_hsl(320_100%_65%/0.3)] hover:opacity-90 transition"
              >
                Ver catálogo
              </a>
              <a
                href="https://wa.me/56955159677"
                className="px-5 py-3 rounded-full border border-white/15 text-white/80 hover:border-white/40 hover:text-white transition"
                target="_blank"
                rel="noreferrer"
              >
                Pedir por WhatsApp
              </a>
            </div>
            </div>
        </section>
      </div>

      <section id="destacados" className="max-w-6xl mx-auto px-0 py-10">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-2xl font-bold text-white">Productos Destacados</h2>
          <div className="text-white/60 text-sm">Favoritos primero</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {destacados.map((p) => (
            <ProductCard key={p.sku} product={p} onSelect={setSelectedProduct} />
          ))}
        </div>
      </section>

      <section id="catalogo" className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-2xl font-bold text-white">Catálogo</h2>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-72 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#f442ff]/60"
            />
          </div>
        </div>
        <CategoryMenu selected={selectedCategory} onChange={setSelectedCategory} categories={availableCategories} />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {ordered.map((p) => (
            <ProductCard key={p.sku} product={p} onSelect={setSelectedProduct} />
          ))}
          {!ordered.length && (
            <div className="text-white/60 text-sm col-span-full text-center py-10">Sin resultados</div>
          )}
        </div>
      </section>

      <section id="visitanos" className="max-w-6xl mx-auto px-4 py-12 text-center text-white/70">
        <div className="glass inline-flex flex-col gap-2 px-6 py-5 rounded-2xl">
          <div className="text-white font-semibold">Visítanos</div>
          <div>Gabriel Cruz 1762, Buin Oriente, Región Metropolitana, Chile</div>
          <div>📞 +56 9 5515 9677</div>
        </div>
      </section>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}
