import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getSessions, createSession as createSessionAPI } from '../../api/sessions'

export const fetchSessionsByBatch = createAsyncThunk(
  'sessions/fetchByBatch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getSessions()
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load sessions')
    }
  }
)

export const createSession = createAsyncThunk(
  'sessions/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await createSessionAPI(payload)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create session')
    }
  }
)

const sessionSlice = createSlice({
  name: 'sessions',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessionsByBatch.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchSessionsByBatch.fulfilled, (state, action) => { state.loading = false; state.list = action.payload })
      .addCase(fetchSessionsByBatch.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(createSession.fulfilled, (state, action) => { state.list.unshift(action.payload) })
  },
})

export default sessionSlice.reducer
