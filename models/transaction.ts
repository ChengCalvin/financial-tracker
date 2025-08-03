import { Category } from './category';

export enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense'
}

export abstract class Transaction {
    constructor(
        protected id: string,
        protected name: string,
        protected description: string,
        protected amount: number,
        protected date: Date,
        protected category: Category,
        protected type: TransactionType
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.amount = amount;
        this.date = date;
        this.category = category;
        this.type = type;
    }

    // Getters
    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getDescription(): string {
        return this.description;
    }

    public getAmount(): number {
        return this.amount;
    }

    public getDate(): Date {
        return this.date;
    }

    public getCategory(): Category {
        return this.category;
    }

    public getType(): TransactionType {
        return this.type;
    }

    // Setters
    public setId(id: string): void {
        this.id = id;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public setDescription(description: string): void {
        this.description = description;
    }

    public setAmount(amount: number): void {
        this.amount = amount;
    }

    public setDate(date: Date): void {
        this.date = date;
    }

    public setCategory(category: Category): void {
        this.category = category;
    }

    // Utility methods
    public isIncome(): boolean {
        return this.type === TransactionType.INCOME;
    }

    public isExpense(): boolean {
        return this.type === TransactionType.EXPENSE;
    }

    public getFormattedAmount(): string {
        return `$${this.amount.toFixed(2)}`;
    }

    public getFormattedDate(): string {
        return this.date.toLocaleDateString();
    }
} 