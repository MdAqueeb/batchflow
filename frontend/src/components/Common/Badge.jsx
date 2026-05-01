const VARIANTS = {
  green:  'bg-green-100 text-green-800',
  red:    'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  blue:   'bg-blue-100 text-blue-800',
  gray:   'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-800',
  orange: 'bg-orange-100 text-orange-800',
}

const STATUS_MAP = {
  PRESENT: 'green',
  ABSENT:  'red',
  LATE:    'yellow',
  ACTIVE:  'green',
  INACTIVE: 'gray',
}

export default function Badge({ label, variant = 'gray', status }) {
  const v = status ? (STATUS_MAP[status] || 'gray') : variant
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${VARIANTS[v]}`}>
      {label ?? status}
    </span>
  )
}
