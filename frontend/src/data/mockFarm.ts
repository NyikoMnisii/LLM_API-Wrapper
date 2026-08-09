export interface Crop {
  id: string;
  name: string;
  emoji: string;
  plantedOn: string;
  status: "Healthy" | "At Risk" | "Needs Attention";
  fieldId: string;
  notes: string;
}

export interface Field {
  id: string;
  name: string;
  hectares: number;
  crop: string;
  status: "Active" | "Fallow" | "Harvested";
}

export interface Farm {
  name: string;
  status: "Active" | "Inactive";
  location: string;
  hectares: number;
  cropsGrown: number;
  fieldsCount: number;
  daysActive: number;
  establishedOn: string;
  farmType: string;
}

export const mockFarm: Farm = {
  name: "Mnisi Farm",
  status: "Active",
  location: "Stellenbosch, South Africa",
  hectares: 25.4,
  cropsGrown: 4,
  fieldsCount: 3,
  daysActive: 248,
  establishedOn: "12 Jan 2023",
  farmType: "Mixed Crops",
};

export const mockCrops: Crop[] = [
  {
    id: "maize",
    name: "Maize",
    emoji: "🌽",
    plantedOn: "12 Jan 2024",
    status: "Healthy",
    fieldId: "north",
    notes: "Tasseling stage, growth on track for a March harvest.",
  },
  {
    id: "tomatoes",
    name: "Tomatoes",
    emoji: "🍅",
    plantedOn: "05 Feb 2024",
    status: "Healthy",
    fieldId: "east",
    notes: "Fruit set underway; monitor for blossom end rot after heavy rain.",
  },
  {
    id: "spinach",
    name: "Spinach",
    emoji: "🥬",
    plantedOn: "20 Mar 2024",
    status: "Healthy",
    fieldId: "south",
    notes: "Ready for first leaf harvest within two weeks.",
  },
  {
    id: "beans",
    name: "Green Beans",
    emoji: "🫛",
    plantedOn: "02 Apr 2024",
    status: "At Risk",
    fieldId: "east",
    notes: "Early aphid activity spotted — scout before next spray window.",
  },
];

export const mockFields: Field[] = [
  { id: "north", name: "North Field", hectares: 12.4, crop: "Maize", status: "Active" },
  { id: "east", name: "East Field", hectares: 8.6, crop: "Tomatoes", status: "Active" },
  { id: "south", name: "South Field", hectares: 4.4, crop: "Spinach", status: "Active" },
];

export interface FarmInsights {
  avgTempC: number;
  avgHumidityPct: number;
  rainfallMm: number;
  overallHealth: "Good" | "Fair" | "Poor";
}

export const mockInsights: FarmInsights = {
  avgTempC: 24,
  avgHumidityPct: 68,
  rainfallMm: 42,
  overallHealth: "Good",
};
