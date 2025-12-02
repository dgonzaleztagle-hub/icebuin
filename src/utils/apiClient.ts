import type { Product } from './excelParser';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://icebuin.vercel.app/api'
  : 'http://localhost:3000/api';

export async function getAllProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) {
      console.error('Failed to fetch products from API');
      return [];
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function uploadProductsFromExcel(products: Product[]): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(products),
    });
    
    if (!response.ok) {
      console.error('Failed to upload products');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error uploading products:', error);
    return false;
  }
}

export async function updateProduct(sku: string, updates: Partial<Product>): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sku, ...updates }),
    });
    
    if (!response.ok) {
      console.error('Failed to update product');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    return false;
  }
}

export async function deleteProduct(sku: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/products?sku=${sku}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      console.error('Failed to delete product');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}
