import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getAttendanceBySession, markAttendance as markAttendanceAPI } from '../../api/attendance'

export const fetchAttendanceBySession = createAsyncThunk(
  'attendance/fetchBySession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const res = await getAttendanceBySession(sessionId)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load attendance')
    }
  }
)

export const markAttendance = createAsyncThunk(
  'attendance/mark',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await markAttendanceAPI(payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark attendance')
    }
  }
)

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    records: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAttendance(state) {
      state.records = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceBySession.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchAttendanceBySession.fulfilled, (state, action) => { state.loading = false; state.records = action.payload })
      .addCase(fetchAttendanceBySession.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(markAttendance.fulfilled, (state, action) => {
        const idx = state.records.findIndex(r => r.id === action.payload.id)
        if (idx >= 0) state.records[idx] = action.payload
        else state.records.push(action.payload)
      })
  },
})

export const { clearAttendance } = attendanceSlice.actions
export default attendanceSlice.reducer
