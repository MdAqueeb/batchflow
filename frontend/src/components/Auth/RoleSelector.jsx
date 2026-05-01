import { ROLE_LABELS } from '../../utils/rolePermissions'

const ROLE_META = {
  STUDENT: {
    icon: '🎓',
    desc: 'View sessions and mark your attendance',
  },
  TRAINER: {
    icon: '👨‍🏫',
    desc: 'Create sessions, manage batches, generate invite links',
  },
  INSTITUTION: {
    icon: '🏫',
    desc: 'Manage trainers, batches and view attendance summaries',
  },
  PROGRAMME_MANAGER: {
    icon: '📊',
    desc: 'Oversee all institutions across the programme',
  },
  MONITORING_OFFICER: {
    icon: '👁️',
    desc: 'Read-only access to programme-wide attendance data',
  },
}

export default function RoleSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Object.entries(ROLE_META).map(([role, meta]) => (
        <button
          key={role}
          type="button"
          onClick={() => onSelect(role)}
          className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all
            ${selected === role
              ? 'border-blue-600 bg-blue-50 shadow-sm'
              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
            }`}
        >
          <span className="text-2xl leading-none mt-0.5">{meta.icon}</span>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{ROLE_LABELS[role]}</p>
            <p className="text-xs text-gray-500 mt-0.5">{meta.desc}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
