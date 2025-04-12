import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import expense from "./expense.slice";
import category from "./category.slice";

export const store = configureStore({
    reducer: {
        expense,
        category
    },

})

export type AppDispatch = typeof store.dispatch;
export type IRootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    IRootState,
    unknown,
    Action<string>
>