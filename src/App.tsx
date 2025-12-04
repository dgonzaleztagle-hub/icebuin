import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom"
import { useMemo, useState, type ChangeEvent, useEffect } from "react"
import { mockProducts, type Product } from "./data/mockProducts"
import { parseExcelFile, processProducts } from "./utils/excelParser"
import { getImagePath } from "./utils/imageLoader"
import { getAllProducts, uploadProductsFromExcel, uploadDescriptions } from "./utils/apiClient"
import { NotFound } from "./pages/NotFound"

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
            alt={`${product.nombre} - ${product.categoria} congelado - distribuidor mayorista`}
            title={product.nombre}
            loading="lazy"
            className="h-full w-full object-contain object-center bg-white transition-transform duration-500 group-hover:scale-110 rounded-t-[16px]"
            onError={(e) => {
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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-sm bg-modal-bg rounded-2xl shadow-glow-strong border border-white/8 modal-anim overflow-hidden relative">
        {/* Degradado de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f442ff]/5 to-[#4ef3ff]/5 pointer-events-none" />
        
        <div className="relative overflow-hidden">
          <img
            src={getImagePath(product.sku)}
            alt={`${product.nombre} - ${product.categoria} congelado - distribuidor mayorista`}
            title={product.nombre}
            loading="lazy"
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

function SuperfavoritoModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  if (!product) return null
  
  const hasMayorista = product.precioMayor && product.precioMayor > 0

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-sm bg-modal-bg rounded-2xl shadow-glow-strong border border-white/8 modal-anim overflow-hidden relative">
        {/* Degradado de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f442ff]/5 to-[#4ef3ff]/5 pointer-events-none" />
        
        <div className="relative overflow-hidden">
          <img
            src={getImagePath(product.sku)}
            alt={`${product.nombre} - SUPER FAVORITO ⭐ - ${product.categoria} congelado - distribuidor mayorista`}
            title={product.nombre}
            loading="lazy"
            className="h-48 w-full object-contain object-center bg-white"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ffffff" width="400" height="300"/%3E%3C/svg%3E'
            }}
          />
          {/* Degradado oscuro sobre la imagen */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b12] to-transparent" />
          {/* Botón cerrar sobre la imagen con badge de SUPER FAVORITO */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition z-20 pointer-events-auto"
              >
                ✕
              </button>
            </div>
            <div className="flex justify-center">
              <span className="text-3xl">⭐</span>
            </div>
          </div>
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
  const [superfavoritoModal, setSuperfavoritoModal] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const logoSrc = "/logoicebuin.jpg"

  // Cargar productos desde API (BD en Vercel)
  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      try {
        const apiProducts = await getAllProducts()
        setProducts(apiProducts)
      } catch (error) {
        console.error('Failed to load products:', error)
        setProducts([])
      }
      setLoading(false)
    }
    
    loadProducts()
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

  // Mostrar superfavorito cuando cambia la categoría
  useEffect(() => {
    const superfav = ordered.find(p => p.superfavorito)
    const categoryKey = `superfav_shown_${selectedCategory}`
    
    if (superfav) {
      const hasBeenShown = sessionStorage.getItem(categoryKey)
      if (!hasBeenShown) {
        setSuperfavoritoModal(superfav)
        sessionStorage.setItem(categoryKey, 'true')
      }
    }
  }, [selectedCategory, ordered])

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
        <div className={`flex ${destacados.length > 0 && destacados.length < 5 ? 'justify-center' : ''}`}>
          <div className={`grid gap-4 ${destacados.length < 5 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'}`}>
            {destacados.map((p) => (
              <ProductCard key={p.sku} product={p} onSelect={setSelectedProduct} />
            ))}
          </div>
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
        <div className={`flex ${ordered.length > 0 && ordered.length < 5 ? 'justify-center' : ''}`}>
          <div className={`grid gap-4 mt-6 sm:grid-cols-2 md:grid-cols-3`}>
            {ordered.map((p) => (
              <ProductCard key={p.sku} product={p} onSelect={setSelectedProduct} />
            ))}
            {!ordered.length && (
              <div className="text-white/60 text-sm col-span-full text-center py-10">Sin resultados</div>
            )}
          </div>
        </div>
      </section>

      <section id="visitanos" className="max-w-6xl mx-auto px-4 py-12 text-center text-white/70">
        <div className="glass inline-flex flex-col gap-4 px-6 py-6 rounded-2xl">
          <div className="text-white font-semibold text-lg">Visítanos</div>
          <div className="space-y-2">
            <div>Gabriel Cruz 1762, Buin Oriente, Región Metropolitana, Chile</div>
            <div>📞 +56 9 5515 9677</div>
          </div>
          
          {/* Redes Sociales */}
          <div className="flex gap-4 justify-center mt-4">
            <a
              href="https://www.instagram.com/congelados_icebuin/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f442ff]/20 to-[#4ef3ff]/20 hover:from-[#f442ff]/40 hover:to-[#4ef3ff]/40 rounded-lg transition text-sm"
              title="Síguenos en Instagram"
            >
              <span>📷</span>
              Instagram
            </a>
            <a
              href="https://www.facebook.com/people/Congelados-Icebuin/pfbid0MwDddDjFTMJqtFJVJeggp94eyhCTegx6Gto4Z8gctiYjvw2KBXerzx1BbWeAUXtnl/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f442ff]/20 to-[#4ef3ff]/20 hover:from-[#f442ff]/40 hover:to-[#4ef3ff]/40 rounded-lg transition text-sm"
              title="Síguenos en Facebook"
            >
              <span>👍</span>
              Facebook
            </a>
          </div>
        </div>
      </section>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      {superfavoritoModal && <SuperfavoritoModal product={superfavoritoModal} onClose={() => setSuperfavoritoModal(null)} />}
    </div>
  )
}

function AdminPage() {
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [imagesCount, setImagesCount] = useState<number>(0)
  const [status, setStatus] = useState<string>("")
  const [loadedProducts, setLoadedProducts] = useState<Product[]>([])
  const [descriptionsFile, setDescriptionsFile] = useState<File | null>(null)
  const [descriptionsStatus, setDescriptionsStatus] = useState<string>("")
  const navigate = useNavigate()

  const handleExcel = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setExcelFile(file)
      setStatus("Leyendo Excel...")
      try {
        const products = await parseExcelFile(file)
        const processedProducts = processProducts(products)
        setLoadedProducts(processedProducts)
        setStatus(`✓ ${processedProducts.length} productos cargados correctamente`)
      } catch (error) {
        setStatus(`✗ Error: ${error instanceof Error ? error.message : "Error desconocido"}`)
      }
    }
  }

  const handleImages = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    setImagesCount(files ? files.length : 0)
  }

  const handleDescriptionsJSON = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDescriptionsFile(file)
      setDescriptionsStatus(`📄 ${file.name} seleccionado`)
    }
  }

  const uploadDescriptionsFromJSON = async () => {
    if (!descriptionsFile) {
      setDescriptionsStatus("Selecciona un archivo JSON de descripciones primero.")
      return
    }

    setDescriptionsStatus("Cargando descripciones...")

    try {
      const fileContent = await descriptionsFile.text()
      const data = JSON.parse(fileContent)
      
      if (!data.descriptions || !Array.isArray(data.descriptions)) {
        setDescriptionsStatus("✗ Formato inválido. El archivo debe contener una propiedad 'descriptions' con un array.")
        return
      }

      const result = await uploadDescriptions(data.descriptions)
      
      if (result.success) {
        setDescriptionsStatus(`✓ ${result.updated} descripciones actualizadas exitosamente!`)
      } else {
        setDescriptionsStatus(`✗ Error: ${result.failed} descripciones fallaron.`)
      }
    } catch (error) {
      setDescriptionsStatus(`✗ Error al procesar JSON: ${error instanceof Error ? error.message : "Error desconocido"}`)
    }
  }

  const processUpload = async () => {
    if (!excelFile) {
      setStatus("Sube un Excel primero.")
      return
    }
    if (loadedProducts.length === 0) {
      setStatus("Procesa el Excel primero (presiona nuevamente después de seleccionar).")
      return
    }
    if (imagesCount === 0) {
      setStatus("⚠️ Ninguna imagen subida. Los productos cargarán sin imágenes por ahora.")
    }
    
    setStatus("Guardando productos en la base de datos...")
    
    try {
      const success = await uploadProductsFromExcel(loadedProducts)
      
      if (success) {
        setStatus(`✓ ${loadedProducts.length} productos guardados en BD correctamente! Recarga la página.`)
      } else {
        setStatus(`✗ Error: No se pudieron guardar los productos en la BD.`)
      }
    } catch (error) {
      setStatus(`✗ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  return (
    <div className="min-h-screen text-white bg-hero-gradient px-4">
      <div className="max-w-4xl mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Modo Dios</h1>
            <p className="text-white/70">Importa Excel y actualiza productos automáticamente.</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-3 py-2 rounded-full border border-white/15 text-white/80 hover:text-white hover:border-white/40"
          >
            ← Volver
          </button>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/10 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-lg font-semibold">Importar Catálogo</div>
              <div className="text-white/60 text-sm">Sube Excel con productos e imágenes.</div>
            </div>
            <a
              href="/PRECIOS.xlsx"
              className="text-sm text-[#4ef3ff] hover:underline"
              download
            >
              Descargar ejemplo
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-white/80">Archivo Excel (.xlsx)</span>
              <input
                type="file"
                accept=".xlsx"
                onChange={handleExcel}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
              />
              {excelFile && <span className="text-xs text-white/60">Archivo: {excelFile.name}</span>}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-white/80">Imágenes (.jpg, múltiples)</span>
              <input
                type="file"
                accept=".jpg"
                multiple
                onChange={handleImages}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
              />
              {imagesCount > 0 && (
                <span className="text-xs text-white/60">{imagesCount} imágenes seleccionadas</span>
              )}
            </label>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-2">
              <div className="text-xs text-white/70 mb-3">
                <strong>Productos cargados:</strong> {loadedProducts.length}
              </div>
              {loadedProducts.length > 0 && (
                <div className="max-h-40 overflow-y-auto">
                  <div className="text-xs space-y-1">
                    {loadedProducts.slice(0, 5).map((p) => (
                      <div key={p.sku} className="text-white/60">
                        {p.nombre} - ${p.precioUnit}
                      </div>
                    ))}
                    {loadedProducts.length > 5 && (
                      <div className="text-white/50 italic">
                        ... y {loadedProducts.length - 5} más
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={processUpload}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#f442ff] to-[#4ef3ff] text-[#0a0a10] font-semibold shadow-glow hover:opacity-90 transition"
            >
              Guardar Productos
            </button>

            {status && (
              <div
                className={`text-sm p-3 rounded-lg ${
                  status.includes("✓")
                    ? "bg-green-500/20 text-green-300 border border-green-500/40"
                    : status.includes("✗")
                      ? "bg-red-500/20 text-red-300 border border-red-500/40"
                      : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                }`}
              >
                {status}
              </div>
            )}
          </div>
        </div>

        {/* Descripciones Section */}
        <div className="glass rounded-2xl p-6 border border-white/10 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-lg font-semibold">📝 Cargar Descripciones SEO</div>
              <div className="text-white/60 text-sm">Sube JSON con descripciones de productos.</div>
            </div>
            <a
              href="product_descriptions.json"
              className="text-sm text-[#4ef3ff] hover:underline"
              download
            >
              Descargar template
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-white/80">Archivo JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleDescriptionsJSON}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
              />
              {descriptionsFile && <span className="text-xs text-white/60">Archivo: {descriptionsFile.name}</span>}
            </label>

            <button
              onClick={uploadDescriptionsFromJSON}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#4ef3ff] to-[#f442ff] text-[#0a0a10] font-semibold shadow-glow hover:opacity-90 transition"
            >
              Cargar Descripciones
            </button>

            {descriptionsStatus && (
              <div
                className={`text-sm p-3 rounded-lg ${
                  descriptionsStatus.includes("✓")
                    ? "bg-green-500/20 text-green-300 border border-green-500/40"
                    : descriptionsStatus.includes("✗")
                      ? "bg-red-500/20 text-red-300 border border-red-500/40"
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                }`}
              >
                {descriptionsStatus}
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/10">
          <div className="text-sm text-white/70">
            <p className="mb-2">
              <strong>Instrucciones:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Descarga el ejemplo o usa tu Excel con la estructura correcta</li>
              <li>Selecciona el archivo Excel con los productos</li>
              <li>(Opcional) Sube las imágenes .jpg correspondientes</li>
              <li>Haz clic en "Guardar Productos"</li>
              <li>(Opcional) Descarga y carga el JSON de descripciones SEO</li>
              <li>Recarga la página principal para ver los cambios</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mododios" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
