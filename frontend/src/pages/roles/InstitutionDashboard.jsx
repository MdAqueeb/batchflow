import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { getBatchSummary, createBatch, assignTrainer } from '../../api/batches'
import { fetchBatches } from '../../store/slices/batchSlice'
import { getInstitutionTrainers } from '../../api/institutions'
import { useBatches } from '../../hooks/useBatches'
import { useAuth } from '../../hooks/useAuth'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import Card, { CardHeader } from '../../components/Common/Card'
import Table from '../../components/Common/Table'
import Modal from '../../components/Common/Modal'
import StatCard from '../../components/Common/StatCard'
import Button from '../../components/Common/Button'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { formatDate, formatRate } from '../../utils/formatters'

export default function InstitutionDashboard() {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { batches, loading, error } = useBatches()

  // Summary modal
  const [summaryModal, setSummaryModal] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)

  // Create batch modal
  const [createModal, setCreateModal] = useState(false)
  const [batchName, setBatchName] = useState('')
  const [creating, setCreating] = useState(false)

  // Assign trainer modal
  const [trainerModal, setTrainerModal] = useState(null) // holds the batch
  const [institutionTrainers, setInstitutionTrainers] = useState([])
  const [loadingTrainers, setLoadingTrainers] = useState(false)
  const [selectedTrainerId, setSelectedTrainerId] = useState('')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  function openSummary(batch) {
    setSummaryModal(batch)
    setSummary(null)
    setLoadingSummary(true)
    getBatchSummary(batch.id)
      .then((r) => setSummary(r.data))
      .catch((e) => toast.error(e.response?.data?.message || 'Failed to load summary'))
      .finally(() => setLoadingSummary(false))
  }

  async function handleCreateBatch(e) {
    e.preventDefault()
    if (!batchName.trim()) return
    setCreating(true)
    try {
      await createBatch({ name: batchName.trim(), institutionId: user.institutionId })
      toast.success('Batch created')
      setCreateModal(false)
      setBatchName('')
      dispatch(fetchBatches())
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create batch')
    } finally {
      setCreating(false)
    }
  }

  function openTrainerModal(batch) {
    setTrainerModal(batch)
    setSelectedTrainerId('')
    setInstitutionTrainers([])
    setLoadingTrainers(true)
    getInstitutionTrainers(user.institutionId)
      .then((r) => {
        setInstitutionTrainers(r.data)
        if (r.data.length > 0) setSelectedTrainerId(r.data[0].id)
      })
      .catch(() => toast.error('Failed to load trainers'))
      .finally(() => setLoadingTrainers(false))
  }

  async function handleAssignTrainer(e) {
    e.preventDefault()
    if (!selectedTrainerId || !trainerModal) return
    setAssigning(true)
    try {
      await assignTrainer(trainerModal.id, selectedTrainerId)
      toast.success('Trainer assigned to batch')
      setTrainerModal(null)
      dispatch(fetchBatches())
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign trainer')
    } finally {
      setAssigning(false)
    }
  }

  const batchCols = [
    { key: 'name', label: 'Batch Name' },
    { key: 'trainerCount', label: 'Trainers', render: (r) => r.trainerCount ?? '—' },
    { key: 'studentCount', label: 'Students', render: (r) => r.studentCount ?? '—' },
    { key: 'createdAt', label: 'Created', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openTrainerModal(r)}>
            Assign Trainer
          </Button>
          <Button size="sm" variant="outline" onClick={() => openSummary(r)}>
            Summary
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Institution Dashboard</h1>

      <Card padding={false}>
        <div className="p-5 flex items-start justify-between gap-4">
          <CardHeader
            title="Batches"
            subtitle={loading ? 'Loading…' : `${batches.length} batch${batches.length !== 1 ? 'es' : ''}`}
          />
          <Button size="sm" onClick={() => setCreateModal(true)}>+ Create Batch</Button>
        </div>
        <Table
          columns={batchCols}
          rows={batches}
          loading={loading}
          emptyMessage="No batches found. Create your first batch."
        />
      </Card>

      {/* Create Batch Modal */}
      <Modal
        open={createModal}
        onClose={() => { setCreateModal(false); setBatchName('') }}
        title="Create Batch"
        size="sm"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
            <input
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="e.g. Cohort 2025 A"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => { setCreateModal(false); setBatchName('') }}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={creating}>
              {creating ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Trainer Modal */}
      <Modal
        open={!!trainerModal}
        onClose={() => setTrainerModal(null)}
        title={`Assign Trainer — ${trainerModal?.name || ''}`}
        size="sm"
      >
        {loadingTrainers ? (
          <div className="py-6"><LoadingSpinner /></div>
        ) : institutionTrainers.length === 0 ? (
          <p className="text-sm text-gray-500">
            No trainers registered under your institution yet. Trainers must register with your institution first.
          </p>
        ) : (
          <form onSubmit={handleAssignTrainer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Trainer</label>
              <select
                value={selectedTrainerId}
                onChange={(e) => setSelectedTrainerId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {institutionTrainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setTrainerModal(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={assigning}>
                {assigning ? 'Assigning…' : 'Assign'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Batch Summary Modal */}
      <Modal
        open={!!summaryModal}
        onClose={() => { setSummaryModal(null); setSummary(null) }}
        title={`Summary — ${summaryModal?.name || ''}`}
        size="lg"
      >
        {loadingSummary && (
          <div className="py-8"><LoadingSpinner /></div>
        )}
        {summary && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Students"   value={summary.studentCount}               color="blue" />
              <StatCard label="Trainers"   value={summary.trainerCount}               color="purple" />
              <StatCard label="Sessions"   value={summary.sessionCount}               color="orange" />
              <StatCard label="Attendance" value={formatRate(summary.attendanceRate)} color="green" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Present" value={summary.presentCount} color="green" />
              <StatCard label="Absent"  value={summary.absentCount}  color="red" />
              <StatCard label="Late"    value={summary.lateCount}    color="orange" />
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
