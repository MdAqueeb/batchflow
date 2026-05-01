import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { joinBatch } from '../../api/batches'
import { markAttendance } from '../../api/attendance'
import { fetchBatches } from '../../store/slices/batchSlice'
import { useBatches } from '../../hooks/useBatches'
import { useFetch } from '../../hooks/useFetch'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import Card, { CardHeader } from '../../components/Common/Card'
import Table from '../../components/Common/Table'
import Modal from '../../components/Common/Modal'
import Button from '../../components/Common/Button'
import Badge from '../../components/Common/Badge'
import EmptyState from '../../components/Common/EmptyState'
import { formatDate, formatTime } from '../../utils/formatters'

const STATUS_OPTIONS = ['PRESENT', 'LATE', 'ABSENT']

export default function StudentDashboard() {
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const { batches, loading: loadingBatches } = useBatches()
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [markModal, setMarkModal] = useState(null)
  const [markStatus, setMarkStatus] = useState('PRESENT')
  const [marking, setMarking] = useState(false)
  const [joining, setJoining] = useState(false)
  const [joinModal, setJoinModal] = useState(false)
  const [joinToken, setJoinToken] = useState('')

  // Auto-select first batch once loaded
  useEffect(() => {
    if (batches.length > 0 && !selectedBatch) {
      setSelectedBatch(batches[0])
    }
  }, [batches, selectedBatch])

  // Auto-join batch via invite token in URL (fallback for already-logged-in students)
  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) return
    setJoining(true)
    joinBatch(token)
      .then(() => { toast.success('Joined batch!'); dispatch(fetchBatches()) })
      .catch((e) => toast.error(e.response?.data?.message || 'Failed to join batch'))
      .finally(() => setJoining(false))
  }, []) // eslint-disable-line

  async function handleJoinBatch(e) {
    e.preventDefault()
    const token = joinToken.trim()
    if (!token) return
    setJoining(true)
    try {
      await joinBatch(token)
      toast.success('Joined batch!')
      dispatch(fetchBatches())
      setJoinModal(false)
      setJoinToken('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join batch')
    } finally {
      setJoining(false)
    }
  }

  const { data: sessions, loading: loadingSessions, error: sessionError } = useFetch(
    selectedBatch ? '/api/sessions' : null,
    { params: { batchId: selectedBatch?.id }, deps: [selectedBatch?.id] }
  )

  useEffect(() => {
    if (sessionError) toast.error(sessionError)
  }, [sessionError])

  async function handleMark() {
    if (!markModal) return
    setMarking(true)
    try {
      await markAttendance({ sessionId: markModal.id, status: markStatus })
      toast.success('Attendance marked!')
      setMarkModal(null)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to mark attendance')
    } finally {
      setMarking(false)
    }
  }

  const sessionCols = [
    { key: 'title', label: 'Session' },
    { key: 'date',  label: 'Date',  render: (r) => formatDate(r.date) },
    { key: 'time',  label: 'Time',  render: (r) => `${formatTime(r.startTime)} – ${formatTime(r.endTime)}` },
    {
      key: 'action', label: '',
      render: (r) => (
        <Button size="sm" onClick={() => { setMarkModal(r); setMarkStatus('PRESENT') }}>
          Mark
        </Button>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">My Sessions</h1>
        <Button size="sm" onClick={() => setJoinModal(true)}>+ Join Batch</Button>
      </div>

      {joining && <p className="text-sm text-blue-600 mb-4 animate-pulse">Joining batch…</p>}

      {/* Batch tabs */}
      {batches.length > 1 && (
        <div className="flex gap-2 mb-5 flex-wrap">
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

      {!loadingBatches && batches.length === 0 && (
        <EmptyState
          message="Not enrolled in any batch yet."
          action={<Button size="sm" onClick={() => setJoinModal(true)}>Join Batch</Button>}
        />
      )}

      {selectedBatch && (
        <Card padding={false}>
          <div className="p-5">
            <CardHeader
              title={`Sessions — ${selectedBatch.name}`}
              subtitle="Click Mark to record your attendance for active sessions"
            />
          </div>
          <Table
            columns={sessionCols}
            rows={sessions || []}
            loading={loadingSessions}
            emptyMessage="No sessions available for this batch."
          />
        </Card>
      )}

      {/* Join Batch Modal */}
      <Modal
        open={joinModal}
        onClose={() => { setJoinModal(false); setJoinToken('') }}
        title="Join Batch"
        size="sm"
      >
        <form onSubmit={handleJoinBatch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invite Token or Link</label>
            <input
              type="text"
              value={joinToken}
              onChange={(e) => {
                const val = e.target.value.trim()
                // Accept full URL or raw token
                const match = val.match(/[?&]token=([^&]+)/)
                setJoinToken(match ? match[1] : val)
              }}
              placeholder="Paste token or invite link…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Paste the full invite link or just the token.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => { setJoinModal(false); setJoinToken('') }}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={joining}>
              {joining ? 'Joining…' : 'Join'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Mark Attendance Modal */}
      <Modal
        open={!!markModal}
        onClose={() => setMarkModal(null)}
        title={`Mark Attendance — ${markModal?.title || ''}`}
      >
        <p className="text-sm text-gray-500 mb-1">
          {formatDate(markModal?.date)}
          {' · '}
          {formatTime(markModal?.startTime)} – {formatTime(markModal?.endTime)}
        </p>

        <p className="text-sm font-medium text-gray-700 mt-5 mb-3">Your status</p>
        <div className="flex gap-3">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setMarkStatus(s)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                ${markStatus === s
                  ? s === 'PRESENT' ? 'border-green-500 bg-green-50 text-green-700'
                    : s === 'LATE'    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" className="flex-1" onClick={() => setMarkModal(null)}>
            Cancel
          </Button>
          <Button className="flex-1" loading={marking} onClick={handleMark}>
            Confirm
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
