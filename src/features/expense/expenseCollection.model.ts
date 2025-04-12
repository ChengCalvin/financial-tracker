// models/ExpensesCollection.js
// import { addExpense, removeExpense, updateExpense } from '../reducers/expenseSlice'; // Redux actions
import { expenseSlice } from "../../redux/expense.slice";
import { store } from "../../redux/store";
import { ExpenseDefinition, ExpenseModel } from "./expense.model";

export class ExpensesCollection {
    static instance: ExpensesCollection; // Singleton instance
    private expenses: ExpenseModel[]; // List of expenses
    constructor() {
        this.expenses = []; // Initialize the list of expenses
    }

    static init() {
        if (ExpensesCollection.instance) {
            return ExpensesCollection.instance;
        }
        ExpensesCollection.instance = new ExpensesCollection();
        return ExpensesCollection.instance;
    }

    // Add a new expense to the collection and dispatch the action
    addExpense(expense: ExpenseDefinition) {
        const newExpense = new ExpenseModel(expense); // Create an individual expense instance
        this.expenses = [...this.expenses, newExpense]; // Add to the collection
    }

    // Remove an expense by its ID from the collection and dispatch the action
    removeExpense(id: string) {
        this.expenses = this.expenses.filter(expense => expense.getId() !== id); // Remove from local collection
    }

    // Get all expenses
    getExpenses() {
        return this.expenses;
    }

    // Example: Calculate the total amount of all expenses
    getTotalAmount() {
        return this.expenses.reduce((total, expense) => total + expense.getAmount(), 0);
    }

    // Clear all expenses (if needed)
    clearAllExpenses() {
        // this.expenses.forEach(expense => expense.remove()); // Remove from Redux
        this.expenses = []; // Clear the local collection
    }

    // Singleton: Get the shared instance
    static getInstance() {
        if (!ExpensesCollection.instance) {
            ExpensesCollection.instance = new ExpensesCollection(); // Create a new instance
        }
        return ExpensesCollection.instance; // Return the existing instance
    }

    update() {
        console.log("update", this.getState());
        store.dispatch(expenseSlice.actions.update(this.getState()));
    }

    getState() {
        return {
            expenses: this.expenses.map(expense => expense.getState()),
        };
    }
}

export default ExpensesCollection;
