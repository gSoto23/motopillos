const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, '..', 'scraper', 'output', 'v3-exact-2024-cbr600rr-6a.json');
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`Starting ingestion for ${data.make} ${data.year} ${data.model}`);

  const category = await prisma.category.upsert({
    where: { slug: data.category },
    update: {},
    create: { slug: data.category, name: data.category.charAt(0).toUpperCase() + data.category.slice(1) },
  });

  const makeSlug = data.make.toLowerCase();
  const make = await prisma.make.upsert({
    where: { slug: makeSlug },
    update: {},
    create: { slug: makeSlug, name: data.make, categoryId: category.id },
  });

  const yearInt = parseInt(data.year, 10);
  const modelYear = await prisma.modelYear.upsert({
    where: { year_makeId: { year: yearInt, makeId: make.id } },
    update: {},
    create: { year: yearInt, makeId: make.id },
  });

  const vehicleModel = await prisma.vehicleModel.upsert({
    where: { slug_yearId: { slug: data.model_slug, yearId: modelYear.id } },
    update: { name: data.model },
    create: { slug: data.model_slug, name: data.model, yearId: modelYear.id },
  });

  let partsAdded = 0;
  for (const comp of data.components) {
    const compSlug = comp.url.split('/').pop();
    const assembly = await prisma.componentAssembly.upsert({
      where: { slug_modelId: { slug: compSlug, modelId: vehicleModel.id } },
      update: { name: comp.name, diagramUrl: comp.diagramUrl || null },
      create: { slug: compSlug, name: comp.name, diagramUrl: comp.diagramUrl || null, modelId: vehicleModel.id },
    });

    // CRITICAL BUG FIX: Wipe existing parts for this assembly to prevent duplications across seed iteration runs
    await prisma.part.deleteMany({
      where: { assemblyId: assembly.id }
    });

    if (comp.parts_list && comp.parts_list.length > 0) {
      for (const partRow of comp.parts_list) {
        
        // Literal regex to match newline, tab, and pipe pipe control chars
        const separatorRegex = /[\n\t\|]+/;
        const cols = partRow.raw_text.split(separatorRegex).map(s => s.trim()).filter(Boolean);
        
        if (cols.length >= 4) {
          const refNumber = cols[0].replace(/[^0-9A-Za-z-]/g, ''); 
          const name = cols[1];
          const partNumber = cols[2];
          const stockStatus = cols[3];
          
          let salePrice = 0.0;
          let msrp = 0.0;
          
          const priceCols = cols.slice(4).filter(c => c.startsWith('$'));
          if (priceCols.length === 1) {
            salePrice = parseFloat(priceCols[0].replace('$', '').replace(',', ''));
            msrp = salePrice;
          } else if (priceCols.length >= 2) {
            salePrice = parseFloat(priceCols[0].replace('$', '').replace(',', ''));
            msrp = parseFloat(priceCols[1].replace('$', '').replace(',', ''));
          }
          
          if (!partNumber || partNumber.length < 4) continue;
          
          // Match Hotspot coordinates from V2 Spider
          let hX = null, hY = null;
          if (comp.hotspots) {
             const hs = comp.hotspots.find(h => h.refNumber == refNumber);
             if (hs) {
               hX = hs.percX;
               hY = hs.percY;
             }
          }
          
          await prisma.part.create({
            data: {
              refNumber,
              partNumber,
              name,
              basePriceSale: salePrice,
              basePriceMSRP: msrp,
              stockStatus,
              hotspotX: hX,
              hotspotY: hY,
              assemblyId: assembly.id
            }
          });
          partsAdded++;
        }
      }
    }
  }

  console.log(`Ingestion complete! Added ${data.components.length} components assemblies and ${partsAdded} individual parts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
