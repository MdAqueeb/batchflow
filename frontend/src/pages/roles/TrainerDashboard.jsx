import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { createSession } from '../../api/sessions'
import { createBatchInvite } from '../../api/batches'
import { getAttendanceBySession } from '../../api/attendance'
import { useBatches } from '../../hooks/useBatches'
import { useFetch } from '../../hooks/useFetch'
import { validate, required, timeAfter } from '../../utils/validators'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import Card, { CardHeader } from '../../components/Common/Card'
import Table from '../../components/Common/Table'
import Modal from '../../components/Common/Modal'
import Button from '../../components/Common/Button'
import Badge from '../../components/Common/Badge'
import EmptyState from '../../components/Common/EmptyState'
import { formatDate, formatTime } from '../../utils/formatters'

const TABS = ['Sessions', 'Create Session', 'Batch Invite']

const SESSION_RULES = {
  title:     [required('Title')],
  date:      [required('Date')],
  startTime: [required('Start time')],
  endTime:   [required('End time'), timeAfter('startTime')],
  batchId:   [required('Batch')],
}

export default function TrainerDashboard() {
  const [tab, setTab] = useState('Sessions')
  const { batches, loading: loadingBatches } = useBatches()
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [attendanceModal, setAttendanceModal] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [loadingAtt, setLoadingAtt] = useState(false)
  const [inviteResult, setInviteResult] = useState(null)
  const [generatingInvite, setGeneratingInvite] = useState(false)
  const [inviteBatchId, setInviteBatchId] = useState('')
  const [inviteTtl, setInviteTtl] = useState(24)
  const [form, setForm] = useState({ title: '', date: '', startTime: '', endTime: '', batchId: '' })
  const [formErrors, setFormErrors] = useState({})
  const [creating, setCreating] = useState(false)

  // Auto-select first batch once Redux loads
  useEffect(() => {
    if (batches.length > 0 && !selectedBatch) {
      setSelectedBatch(batches[0])
      setForm((f) => ({ ...f, batchId: String(batches[0].id) }))
      setInviteBatchId(String(batches[0].id))
    }
  }, [batches, selectedBatch])

  const { data: sessions, loading: loadingSessions, refetch: refetchSessions } = useFetch(
    selectedBatch ? '/api/sessions' : null,
    { params: { batchId: selectedBatch?.id }, deps: [selectedBatch?.id] }
  )

  function openAttendance(session) {
    setAttendanceModal(session)
    setAttendance([])
    setLoadingAtt(true)
    getAttendanceBySession(session.id)
      .then((r) => setAttendance(r.data))
      .catch(() => toast.error('Failed to load attendance'))
      .finally(() => setLoadingAtt(false))
  }

  async function handleCreateSession(e) {
    e.preventDefault()
    const errors = validate(SESSION_RULES, form)
    if (Object.keys(errors).length) { setFormErrors(errors); return }
    setFormErrors({})
    setCreating(true)
    try {
      await createSession({
        title:     form.title,
        date:      form.date,
        startTime: form.startTime,
        endTime:   form.endTime,
        batchId:   Number(form.batchId),
      })
      toast.success('Session created!')
      setForm((f) => ({ ...f, title: '', date: '', startTime: '', endTime: '' }))
      if (selectedBatch?.id === Number(form.batchId)) refetchSessions()
      setTab('Sessions')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create session')
    } finally {
      setCreating(false)
    }
  }

  async function handleGenerateInvite() {
    if (!inviteBatchId) return
    setGeneratingInvite(true)
    setInviteResult(null)
    try {
      const res = await createBatchInvite(Number(inviteBatchId))
      setInviteResult(res.data)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to generate invite')
    } finally {
      setGeneratingInvite(false)
    }
  }

  function copyInvite() {
    const link = `${window.location.origin}/join?token=${inviteResult.token}`
    navigator.clipboard.writeText(link).then(() => toast.success('Copied!'))
  }

  function field(name, label, type = 'text', extraProps = {}) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          type={type}
          value={form[name]}
          onChange={(e) => { setForm((f) => ({ ...f, [name]: e.target.value })); setFormErrors((fe) => ({ ...fe, [name]: null })) }}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400
            ${formErrors[name] ? 'border-red-400' : 'border-gray-300'}`}
          {...extraProps}
        />
        {formErrors[name] && <p className="text-xs text-red-500 mt-1">{formErrors[name]}</p>}
      </div>
    )
  }

  const sessionCols = [
    { key: 'title', label: 'Title' },
    { key: 'date',  label: 'Date',  render: (r) => formatDate(r.date) },
    { key: 'time',  label: 'Time',  render: (r) => `${formatTime(r.startTime)} – ${formatTime(r.endTime)}` },
    {
      key: 'action', label: '',
      render: (r) => (
        <Button size="sm" variant="outline" onClick={() => openAttendance(r)}>Attendance</Button>
      ),
    },
  ]

  const attCols = [
    { key: 'studentName', label: 'Student', render: (r) => r.studentName || '—' },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    { key: 'markedAt', label: 'Marked At', render: (r) => r.markedAt ? new Date(r.markedAt).toLocaleTimeString() : '—' },
  ]

  return (
    <DashboardLayout>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Trainer Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Sessions ── */}
      {tab === 'Sessions' && (
        <>
          {batches.length > 1 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {batches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBatch(b)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
                    ${selectedBatch?.id === b.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}

          {!loadingBatches && batches.length === 0
            ? <EmptyState message="No batches assigned to you yet." />
            : (
              <Card padding={false}>
                <div className="p-5">
                  <CardHeader
                    title={selectedBatch ? `Sessions — ${selectedBatch.name}` : 'Sessions'}
                    action={
                      <Button size="sm" onClick={() => setTab('Create Session')}>+ New Session</Button>
                    }
                  />
                </div>
                <Table
                  columns={sessionCols}
                  rows={sessions || []}
                  loading={loadingSessions}
                  emptyMessage="No sessions yet. Create your first one."
                />
              </Card>
            )}
        </>
      )}

      {/* ── Create Session ── */}
      {tab === 'Create Session' && (
        <Card>
          <CardHeader title="Create New Session" />
          <form onSubmit={handleCreateSession} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">{field('title', 'Session Title', 'text', { placeholder: 'e.g. Python Basics – Week 3' })}</div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
              <select
                value={form.batchId}
                onChange={(e) => { setForm((f) => ({ ...f, batchId: e.target.value })); setFormErrors((fe) => ({ ...fe, batchId: null })) }}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400
                  ${formErrors.batchId ? 'border-red-400' : 'border-gray-300'}`}
              >
                <option value="">Select batch…</option>
                {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {formErrors.batchId && <p className="text-xs text-red-500 mt-1">{formErrors.batchId}</p>}
            </div>

            {field('date',      'Date',       'date')}
            {field('startTime', 'Start Time', 'time')}
            {field('endTime',   'End Time',   'time')}

            <div className="sm:col-span-2 flex gap-3 pt-2">
              <Button type="submit" loading={creating}>Create Session</Button>
              <Button type="button" variant="secondary" onClick={() => setTab('Sessions')}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── Batch Invite ── */}
      {tab === 'Batch Invite' && (
        <Card>
          <CardHeader title="Generate Batch Invite Link" subtitle="Share with students — they join automatically" />
          <div className="space-y-4 max-w-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
              <select
                value={inviteBatchId}
                onChange={(e) => { setInviteBatchId(e.target.value); setInviteResult(null) }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid for (hours)</label>
              <input
                type="number" min={1} max={168} value={inviteTtl}
                onChange={(e) => setInviteTtl(Number(e.target.value))}
                className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <Button loading={generatingInvite} onClick={handleGenerateInvite}>
              Generate Link
            </Button>

            {inviteResult && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-600 font-semibold mb-2">Invite Link</p>
                <p className="text-sm text-gray-700 break-all font-mono bg-white rounded-lg p-2 border border-blue-100">
                  {`${window.location.origin}/join?token=${inviteResult.token}`}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <Button size="sm" onClick={copyInvite}>Copy</Button>
                  {inviteResult.expiresAt && (
                    <span className="text-xs text-gray-400">
                      Expires {new Date(inviteResult.expiresAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Attendance Modal */}
      <Modal
        open={!!attendanceModal}
        onClose={() => { setAttendanceModal(null); setAttendance([]) }}
        title={`Attendance — ${attendanceModal?.title || ''}`}
        size="lg"
      >
        <p className="text-sm text-gray-500 mb-4">
          {formatDate(attendanceModal?.date)}
          {' · '}
          {formatTime(attendanceModal?.startTime)} – {formatTime(attendanceModal?.endTime)}
        </p>
        <Table
          columns={attCols}
          rows={attendance}
          loading={loadingAtt}
          emptyMessage="No attendance records yet."
        />
      </Modal>
    </DashboardLayout>
  )
}
