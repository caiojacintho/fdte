// Forward-looking stubs for Wave 2/3 of the planehab-hardening plan
// (.omo/plans/planehab-hardening.md, todo 10's Drizzle schema and the
// Wave 3 access-model/Wave 4 audit-log work that consumes it). These
// entities have NO backend implementation yet as of this todo (Wave 1,
// todo 4) - they are seeded here now so later waves share one DTO source
// of truth from day one instead of each inventing its own shape. Fields
// mirror todo 10's schema description exactly; all timestamps are
// ISO-8601 strings since DTOs serialize dates as JSON over HTTP, not
// `Date` objects.

export interface SessionDTO {
  id: number;
  code: string;
  date: string;
  start_at: string;
  end_at: string | null;
  description: string | null;
  submit_unlocked: boolean;
  created_at: string;
}

export interface SessionGroupDTO {
  id: number;
  session_id: number;
  name: string;
  code: string;
  board_index: number;
  created_at: string;
}

export type AuditEventSubjectType = 'submission' | 'bairro';

export interface AuditEventDTO {
  id: number;
  session_id: number;
  subject_type: AuditEventSubjectType;
  subject_ref: string;
  event_type: string;
  path: string;
  created_at: string;
}
