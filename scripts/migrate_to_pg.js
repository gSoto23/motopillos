const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize Prisma (connected to PostgreSQL via .env DATABASE_URL)
const prisma = new PrismaClient();

// Connect manually to the old SQLite database
const dbPath = path.resolve(__dirname, '../motopillos_catalog.db');
const sqlite = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

// Helper function to query SQLite using Promises
function queryOldDb(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqlite.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function startMigration() {
  console.log("🚀 Iniciando el Bombeo de Datos: SQLite -> PostgreSQL AWS");
  try {
    // 1. App Configurations
    console.log("➡️ Migrando AppConfiguration...");
    const configs = await queryOldDb('SELECT * FROM AppConfiguration');
    if (configs.length > 0) {
      // Postgres usa DateTime estándar. Parsear SQLite ISO
      const configPayload = configs.map(c => ({
        id: c.id,
        key: c.key,
        marginMultiplier: c.marginMultiplier,
        baseShippingCost: c.baseShippingCost,
        exchangeRate: c.exchangeRate,
        sinpePhone: c.sinpePhone,
        sinpeName: c.sinpeName,
        transferAccount: c.transferAccount,
        transferName: c.transferName,
        lastUpdated: new Date(c.lastUpdated)
      }));
      await prisma.AppConfiguration.createMany({ data: configPayload, skipDuplicates: true });
    }
    console.log(`✅ AppConfiguration migrado. (${configs.length} records)`);

    // 2. Brands
    console.log("➡️ Migrando Brands...");
    const brands = await queryOldDb('SELECT * FROM brands');
    if (brands.length > 0) {
      await prisma.brands.createMany({ data: brands, skipDuplicates: true });
    }
    console.log(`✅ Brands migradas. (${brands.length} records)`);

    // 3. Vehicles
    console.log("➡️ Migrando Vehicles...");
    const vehiclesRows = await queryOldDb('SELECT * FROM vehicles');
    if (vehiclesRows.length > 0) {
      // Chunk insertions for postgres to avoid memory/parameter limits
      const chunkSize = 2000;
      for (let i = 0; i < vehiclesRows.length; i += chunkSize) {
        const chunk = vehiclesRows.slice(i, i + chunkSize);
        await prisma.vehicles.createMany({ data: chunk, skipDuplicates: true });
        console.log(`   Vehicles chunk ${i} - ${i+chunkSize}...`);
      }
    }
    console.log(`✅ Vehicles migrados. (${vehiclesRows.length} records)`);

    // 4. Products
    console.log("➡️ Migrando Products...");
    const productsRows = await queryOldDb('SELECT * FROM products');
    if (productsRows.length > 0) {
      const chunkSize = 5000;
      for (let i = 0; i < productsRows.length; i += chunkSize) {
        const chunk = productsRows.slice(i, i + chunkSize);
        await prisma.products.createMany({ data: chunk, skipDuplicates: true });
        if (i % 25000 === 0) console.log(`   Products chunk ${i}...`);
      }
    }
    console.log(`✅ Products migrados. (${productsRows.length} records)`);

    // 5. Categories (Diagrams)
    console.log("➡️ Migrando Categories (Diagramas)...");
    const categoriesRows = await queryOldDb('SELECT * FROM categories');
    if (categoriesRows.length > 0) {
      const chunkSize = 2000;
      for (let i = 0; i < categoriesRows.length; i += chunkSize) {
        const chunk = categoriesRows.slice(i, i + chunkSize);
        await prisma.categories.createMany({ data: chunk, skipDuplicates: true });
        if (i % 10000 === 0) console.log(`   Categories chunk ${i}...`);
      }
    }
    console.log(`✅ Categories (Diagramas) migrados. (${categoriesRows.length} records)`);

    // 6. Category_Products (Pivote y Coordenadas)
    console.log("➡️ Migrando Category_Products (Piezas en Diagramas)...");
    const categoryProductsRows = await queryOldDb('SELECT * FROM category_products');
    if (categoryProductsRows.length > 0) {
      const chunkSize = 5000;
      for (let i = 0; i < categoryProductsRows.length; i += chunkSize) {
        const chunk = categoryProductsRows.slice(i, i + chunkSize);
        await prisma.category_products.createMany({ data: chunk, skipDuplicates: true });
        if (i % 50000 === 0) console.log(`   Category_Products chunk ${i}...`);
      }
    }
    console.log(`✅ Category_Products migrados. (${categoryProductsRows.length} records)`);

    console.log("🎉✨ MIGRACIÓN TOTAL FINALIZADA CON ÉXITO.");
  } catch (error) {
    console.error("❌ ERROR CRÍTICO DURANTE LA MIGRACIÓN:", error);
  } finally {
    sqlite.close();
    await prisma.$disconnect();
  }
}

startMigration();
