import { useRole } from './useRole'

const ROLE_PERMISSIONS = {
  STUDENT: ['view_sessions', 'mark_attendance', 'join_batch'],
  TRAINER: ['create_session', 'view_batch_attendance', 'generate_invite', 'view_sessions', 'view_batches'],
  INSTITUTION: ['view_batches', 'view_trainers', 'view_batch_summary', 'create_batch'],
  PROGRAMME_MANAGER: ['view_institution_summary', 'view_programme_summary', 'view_batches', 'create_batch'],
  MONITORING_OFFICER: ['view_programme_summary', 'view_institution_summary', 'view_batches'],
}

export function useCanAccess(permission) {
  const role = useRole()
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}
