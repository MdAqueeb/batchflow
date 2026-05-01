import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import batchReducer from './slices/batchSlice'
import sessionReducer from './slices/sessionSlice'
import attendanceReducer from './slices/attendanceSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    batches: batchReducer,
    sessions: sessionReducer,
    attendance: attendanceReducer,
  },
})
