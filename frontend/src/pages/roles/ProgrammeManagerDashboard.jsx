import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { getProgrammeSummary } from '../../api/programme'
import { getInstitutionSummary } from '../../api/institutions'
import { createBatch } from '../../api/batches'
import { fetchBatches } from '../../store/slices/batchSlice'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import Card, { CardHeader } from '../../components/Common/Card'
import StatCard from '../../components/Common/StatCard'
import Table from '../../components/Common/Table'
import Modal from '../../components/Common/Modal'
import Button from '../../components/Common/Button'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { formatRate } from '../../utils/formatters'

export default function ProgrammeManagerDashboard() {
  const dispatch = useDispatch()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [instModal, setInstModal] = useState(null)
  const [instSummary, setInstSummary] = useState(null)
  const [loadingInst, setLoadingInst] = useState(false)
  const [createModal, setCreateModal] = useState(false)
  const [batchName, setBatchName] = useState('')
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    getProgrammeSummary()
      .then((r) => setSummary(r.data))
      .catch(() => toast.error('Failed to load programme summary'))
      .finally(() => setLoading(false))
  }, [])

  function openCreateModal() {
    setBatchName('')
    setSelectedInstitutionId(summary?.perInstitution?.[0]?.institutionId?.toString() || '')
    setCreateModal(true)
  }

  async function handleCreateBatch(e) {
    e.preventDefault()
    if (!batchName.trim() || !selectedInstitutionId) return
    setCreating(true)
    try {
      await createBatch({ name: batchName.trim(), institutionId: Number(selectedInstitutionId) })
      toast.success('Batch created')
      setCreateModal(false)
      dispatch(fetchBatches())
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create batch')
    } finally {
      setCreating(false)
    }
  }

  function openInstitution(inst) {
    setInstModal(inst)
    setInstSummary(null)
    setLoadingInst(true)
    getInstitutionSummary(inst.institutionId)
      .then((r) => setInstSummary(r.data))
      .catch(() => toast.error('Failed to load institution summary'))
      .finally(() => setLoadingInst(false))
  }

  const chartData = summary?.perInstitution?.map((i) => ({
    name: i.institutionName.length > 14 ? i.institutionName.slice(0, 14) + '…' : i.institutionName,
    rate: i.attendanceCount > 0
      ? Math.round((i.presentCount / i.attendanceCount) * 100)
      : 0,
  })) || []

  const instCols = [
    { key: 'institutionName', label: 'Institution' },
    { key: 'batchCount',   label: 'Batches' },
    { key: 'trainerCount', label: 'Trainers' },
    { key: 'studentCount', label: 'Students' },
    {
      key: 'rate', label: 'Attendance %',
      render: (r) => {
        const rate = r.attendanceCount > 0
          ? Math.round((r.presentCount / r.attendanceCount) * 100)
          : 0
        const color = rate >= 75 ? 'text-green-600' : rate >= 50 ? 'text-yellow-600' : 'text-red-600'
        return <span className={`font-semibold ${color}`}>{rate}%</span>
      },
    },
    {
      key: 'action', label: '',
      render: (r) => (
        <Button size="sm" variant="outline" onClick={() => openInstitution(r)}>
          Details
        </Button>
      ),
    },
  ]

  if (loading) {
    return <DashboardLayout><LoadingSpinner size="lg" /></DashboardLayout>
  }

  return (
    <DashboardLayout>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Programme Manager</h1>

      {/* Top-level stats */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <StatCard label="Institutions" value={summary.totalInstitutions} color="blue" />
          <StatCard label="Batches"      value={summary.totalBatches}       color="purple" />
          <StatCard label="Trainers"     value={summary.totalTrainers}      color="orange" />
          <StatCard label="Students"     value={summary.totalStudents}      color="gray" />
          <StatCard
            label="Attendance"
            value={summary.totalAttendance > 0
              ? `${Math.round((summary.presentCount / summary.totalAttendance) * 100)}%`
              : '—'}
            color="green"
          />
        </div>
      )}

      {/* Bar chart */}
      {chartData.length > 0 && (
        <Card className="mb-6">
          <CardHeader title="Attendance Rate by Institution" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 16, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="rate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Institutions table */}
      <Card padding={false}>
        <div className="p-5 flex items-start justify-between gap-4">
          <CardHeader title="Institutions" subtitle="Click Details for drill-down" />
          <Button size="sm" onClick={openCreateModal}>+ Create Batch</Button>
        </div>
        <Table
          columns={instCols}
          rows={summary?.perInstitution || []}
          emptyMessage="No institutions found."
        />
      </Card>

      {/* Create Batch Modal */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Create Batch"
        size="sm"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
            <select
              value={selectedInstitutionId}
              onChange={(e) => setSelectedInstitutionId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {summary?.perInstitution?.map((inst) => (
                <option key={inst.institutionId} value={inst.institutionId}>
                  {inst.institutionName}
                </option>
              ))}
            </select>
          </div>
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
            <Button type="button" variant="outline" size="sm" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={creating}>
              {creating ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Institution drill-down modal */}
      <Modal
        open={!!instModal}
        onClose={() => { setInstModal(null); setInstSummary(null) }}
        title={instModal?.institutionName || 'Institution Details'}
        size="lg"
      >
        {loadingInst && <LoadingSpinner />}
        {instSummary && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Batches"   value={instSummary.batchCount}   color="blue" />
              <StatCard label="Trainers"  value={instSummary.trainerCount} color="purple" />
              <StatCard label="Students"  value={instSummary.studentCount} color="gray" />
              <StatCard label="Sessions"  value={instSummary.sessionCount} color="orange" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Present" value={instSummary.presentCount} color="green" />
              <StatCard label="Absent"  value={instSummary.absentCount}  color="red" />
              <StatCard label="Late"    value={instSummary.lateCount}    color="orange" />
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
