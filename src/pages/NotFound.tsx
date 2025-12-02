export function NotFound() {
  return (
    <div className="min-h-screen text-white flex items-center justify-center bg-hero-gradient">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-[#f442ff] to-[#4ef3ff] bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-2xl mb-8 text-white/80">Página no encontrada</p>
        <p className="text-lg text-white/60 mb-8">
          Lo sentimos, la página que buscas no existe.
        </p>
        <a
          href="/"
          className="inline-block px-8 py-3 bg-gradient-to-r from-[#f442ff] to-[#4ef3ff] rounded-lg font-semibold hover:shadow-glow transition-all"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  )
}
