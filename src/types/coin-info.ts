export interface CoinInfo {
  name: string;
  era: string;
  category: 'British India' | 'Republic India' | 'Mughal Empire' | 'Sultanates' | 'Princely States' | 'Other';
  year: string;
  mint: string;
  mintMarkDescription: string; // New field for specific mark details (e.g., "Diamond below date")
  estimatedValue: string;
  obverseDescription: string;
  reverseDescription: string;
  material: string;
  weight: string;
  diameter: string;
  shape: string;
  errorTypes: string[];
  historicalContext: string;
  sources?: { uri: string; title: string; }[];
}