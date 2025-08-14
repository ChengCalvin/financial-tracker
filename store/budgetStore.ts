import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { create } from 'zustand';

import { scheduleBudgetAlert } from '@/utils/notifications';
import {
  Budget,
  BudgetSummary,
  Category,
  CategoryManager,
  CategoryType,
  Expense,
  Income
} from '../models';

interface BudgetState {
  // State
  budget: Budget | null;
  categoryManager: CategoryManager;
  loading: boolean;
  error: string | null;

  // Actions
  initializeBudget: (userId: string) => Promise<void>;
  addTransaction: (transaction: Income | Expense) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  updateTransaction: (transactionId: string, updates: Partial<Income | Expense>) => Promise<void>;

  // Category management
  createCategory: (name: string, type: CategoryType, color?: string) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Firebase sync
  syncWithFirebase: () => Promise<void>;
  loadFromFirebase: () => Promise<boolean>;

  // Utilities
  getBudgetSummary: () => BudgetSummary | null;
  getValidCategoryManager: () => CategoryManager;
  clearError: () => void;
  reset: () => void;
}

export const useBudgetStore = create<BudgetState>()(
  (set, get) => ({
    // Initial state
    budget: null,
    categoryManager: new CategoryManager(),
    loading: false,
    error: null,

    // Initialize budget for a user
    initializeBudget: async (userId: string) => {
      set({ loading: true, error: null });
      try {
        // Ensure we have a valid CategoryManager
        let categoryManager = get().categoryManager;
        if (!categoryManager || typeof categoryManager.getIncomeCategories !== 'function') {
          categoryManager = new CategoryManager();
        }

        // Ensure we have a valid Budget
        let budget = get().budget;
        if (!budget || typeof budget.getBudgetSummary !== 'function') {
          budget = new Budget(`budget_${userId}`, 'My Budget', '', categoryManager);
        }

        set({ budget, categoryManager, loading: false });

        // Try to load existing data from Firebase
        const loaded = await get().loadFromFirebase();
        console.log("Loaded existing budget:", loaded);
        // If no existing data was found, create and store the initial budget
        if (!loaded) {
          console.log('No existing budget found, creating new budget for user:', userId);
          await get().syncWithFirebase();
        } else {
          console.log('Successfully loaded existing budget for user:', userId);
        }
      } catch (error) {
        console.error('Failed to initialize budget:', error);
        set({ error: `Failed to initialize budget: ${error}`, loading: false });
      }
    },

    // Add a new transaction
    addTransaction: async (transaction: Income | Expense) => {
      const { budget } = get();
      if (!budget) {
        set({ error: 'Budget not initialized' });
        return;
      }

      set({ loading: true, error: null });
      try {
        if (budget.getTotalExpenses() > budget.getLimit()) {
          console.log("Budget exceeded!");
          await scheduleBudgetAlert(budget.getName());
        }
        budget.addTransaction(transaction);
        set({ loading: false });

        // Sync to Firebase
        await get().syncWithFirebase();
      } catch (error) {
        set({ error: `Failed to add transaction: ${error}`, loading: false });
      }
    },

    // Delete a transaction
    deleteTransaction: async (transactionId: string) => {
      const { budget } = get();
      if (!budget) {
        set({ error: 'Budget not initialized' });
        return;
      }

      set({ loading: true, error: null });
      try {
        const success = budget.removeTransaction(transactionId);
        if (success) {
          set({ loading: false });
          await get().syncWithFirebase();
        } else {
          set({ error: 'Transaction not found', loading: false });
        }
      } catch (error) {
        set({ error: `Failed to delete transaction: ${error}`, loading: false });
      }
    },

    // Update a transaction
    updateTransaction: async (transactionId: string, updates: Partial<Income | Expense>) => {
      const { budget } = get();
      if (!budget) {
        set({ error: 'Budget not initialized' });
        return;
      }

      set({ loading: true, error: null });
      try {
        const transaction = budget.getTransaction(transactionId);
        if (transaction) {
          // Apply updates
          Object.entries(updates).forEach(([key, value]) => {
            const setter = `set${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof typeof transaction;
            const setterMethod = transaction[setter];
            if (setterMethod && typeof setterMethod === 'function') {
              (setterMethod as Function)(value);
            }
          });

          set({ loading: false });
          await get().syncWithFirebase();
        } else {
          set({ error: 'Transaction not found', loading: false });
        }
      } catch (error) {
        set({ error: `Failed to update transaction: ${error}`, loading: false });
      }
    },

    // Create a new category
    createCategory: async (name: string, type: CategoryType, color?: string) => {
      const { categoryManager } = get();
      set({ loading: true, error: null });
      try {
        categoryManager.createCustomCategory(name, type, color);
        set({ loading: false });
        await get().syncWithFirebase();
      } catch (error) {
        set({ error: `Failed to create category: ${error}`, loading: false });
      }
    },

    // Update a category
    updateCategory: async (id: string, updates: Partial<Category>) => {
      const { categoryManager } = get();
      set({ loading: true, error: null });
      try {
        const success = categoryManager.updateCategory(id, updates);
        if (success) {
          set({ loading: false });
          await get().syncWithFirebase();
        } else {
          set({ error: 'Category not found or cannot be updated', loading: false });
        }
      } catch (error) {
        set({ error: `Failed to update category: ${error}`, loading: false });
      }
    },

    // Delete a category
    deleteCategory: async (id: string) => {
      const { categoryManager } = get();
      set({ loading: true, error: null });
      try {
        const success = categoryManager.deleteCategory(id);
        if (success) {
          set({ loading: false });
          await get().syncWithFirebase();
        } else {
          set({ error: 'Category not found or cannot be deleted', loading: false });
        }
      } catch (error) {
        set({ error: `Failed to delete category: ${error}`, loading: false });
      }
    },

    // Sync data to Firebase
    syncWithFirebase: async () => {
      const { budget } = get();
      const currentUser = auth().currentUser;

      if (!budget || !currentUser) return;

      try {
        const budgetData = budget.exportToJSON();
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('budgets')
          .doc(budget.getId())
          .set({
            data: budgetData,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
      } catch (error) {
        console.error('Failed to sync with Firebase:', error);
        set({ error: `Failed to sync with Firebase: ${error}` });
      }
    },

    // Load data from Firebase
    loadFromFirebase: async () => {
      const { budget } = get();
      const currentUser = auth().currentUser;

      if (!budget || !currentUser) return false;

      try {
        const doc = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('budgets')
          .doc(budget.getId())
          .get();
        console.log('Firebase document data:', doc.data());
        if (doc.exists() && doc.data()?.data) {
          budget.importFromJSON(doc.data()!.data);
          // Trigger a re-render by updating the state
          set({ budget });
          return true; // Indicate that data was loaded
        }
      } catch (error) {
        console.error('Failed to load from Firebase:', error);
        // Don't set error here as it's not critical for initial load
      }
      return false; // Indicate that no data was loaded
    },

    // Get budget summary
    getBudgetSummary: () => {
      const { budget } = get();

      // Ensure we have a valid Budget instance
      let validBudget = budget;
      if (!budget || typeof budget.getBudgetSummary !== 'function') {
        const categoryManager = new CategoryManager();
        validBudget = new Budget('temp', 'temp', '', categoryManager);
        // Update the store with the valid budget
        set({ budget: validBudget });
      }

      if (validBudget && typeof validBudget.getBudgetSummary === 'function') {
        const summary = validBudget.getBudgetSummary();
        return summary;
      }
      return null;
    },

    // Get valid CategoryManager
    getValidCategoryManager: () => {
      const { categoryManager } = get();

      // Ensure we have a valid CategoryManager instance
      let validCategoryManager = categoryManager;
      if (!categoryManager || typeof categoryManager.getIncomeCategories !== 'function') {
        validCategoryManager = new CategoryManager();
        // Update the store with the valid categoryManager
        set({ categoryManager: validCategoryManager });
      }
      return validCategoryManager;
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Reset store
    reset: () => set({
      budget: null,
      categoryManager: new CategoryManager(),
      loading: false,
      error: null
    }),
  }),
); 