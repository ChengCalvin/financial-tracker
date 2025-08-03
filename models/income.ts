import { Category, CategoryManager } from './category';
import { Transaction, TransactionType } from './transaction';

export class Income extends Transaction {
    constructor(
        id: string,
        name: string,
        description: string,
        amount: number,
        date: Date,
        category: Category
    ) {
        super(id, name, description, amount, date, category, TransactionType.INCOME);
    }

    // Static factory method for creating income with default category
    public static createWithDefaultCategory(
        id: string,
        name: string,
        description: string,
        amount: number,
        date: Date,
        categoryManager: CategoryManager
    ): Income {
        const defaultCategory = categoryManager.getIncomeCategories().find(cat => cat.id === 'salary') ||
                               categoryManager.getIncomeCategories()[0];
        return new Income(id, name, description, amount, date, defaultCategory!);
    }

    // Income-specific methods
    public getMonthlyEquivalent(): number {
        // Calculate monthly equivalent for irregular income
        const now = new Date();
        const monthsDiff = (now.getFullYear() - this.date.getFullYear()) * 12 + 
                          (now.getMonth() - this.date.getMonth());
        return monthsDiff > 0 ? this.amount / monthsDiff : this.amount;
    }

    public isRecurring(): boolean {
        // Simple logic to determine if income is recurring
        // You can enhance this based on your needs
        const recurringCategoryIds = ['salary', 'freelance', 'investment', 'business'];
        return recurringCategoryIds.includes(this.getCategory().id);
    }

    public getIncomeType(): string {
        return this.getCategory().name;
    }
} 