import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getBatches, getBatchSummary } from '../../api/batches'

export const fetchBatches = createAsyncThunk(
  'batches/fetchBatches',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getBatches()
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load batches')
    }
  }
)

export const fetchBatchSummary = createAsyncThunk(
  'batches/fetchBatchSummary',
  async (batchId, { rejectWithValue }) => {
    try {
      const res = await getBatchSummary(batchId)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load batch summary')
    }
  }
)

const batchSlice = createSlice({
  name: 'batches',
  initialState: {
    list: [],
    selectedSummary: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearBatchSummary(state) {
      state.selectedSummary = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBatches.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchBatches.fulfilled, (state, action) => { state.loading = false; state.list = action.payload })
      .addCase(fetchBatches.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchBatchSummary.pending, (state) => { state.loading = true })
      .addCase(fetchBatchSummary.fulfilled, (state, action) => { state.loading = false; state.selectedSummary = action.payload })
      .addCase(fetchBatchSummary.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  },
})

export const { clearBatchSummary } = batchSlice.actions
export default batchSlice.reducer
