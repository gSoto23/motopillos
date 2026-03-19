export const dummyMakes = ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki'];
export const dummyYears = ['2024', '2023', '2022', '2021', '2020'];
export const dummyModels = {
  'Honda': ['CBR600RR', 'CBR1000RR', 'CB650R'],
  'Yamaha': ['YZF-R6', 'YZF-R1', 'MT-09'],
  'Kawasaki': ['Ninja ZX-6R', 'Ninja ZX-10R', 'Z900'],
  'Suzuki': ['GSX-R600', 'GSX-R1000', 'SV650']
};
export const dummyComponents = [
  { id: 'air-cleaner', name: 'Filtro de Aire' },
  { id: 'cylinder-head', name: 'Cabeza del Cilindro' },
  { id: 'clutch', name: 'Embrague' },
  { id: 'exhaust', name: 'Escape / Muflas' },
  { id: 'front-brake', name: 'Frenos Delanteros' },
  { id: 'suspension', name: 'Suspensión Trasera' },
];
export const formatCategoryTitle = (category) => {
  return category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};
