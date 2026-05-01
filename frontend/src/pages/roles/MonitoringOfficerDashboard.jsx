import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { getProgrammeSummary } from '../../api/programme'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import Card, { CardHeader } from '../../components/Common/Card'
import StatCard from '../../components/Common/StatCard'
import Table from '../../components/Common/Table'
import LoadingSpinner from '../../components/Common/LoadingSpinner'

const PIE_COLORS = ['#22c55e', '#ef4444', '#f59e0b']

export default function MonitoringOfficerDashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProgrammeSummary()
      .then((r) => setSummary(r.data))
      .catch(() => toast.error('Failed to load programme data'))
      .finally(() => setLoading(false))
  }, [])

  const pieData = summary
    ? [
        { name: 'Present', value: summary.presentCount },
        { name: 'Absent',  value: summary.absentCount },
        { name: 'Late',    value: summary.lateCount },
      ]
    : []

  const barData = summary?.perInstitution?.map((i) => ({
    name: i.institutionName.length > 14 ? i.institutionName.slice(0, 14) + '…' : i.institutionName,
    rate: i.attendanceCount > 0
      ? Math.round((i.presentCount / i.attendanceCount) * 100)
      : 0,
  })) || []

  const instCols = [
    { key: 'institutionName', label: 'Institution' },
    { key: 'batchCount',      label: 'Batches' },
    { key: 'trainerCount',    label: 'Trainers' },
    { key: 'studentCount',    label: 'Students' },
    { key: 'sessionCount',    label: 'Sessions' },
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
  ]

  if (loading) {
    return <DashboardLayout><LoadingSpinner size="lg" /></DashboardLayout>
  }

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-800">Programme Overview</h1>
        <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
          Read-only
        </span>
      </div>

      {summary && (
        <>
          {/* Top stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            <StatCard label="Institutions" value={summary.totalInstitutions} color="blue" />
            <StatCard label="Batches"      value={summary.totalBatches}      color="purple" />
            <StatCard label="Trainers"     value={summary.totalTrainers}     color="orange" />
            <StatCard label="Students"     value={summary.totalStudents}     color="gray" />
            <StatCard
              label="Overall Attendance"
              value={summary.totalAttendance > 0
                ? `${Math.round((summary.presentCount / summary.totalAttendance) * 100)}%`
                : '—'}
              color="green"
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Pie — attendance breakdown */}
            <Card>
              <CardHeader title="Attendance Breakdown" />
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Bar — attendance by institution */}
            <Card>
              <CardHeader title="Attendance Rate by Institution" />
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 4, right: 16, left: -20, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="rate" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Institutions table — read-only, no action column */}
          <Card padding={false}>
            <div className="p-5">
              <CardHeader title="All Institutions" subtitle="Read-only view" />
            </div>
            <Table
              columns={instCols}
              rows={summary.perInstitution || []}
              emptyMessage="No institutions found."
            />
          </Card>
        </>
      )}
    </DashboardLayout>
  )
}
