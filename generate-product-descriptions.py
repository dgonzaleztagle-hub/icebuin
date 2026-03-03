#!/usr/bin/env python3
"""
Generate SEO descriptions for all products
These will be used for meta tags and structured data
"""

product_descriptions = {
    "vacuno": "Carnes de vacuno congeladas de calidad premium. {} - ideal para distribuidor mayorista. Presentación congelada para máxima preservación.",
    "cerdo": "Carne de cerdo congelada {} de excelente calidad. Perfecta para negocio mayorista. Mantiene propiedades nutricionales al congelarse.",
    "pollo": "Pollo congelado de primera calidad {}. Producto sanitario apto para distribuidor. Ideal para restaurantes y negocios de comidas.",
    "mariscos": "Mariscos congelados importados {}. Premium quality seafood. Perfecto para mayorista en Santiago.",
    "helados": "Helado congelado {} de marcas reconocidas. Variedad de sabores para negocio mayorista. Disponible en presentación mayorista.",
    "papas": "Papas congeladas {} procesadas y listas para usar. Ideal para industria de comidas rápidas.",
    "verduras": "Verduras congeladas {} preservadas en óptimas condiciones. Perfectas para distribuidor mayorista en Santiago.",
    "frutas": "Frutas congeladas {} de calidad. Ideales para postres y bebidas. Distribuidor mayorista.",
    "pizzas": "Pizzas congeladas {} lista para hornear. Perfectas para distribuidor mayorista. Variedad de sabores.",
    "otros": "Productos congelados variados {}. Calidad garantizada para distribuidor mayorista."
}

# Palabras clave por categoría para SEO
seo_keywords = {
    "vacuno": ["carnes vacuno", "churrasco congelado", "hamburguesa", "carne molida"],
    "cerdo": ["carne cerdo", "salchicha", "chuleta congelada"],
    "pollo": ["pollo congelado", "nuggets", "suprema"],
    "mariscos": ["mariscos congelados", "camarones", "mariscos import"],
    "helados": ["helados", "helados mayorista", "cassata"],
    "papas": ["papas congeladas", "papas pre-fritas"],
    "verduras": ["verduras congeladas", "verduras", "mezcla"],
    "frutas": ["frutas congeladas", "pulpa fruta"],
    "pizzas": ["pizza congelada", "pizza"],
    "otros": ["congelados", "productos congelados"]
}

def generate_description(product_name, categoria):
    """Generate SEO description for a product"""
    template = product_descriptions.get(categoria, product_descriptions["otros"])
    
    # Create a shortened product name for the description
    short_name = product_name[:50] if len(product_name) > 50 else product_name
    
    description = template.format(short_name)
    
    # Add SEO keywords naturally
    keywords = seo_keywords.get(categoria, [])
    if keywords:
        description = f"{description} Distribuidor mayorista de {keywords[0].lower()} en Santiago."
    
    # Ensure description is under 160 characters for meta tag
    if len(description) > 160:
        description = description[:157] + "..."
    
    return description

# For reference - these will be used in DB update script
print("Product description generator ready.")
print("Use this to create descriptions for all 146 products.")
