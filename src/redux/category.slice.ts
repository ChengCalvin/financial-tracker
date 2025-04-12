import { createSlice } from '@reduxjs/toolkit';
import { CategoryState } from '../features/category/category.model';

interface CategoryInitialState {
    categories?: CategoryState[];
}

const initialState: CategoryInitialState = {
    categories: [],
}

export const categorySlice = createSlice({
    name: 'categorySlice',
    initialState,
    reducers: {
        update: (state, action) => {
            state = { ...action.payload };
        }
    }
})

export default categorySlice.reducer