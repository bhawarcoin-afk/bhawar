export interface CollectionItem {
  coin_id: string; // Combination of name and year for a unique ID
  name: string;
  period: string;
  year: string;
  denomination: string;
  metal: string;
  mint_id: string;
  obverse_desc: string;
  reverse_desc: string;
  edge_type: string;
  estimatedValue: string;
  added_at: Date;
}
