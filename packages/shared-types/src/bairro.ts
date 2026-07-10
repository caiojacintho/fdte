// Etapa 2 (formulario2) "Jogo do Bairro" DTOs. `admin`'s former `BairroSubmissionItem`
// and `formulario2`'s former `BairroSubmission` were structurally identical -
// reconciled here into one canonical `BairroSubmission`, used by both apps.
export interface BairroSubmission {
  code: string;
  group_name: string;
  board: number;
  status: 'in_progress' | 'completed';
  placements: Record<string, string>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface SubmitPayload {
  placements: Record<string, string>;
  group: string;
  board: number;
}
