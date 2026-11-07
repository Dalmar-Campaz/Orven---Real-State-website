export interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
}

export let propertiesDB: Property[] = [
  {
    id: 1,
    title: "Casa moderna con piscina",
    location: "El Poblado, Medellín",
    price: "$ 1.250.000.000",
    bedrooms: 4,
    bathrooms: 3,
    area: 280,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Apartamento con vista a la ciudad",
    location: "Chapinero, Bogotá",
    price: "$ 650.000.000",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Casa campestre",
    location: "La Calera, Cundinamarca",
    price: "$ 980.000.000",
    bedrooms: 4,
    bathrooms: 3,
    area: 240,
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Apartamento familiar",
    location: "Envigado, Antioquia",
    price: "$ 452.800.000",
    bedrooms: 2,
    bathrooms: 2,
    area: 85,
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&auto=format&fit=crop",
  },
];

export let pendingPropertiesDB: Property[] = [
  {
    id: 5,
    title: "Casa en la playa",
    location: "Santa Marta, Magdalena",
    price: "$ 1.500.000.000",
    bedrooms: 5,
    bathrooms: 4,
    area: 350,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Apartamento en el centro",
    location: "Cali, Valle del Cauca",
    price: "$ 750.000.000",
    bedrooms: 3,
    bathrooms: 2,
    area: 110,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop",
  },
]; 