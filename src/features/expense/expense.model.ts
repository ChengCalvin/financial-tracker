import { expenseSlice } from "../../redux/expense.slice";
import { store } from "../../redux/store";

export interface ExpenseDefinition {
    id: string;
    amount: number;
    description?: string;
    category: string;
    date: string;
    user: any;
}

export interface ExpenseState {
    id: string;
    amount: number;
    description?: string;
    category: string;
    date: string;
    user: any;
}

export class ExpenseModel {
    private id: string;
    private amount: number;
    private description: string;
    private category: string;
    private date: string;
    private user: any;

    constructor(def: ExpenseDefinition) {
        this.id = def.id;
        this.amount = def.amount;
        this.description = def.description || ''; 
        this.category = def.category;
        this.date = def.date;
        this.user = def.user;
    }

    getId() {
        return this.id;
    }

    setId(id: string) {
        this.id = id;
    }

    getAmount() {
        return this.amount;
    }  

    setAmount(amount: number) {
        this.amount = amount;
    }

    getDescription() {
        return this.description;
    }

    setDescription(description: string) {
        this.description = description;
    }
    
    getCategory() {
        return this.category;
    }

    setCategory(category: string) {
        this.category = category;
    }

    getDate() {
        return this.date;
    }

    setDate(date: string) {
        this.date = date;
    }

    getUser() {
        return this.user;
    }

    setUser(user: any) {
        this.user = user;
    }

    getState(): ExpenseState {
        return {
            id: this.getId(),
            amount: this.getAmount(),
            description: this.getDescription(),
            category: this.getCategory(),
            date: this.getDate(),
            user: this.getUser(),
        };
    }

}