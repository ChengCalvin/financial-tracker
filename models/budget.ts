import { Category, CategoryManager } from './category';
import { Expense } from './expense';
import { Income } from './income';
import { Transaction, TransactionType } from './transaction';

export interface BudgetSummary {
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
    incomeCount: number;
    expenseCount: number;
    savingsRate: number; // percentage of income saved
}

export interface CategorySummary {
    category: Category;
    totalAmount: number;
    transactionCount: number;
    percentage: number;
}

export class Budget {
    private transactions: Transaction[] = [];
    private id: string;
    private name: string;
    private description: string;
    private categoryManager: CategoryManager;
    private limit: number = 1000; // Default budget limit

    constructor(id: string, name: string, description: string = '', categoryManager?: CategoryManager) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.categoryManager = categoryManager || new CategoryManager();
    }

    // Basic getters
    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getDescription(): string {
        return this.description;
    }

    public getCategoryManager(): CategoryManager {
        return this.categoryManager;
    }

    public getLimit(): number {
        return this.limit;
    }

    public setLimit(newLimit: number): void {
        if (newLimit > 0) {
            this.limit = newLimit;
        } else {
            throw new Error("Budget limit must be greater than 0");
        }
    }

    // Transaction management
    public addTransaction(transaction: Transaction): void {
        this.transactions.push(transaction);
    }

    public removeTransaction(id: string): boolean {
        const index = this.transactions.findIndex(t => t.getId() === id);
        if (index !== -1) {
            this.transactions.splice(index, 1);
            return true;
        }
        return false;
    }

    public getTransaction(id: string): Transaction | undefined {
        return this.transactions.find(t => t.getId() === id);
    }

    public getAllTransactions(): Transaction[] {
        return [...this.transactions];
    }

    public getTransactionsByType(type: TransactionType): Transaction[] {
        return this.transactions.filter(t => t.getType() === type);
    }

    public getTransactionsByCategory(categoryId: string): Transaction[] {
        return this.transactions.filter(t => t.getCategory().id === categoryId);
    }

    public getTransactionsByDateRange(startDate: Date, endDate: Date): Transaction[] {
        return this.transactions.filter(t =>
            t.getDate() >= startDate && t.getDate() <= endDate
        );
    }

    // Financial calculations
    public getTotalIncome(): number {
        const incomeTransactions = this.transactions.filter(t => t.isIncome());
        const total = incomeTransactions.reduce((sum, t) => sum + t.getAmount(), 0);
        console.log('getTotalIncome:', total, 'from', incomeTransactions.length, 'transactions');
        return total;
    }

    public getTotalExpenses(): number {
        const expenseTransactions = this.transactions.filter(t => t.isExpense());
        const total = expenseTransactions.reduce((sum, t) => sum + t.getAmount(), 0);
        console.log('getTotalExpenses:', total, 'from', expenseTransactions.length, 'transactions');
        return total;
    }

    public getNetAmount(): number {
        return this.getTotalIncome() - this.getTotalExpenses();
    }

    public getSavingsRate(): number {
        const totalIncome = this.getTotalIncome();
        if (totalIncome === 0) return 0;
        return (this.getNetAmount() / totalIncome) * 100;
    }

    // Dashboard data methods
    public getBudgetSummary(): BudgetSummary {
        console.log('Budget.getBudgetSummary() called');
        console.log('Transactions count:', this.transactions.length);
        console.log('CategoryManager type:', typeof this.categoryManager);

        const totalIncome = this.getTotalIncome();
        const totalExpenses = this.getTotalExpenses();
        const incomeCount = this.getTransactionsByType(TransactionType.INCOME).length;
        const expenseCount = this.getTransactionsByType(TransactionType.EXPENSE).length;

        const summary = {
            totalIncome,
            totalExpenses,
            netAmount: totalIncome - totalExpenses,
            incomeCount,
            expenseCount,
            savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
        };

        console.log('Budget summary calculated:', summary);
        return summary;
    }

    public getIncomeByCategory(): CategorySummary[] {
        const incomeTransactions = this.getTransactionsByType(TransactionType.INCOME);
        const totalIncome = this.getTotalIncome();

        const categoryMap = new Map<string, { amount: number, count: number, category: Category }>();

        incomeTransactions.forEach(transaction => {
            const category = transaction.getCategory();
            const current = categoryMap.get(category.id) || { amount: 0, count: 0, category };
            categoryMap.set(category.id, {
                amount: current.amount + transaction.getAmount(),
                count: current.count + 1,
                category
            });
        });

        return Array.from(categoryMap.values()).map(data => ({
            category: data.category,
            totalAmount: data.amount,
            transactionCount: data.count,
            percentage: totalIncome > 0 ? (data.amount / totalIncome) * 100 : 0
        }));
    }

    public getExpensesByCategory(): CategorySummary[] {
        const expenseTransactions = this.getTransactionsByType(TransactionType.EXPENSE);
        const totalExpenses = this.getTotalExpenses();

        const categoryMap = new Map<string, { amount: number, count: number, category: Category }>();

        expenseTransactions.forEach(transaction => {
            const category = transaction.getCategory();
            const current = categoryMap.get(category.id) || { amount: 0, count: 0, category };
            categoryMap.set(category.id, {
                amount: current.amount + transaction.getAmount(),
                count: current.count + 1,
                category
            });
        });

        return Array.from(categoryMap.values()).map(data => ({
            category: data.category,
            totalAmount: data.amount,
            transactionCount: data.count,
            percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
        }));
    }

    public getMonthlyBreakdown(year: number, month: number): BudgetSummary {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const monthlyTransactions = this.getTransactionsByDateRange(startDate, endDate);

        const totalIncome = monthlyTransactions
            .filter(t => t.isIncome())
            .reduce((sum, t) => sum + t.getAmount(), 0);

        const totalExpenses = monthlyTransactions
            .filter(t => t.isExpense())
            .reduce((sum, t) => sum + t.getAmount(), 0);

        return {
            totalIncome,
            totalExpenses,
            netAmount: totalIncome - totalExpenses,
            incomeCount: monthlyTransactions.filter(t => t.isIncome()).length,
            expenseCount: monthlyTransactions.filter(t => t.isExpense()).length,
            savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
        };
    }

    public getTopExpenses(limit: number = 5): Expense[] {
        return this.getTransactionsByType(TransactionType.EXPENSE)
            .map(t => t as Expense)
            .sort((a, b) => b.getAmount() - a.getAmount())
            .slice(0, limit);
    }

    public getEssentialExpenses(): Expense[] {
        return this.getTransactionsByType(TransactionType.EXPENSE)
            .map(t => t as Expense)
            .filter(expense => expense.isEssential());
    }

    public getDiscretionaryExpenses(): Expense[] {
        return this.getTransactionsByType(TransactionType.EXPENSE)
            .map(t => t as Expense)
            .filter(expense => expense.isDiscretionary());
    }

    getMonthlyIncomeData(): number[] {
        const monthlyData = Array(12).fill(0);
        this.transactions
            .filter((t) => t.isIncome())
            .forEach((t) => {
                const month = t.getDate().getMonth();
                monthlyData[month] += t.getAmount();
            });
        return monthlyData;
    }

    getMonthlyExpenseData(): number[] {
        const monthlyData = Array(12).fill(0);
        this.transactions
            .filter((t) => !t.isIncome())
            .forEach((t) => {
                const month = t.getDate().getMonth();
                monthlyData[month] += t.getAmount();
            });
        return monthlyData;
    }

    public getCategorySummary(): { id: string; name: string; total: number; percentage: number }[] {
        const categoryMap = new Map<string, { total: number; name: string }>();
    
        // Group transactions by category
        this.transactions.forEach((transaction) => {
            const category = transaction.getCategory();
            const current = categoryMap.get(category.id) || { total: 0, name: category.name };
            categoryMap.set(category.id, {
                total: current.total + transaction.getAmount(),
                name: category.name,
            });
        });
    
        // Calculate the total amount for all transactions
        const totalAmount = this.transactions.reduce((sum, t) => sum + t.getAmount(), 0);
    
        // Map the category data into the expected format
        return Array.from(categoryMap.entries()).map(([id, data]) => ({
            id,
            name: data.name,
            total: data.total,
            percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
        }));
    }

    // Utility methods
    public getTransactionCount(): number {
        return this.transactions.length;
    }

    public clearAllTransactions(): void {
        this.transactions = [];
    }

    public exportToJSON(): string {
        return JSON.stringify({
            id: this.id,
            name: this.name,
            description: this.description,
            limit: this.limit,
            categories: this.categoryManager.exportCategories(),
            transactions: this.transactions.map(t => ({
                id: t.getId(),
                name: t.getName(),
                description: t.getDescription(),
                amount: t.getAmount(),
                date: t.getDate().toISOString(),
                categoryId: t.getCategory().id,
                type: t.getType()
            }))
        }, null, 2);
    }

    public importFromJSON(jsonData: string): boolean {
        try {
            const data = JSON.parse(jsonData);
            console.log('Importing budget data:', data);

            // Import basic properties
            if (data.id) this.id = data.id;
            if (data.name) this.name = data.name;
            if (data.description) this.description = data.description;
            this.limit = data.limit || 1000;

            // Import categories if provided
            if (data.categories) {
                this.categoryManager.importCategories(data.categories);
            }

            // Clear existing transactions
            this.transactions = [];

            // Import transactions
            if (data.transactions && Array.isArray(data.transactions)) {
                console.log('Importing', data.transactions.length, 'transactions');
                data.transactions.forEach((t: any) => {
                    const category = this.categoryManager.getCategory(t.categoryId);
                    if (category) {
                        const transaction = t.type === TransactionType.INCOME
                            ? new Income(t.id, t.name, t.description, t.amount, new Date(t.date), category)
                            : new Expense(t.id, t.name, t.description, t.amount, new Date(t.date), category);
                        this.addTransaction(transaction);
                    } else {
                        console.warn('Category not found for transaction:', t.categoryId);
                    }
                });
            }

            console.log('Budget import completed. Transactions count:', this.transactions.length);
            return true;
        } catch (error) {
            console.error('Failed to import budget:', error);
            return false;
        }
    }
} 