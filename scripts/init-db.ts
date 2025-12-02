import { sql } from '@vercel/postgres';

async function initializeDatabase() {
  try {
    console.log('Iniciando base de datos...');
    
    // Crear tabla si no existe
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        sku VARCHAR(50) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        precioUnit DECIMAL(10, 2),
        precioMayor DECIMAL(10, 2),
        umbralMayor INT,
        favorito BOOLEAN DEFAULT false,
        superfavorito BOOLEAN DEFAULT false,
        visible BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    console.log('✅ Tabla de productos creada exitosamente');
    
    // Crear índices para consultas más rápidas
    await sql`
      CREATE INDEX IF NOT EXISTS idx_categoria ON products(categoria);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_visible ON products(visible);
    `;
    
    console.log('✅ Índices creados exitosamente');
    
    // Contar productos existentes
    const result = await sql`SELECT COUNT(*) as count FROM products;`;
    const count = (result.rows[0] as { count: string }).count;
    console.log(`✅ Base de datos lista. Productos actuales: ${count}`);
    
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    process.exit(1);
  }
}

initializeDatabase();
