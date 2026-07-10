// Admin dashboard aggregate stats DTOs, reconciled from admin/src/api/client.ts.
export interface CardCount {
  board: string;
  card_id: string;
  total: number;
}

export interface StatsDTO {
  cardCounts: CardCount[];
  totals: {
    total_submissions: number;
    completed_submissions: number;
    total_cities: number;
    total_entities: number;
  };
}
