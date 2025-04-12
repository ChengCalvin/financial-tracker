import { useSelector } from "react-redux"
import ExpensesCollection from "./expenseCollection.model";
import { useRef } from "react";
import { IRootState } from "../../redux/store";

export const useExpense = () => {
    const expense = useSelector((state: IRootState) => state.expense);
    const expenseRef = useRef<ExpensesCollection | null>(null)
    // const expenseInstance = ExpensesCollection.getInstance();

    const initExpenseCollection = () => {
        expenseRef.current = ExpensesCollection.init();
    }

    const addNewExpense = (expense: any) => {
        if (expenseRef.current) {
            expenseRef.current.addExpense(expense);
        }
    }

    const removeExpense = (id: string) => {
        if (expenseRef.current) {
            expenseRef.current.removeExpense(id);
        }
    }

    const getTotalAmount = () => {
        if (expenseRef.current) {
            // TODO: Implement feature to get total by monthly
            return expenseRef.current.getTotalAmount(); // all time total
        }
    }

    const updateExpense = () => {
        if (expenseRef.current) {
            expenseRef.current.update();
        }
    }

    return {
        expense,
        initExepenseCollection: initExpenseCollection,
        addNewExpense,
        removeExpense,
        getTotalAmount,
        updateExpense,
    }
}