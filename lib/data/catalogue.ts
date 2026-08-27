import type { Produit, ProductCategory, Service, ServiceCategory } from "@/lib/data/types";

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: "coiffure", name: "Coiffure" },
  { id: "manucure-pedicure", name: "Manucure / Pédicure" },
  { id: "onglerie", name: "Onglerie" },
  { id: "spa", name: "Spa & Massages" },
  { id: "soins-visage", name: "Soins Visage" },
  { id: "epilation", name: "Épilation" },
];

export const SERVICES: Service[] = [
  { id: "srv-1", categoryId: "coiffure", name: "Brushing", price: 8000, durationMinutes: 45, active: true },
  { id: "srv-2", categoryId: "coiffure", name: "Coloration racine", price: 25000, durationMinutes: 90, active: true },
  { id: "srv-3", categoryId: "coiffure", name: "Défrisage Beauty and Co", price: 49000, durationMinutes: 150, active: true },
  { id: "srv-4", categoryId: "coiffure", name: "Tissage versatile", price: 56000, durationMinutes: 120, active: true },
  { id: "srv-5", categoryId: "coiffure", name: "Coupe + brushing", price: 12000, durationMinutes: 60, active: true },
  { id: "srv-6", categoryId: "manucure-pedicure", name: "Manucure russe", price: 20000, durationMinutes: 60, active: true },
  { id: "srv-7", categoryId: "manucure-pedicure", name: "Pédicure spa", price: 18000, durationMinutes: 50, active: true },
  { id: "srv-8", categoryId: "onglerie", name: "Pose gel", price: 25000, durationMinutes: 75, active: true },
  { id: "srv-9", categoryId: "onglerie", name: "Nail art (par ongle)", price: 2000, durationMinutes: 10, active: true },
  { id: "srv-10", categoryId: "spa", name: "Massage relaxant 60min", price: 30000, durationMinutes: 60, active: true },
  { id: "srv-11", categoryId: "soins-visage", name: "Soin hydratant visage", price: 22000, durationMinutes: 50, active: true },
  { id: "srv-12", categoryId: "epilation", name: "Épilation jambes complètes", price: 15000, durationMinutes: 40, active: true },
];

export function serviceById(id: string) {
  return SERVICES.find((s) => s.id === id);
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: "capillaire", name: "Capillaire" },
  { id: "soins-corps", name: "Soins Corps" },
  { id: "ongles", name: "Ongles" },
  { id: "maquillage", name: "Maquillage" },
];

export const PRODUITS: Produit[] = [
  { id: "prd-1", categoryId: "capillaire", name: "Shampoing Kérastase 300ml", price: 20000, stock: 52, active: true },
  { id: "prd-2", categoryId: "capillaire", name: "Après-shampoing hydratant", price: 18000, stock: 34, active: true },
  { id: "prd-3", categoryId: "ongles", name: "Vernis Rouge Classique", price: 6000, stock: 8, active: true },
  { id: "prd-4", categoryId: "soins-corps", name: "Crème Hydratante Visage", price: 15500, stock: 0, active: true },
  { id: "prd-5", categoryId: "maquillage", name: "Rouge à lèvres mat", price: 9500, stock: 21, active: true },
];
