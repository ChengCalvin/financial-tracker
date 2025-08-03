import { Category, CategoryManager } from './category';
import { Transaction, TransactionType } from './transaction';

export class Expense extends Transaction {
    constructor(
        id: string,
        name: string,
        description: string,
        amount: number,
        date: Date,
        category: Category
    ) {
        super(id, name, description, amount, date, category, TransactionType.EXPENSE);
    }

    // Static factory method for creating expense with default category
    public static createWithDefaultCategory(
        id: string,
        name: string,
        description: string,
        amount: number,
        date: Date,
        categoryManager: CategoryManager
    ): Expense {
        const defaultCategory = categoryManager.getExpenseCategories().find(cat => cat.id === 'other_expense') ||
                               categoryManager.getExpenseCategories()[0];
        return new Expense(id, name, description, amount, date, defaultCategory!);
    }

    // Expense-specific methods
    public isEssential(): boolean {
        // Determine if expense is essential (non-discretionary)
        const essentialCategoryIds = ['housing', 'utilities', 'food', 'transportation', 'healthcare'];
        return essentialCategoryIds.includes(this.getCategory().id);
    }

    public isDiscretionary(): boolean {
        return !this.isEssential();
    }

    public getExpenseType(): string {
        return this.getCategory().name;
    }

    public getPriority(): 'high' | 'medium' | 'low' {
        if (this.isEssential()) {
            return 'high';
        } else if (this.getCategory().id === 'education' || this.getCategory().id === 'subscriptions') {
            return 'medium';
        } else {
            return 'low';
        }
    }
}