import { createSlice } from '@reduxjs/toolkit';
import { ExpenseState } from '../features/expense/expense.model';

interface ExpenseInitialState {
    expenses: ExpenseState[];
}

const initialState: ExpenseInitialState = {
    expenses: [],
}

export const expenseSlice = createSlice({
    name: 'expenseSlice',
    initialState,
    reducers: {
        update: (state, action) => {
            console.log("store data", action.payload)
            return { ...action.payload };
        }
    }
})

export default expenseSlice.reducer