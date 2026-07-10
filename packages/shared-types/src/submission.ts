// Etapa 1 (formulario) submission DTOs, reconciled from formulario/src/api/client.ts
// and admin/src/api/client.ts. Both apps declared a byte-identical `PlacementDTO`
// independently - this is now the single definition both import.
export interface PlacementDTO {
  board: string;
  slot_key: string;
  card_id: string;
}

// Full submission shape as returned to the participant-facing formulario app.
export interface SubmissionDTO {
  id: number;
  name: string;
  city: string;
  entity: string;
  status: 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  placements: PlacementDTO[];
}

// Admin list-view row shape (no placements - kept lightweight for table rendering).
export interface SubmissionListItem {
  id: number;
  status: 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  name: string;
  entity: string;
  city: string;
}

// Admin detail-view shape: list item plus the full placements array.
export interface SubmissionDetail extends SubmissionListItem {
  placements: PlacementDTO[];
}
