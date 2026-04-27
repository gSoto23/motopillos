"use server";
import { prisma } from '@/lib/prisma';

export async function getBrands() {
  return await prisma.brands.findMany({
    orderBy: { name: 'asc' }
  });
}

// Devuelve los vehículos dado el ID de una marca. 
// Opcional agrupar por año o modelos.
export async function getVehicles(brandId) {
  return await prisma.vehicles.findMany({
    where: { brand_id: brandId },
    orderBy: [
      { year: 'desc' },
      { model_name: 'asc' }
    ]
  });
}

// Devuelve una lista de años distintos disponibles para una marca
export async function getYearsByBrand(brandId) {
  const vehicles = await prisma.vehicles.findMany({
    where: { brand_id: brandId },
    select: { year: true },
    distinct: ['year'],
    orderBy: { year: 'asc' }
  });
  return vehicles.map(v => v.year);
}

// Devuelve los vehículos para una marca y año específicos
export async function getVehiclesByYear(brandId, year) {
  return await prisma.vehicles.findMany({
    where: { 
      brand_id: brandId,
      year: year
    },
    orderBy: { model_name: 'asc' }
  });
}

// Devuelve metadata de un solo vehiculo específico
export async function getVehicle(vehicleId) {
  return await prisma.vehicles.findUnique({
    where: { id: vehicleId }
  });
}

export async function getCategoriesByVehicle(vehicleId) {
  return await prisma.categories.findMany({
    where: { vehicle_id: vehicleId },
    orderBy: { name: 'asc' }
  });
}

// Devuelve el Diagrama exacto con sus Piezas y Precios
export async function getDiagramAndParts(categoryId) {
  try {
    const diagram = await prisma.categories.findUnique({
      where: { id: categoryId }
    });
    
    if (!diagram) return { diagram: null, parts: [] };
    
    // Obtener los repuestos cruzando la tabla pivote
    const partsMapping = await prisma.category_products.findMany({
      where: { category_id: categoryId },
      include: {
        products: true
      }
    });

    // Aplanamos la data y ordenamos por el número de referencia
    let parts = partsMapping.map(p => ({
      diagram_ref: p.diagram_ref_number,
      sku: p.products.sku,
      name: p.products.name,
      price: p.products.current_price
    }));

    parts.sort((a, b) => {
      const numA = parseInt(a.diagram_ref?.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.diagram_ref?.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

    return { diagram, parts };
  } catch (error) {
    console.error("Error fetching diagram parts:", error);
    return { diagram: null, parts: [] };
  }
}

// Búsqueda global de Vehículos (Marcas y Modelos)
export async function searchVehicles(query) {
  if (!query || query.length < 2) return [];
  
  try {
    const results = await prisma.vehicles.findMany({
      where: {
        OR: [
          { model_name: { contains: query } },
          { brands: { name: { contains: query } } }
        ]
      },
      include: { brands: true },
      take: 6,
      orderBy: { year: 'desc' }
    });
    
    // Devolvemos objetos simplificados listos para render
    return results.map(v => ({
      id: v.id,
      brand: v.brands.name,
      year: v.year,
      model: v.model_name
    }));
  } catch (err) {
    console.error("Search error:", err);
    return [];
  }
}
