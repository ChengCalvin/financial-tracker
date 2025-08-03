export enum DefaultCategory {
    // Income categories
    SALARY = 'salary',
    FREELANCE = 'freelance',
    INVESTMENT = 'investment',
    BUSINESS = 'business',
    OTHER_INCOME = 'other_income',
    
    // Expense categories
    FOOD = 'food',
    TRANSPORTATION = 'transportation',
    HOUSING = 'housing',
    UTILITIES = 'utilities',
    ENTERTAINMENT = 'entertainment',
    HEALTHCARE = 'healthcare',
    EDUCATION = 'education',
    SHOPPING = 'shopping',
    SUBSCRIPTIONS = 'subscriptions',
    OTHER_EXPENSE = 'other_expense'
}

export enum CategoryType {
    INCOME = 'income',
    EXPENSE = 'expense',
    BOTH = 'both'
}

export interface Category {
    id: string;
    name: string;
    type: CategoryType;
    color?: string; // For UI customization
    icon?: string; // For UI customization
    isDefault: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class CategoryManager {
    private categories: Map<string, Category> = new Map();
    private nextCustomId: number = 1;

    constructor() {
        this.initializeDefaultCategories();
    }

    private initializeDefaultCategories(): void {
        // Add default income categories
        this.addDefaultCategory('salary', 'Salary', CategoryType.INCOME, '#4CAF50');
        this.addDefaultCategory('freelance', 'Freelance', CategoryType.INCOME, '#8BC34A');
        this.addDefaultCategory('investment', 'Investment', CategoryType.INCOME, '#CDDC39');
        this.addDefaultCategory('business', 'Business', CategoryType.INCOME, '#FFEB3B');
        this.addDefaultCategory('other_income', 'Other Income', CategoryType.INCOME, '#FFC107');

        // Add default expense categories
        this.addDefaultCategory('food', 'Food & Dining', CategoryType.EXPENSE, '#FF5722');
        this.addDefaultCategory('transportation', 'Transportation', CategoryType.EXPENSE, '#795548');
        this.addDefaultCategory('housing', 'Housing', CategoryType.EXPENSE, '#607D8B');
        this.addDefaultCategory('utilities', 'Utilities', CategoryType.EXPENSE, '#9C27B0');
        this.addDefaultCategory('entertainment', 'Entertainment', CategoryType.EXPENSE, '#E91E63');
        this.addDefaultCategory('healthcare', 'Healthcare', CategoryType.EXPENSE, '#F44336');
        this.addDefaultCategory('education', 'Education', CategoryType.EXPENSE, '#2196F3');
        this.addDefaultCategory('shopping', 'Shopping', CategoryType.EXPENSE, '#00BCD4');
        this.addDefaultCategory('subscriptions', 'Subscriptions', CategoryType.EXPENSE, '#3F51B5');
        this.addDefaultCategory('other_expense', 'Other Expense', CategoryType.EXPENSE, '#9E9E9E');
    }

    private addDefaultCategory(id: string, name: string, type: CategoryType, color: string): void {
        const category: Category = {
            id,
            name,
            type,
            color,
            isDefault: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.categories.set(id, category);
    }

    // Public methods
    public createCustomCategory(name: string, type: CategoryType, color?: string, icon?: string): Category {
        const id = `custom_${this.nextCustomId++}`;
        const category: Category = {
            id,
            name,
            type,
            color: color || this.getRandomColor(),
            icon,
            isDefault: false,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.categories.set(id, category);
        return category;
    }

    public getCategory(id: string): Category | undefined {
        return this.categories.get(id);
    }

    public getAllCategories(): Category[] {
        return Array.from(this.categories.values());
    }

    public getActiveCategories(): Category[] {
        return this.getAllCategories().filter(cat => cat.isActive);
    }

    public getCategoriesByType(type: CategoryType): Category[] {
        return this.getActiveCategories().filter(cat => 
            cat.type === type || cat.type === CategoryType.BOTH
        );
    }

    public getIncomeCategories(): Category[] {
        return this.getCategoriesByType(CategoryType.INCOME);
    }

    public getExpenseCategories(): Category[] {
        return this.getCategoriesByType(CategoryType.EXPENSE);
    }

    public getDefaultCategories(): Category[] {
        return this.getAllCategories().filter(cat => cat.isDefault);
    }

    public getCustomCategories(): Category[] {
        return this.getAllCategories().filter(cat => !cat.isDefault);
    }

    public updateCategory(id: string, updates: Partial<Category>): boolean {
        const category = this.categories.get(id);
        if (!category) return false;

        // Don't allow updating default categories' core properties
        if (category.isDefault) {
            const { id: _, isDefault: __, createdAt: ___, ...safeUpdates } = updates;
            Object.assign(category, safeUpdates);
        } else {
            Object.assign(category, updates);
        }

        category.updatedAt = new Date();
        return true;
    }

    public deleteCategory(id: string): boolean {
        const category = this.categories.get(id);
        if (!category || category.isDefault) return false; // Can't delete default categories

        this.categories.delete(id);
        return true;
    }

    public deactivateCategory(id: string): boolean {
        const category = this.categories.get(id);
        if (!category) return false;

        category.isActive = false;
        category.updatedAt = new Date();
        return true;
    }

    public activateCategory(id: string): boolean {
        const category = this.categories.get(id);
        if (!category) return false;

        category.isActive = true;
        category.updatedAt = new Date();
        return true;
    }

    public searchCategories(query: string): Category[] {
        const lowercaseQuery = query.toLowerCase();
        return this.getActiveCategories().filter(cat => 
            cat.name.toLowerCase().includes(lowercaseQuery)
        );
    }

    public getCategoryByName(name: string): Category | undefined {
        return this.getActiveCategories().find(cat => 
            cat.name.toLowerCase() === name.toLowerCase()
        );
    }

    public isCategoryNameTaken(name: string, excludeId?: string): boolean {
        return this.getActiveCategories().some(cat => 
            cat.name.toLowerCase() === name.toLowerCase() && cat.id !== excludeId
        );
    }

    private getRandomColor(): string {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
            '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Import/Export functionality
    public exportCategories(): string {
        return JSON.stringify({
            categories: Array.from(this.categories.values()),
            nextCustomId: this.nextCustomId
        }, null, 2);
    }

    public importCategories(jsonData: string): boolean {
        try {
            const data = JSON.parse(jsonData);
            if (data.categories && Array.isArray(data.categories)) {
                // Clear existing custom categories
                const defaultCategories = this.getDefaultCategories();
                this.categories.clear();
                
                // Restore default categories
                defaultCategories.forEach(cat => this.categories.set(cat.id, cat));
                
                // Import custom categories
                data.categories.forEach((cat: Category) => {
                    if (!cat.isDefault) {
                        this.categories.set(cat.id, cat);
                    }
                });
                
                // Update next custom ID
                if (data.nextCustomId) {
                    this.nextCustomId = data.nextCustomId;
                }
                
                return true;
            }
        } catch (error) {
            console.error('Failed to import categories:', error);
        }
        return false;
    }
} 