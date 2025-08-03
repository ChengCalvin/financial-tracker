import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
  persist(
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
            console.log('Creating fresh CategoryManager');
            categoryManager = new CategoryManager();
          }
          
          console.log('CategoryManager type:', typeof categoryManager);
          console.log('CategoryManager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(categoryManager)));
          console.log('Income categories:', categoryManager.getIncomeCategories());
          console.log('Expense categories:', categoryManager.getExpenseCategories());
          
          // Ensure we have a valid Budget
          let budget = get().budget;
          if (!budget || typeof budget.getBudgetSummary !== 'function') {
            console.log('Creating fresh Budget');
            budget = new Budget(`budget_${userId}`, 'My Budget', '', categoryManager);
          }
          
          console.log('Budget type:', typeof budget);
          console.log('Budget methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(budget)));
          
          set({ budget, categoryManager, loading: false });
          
          // Try to load existing data from Firebase
          const loaded = await get().loadFromFirebase();
          
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
        console.log('getBudgetSummary called');
        console.log('Budget exists:', !!budget);
        console.log('Budget type:', typeof budget);
        
        // Ensure we have a valid Budget instance
        let validBudget = budget;
        if (!budget || typeof budget.getBudgetSummary !== 'function') {
          console.log('Budget is invalid, creating fresh instance');
          const categoryManager = new CategoryManager();
          validBudget = new Budget('temp', 'temp', '', categoryManager);
          // Update the store with the valid budget
          set({ budget: validBudget });
        }
        
        if (validBudget) {
          console.log('Budget methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(validBudget)));
          console.log('getBudgetSummary method type:', typeof validBudget.getBudgetSummary);
        }
        console.log(validBudget);
        
        if (validBudget && typeof validBudget.getBudgetSummary === 'function') {
          const summary = validBudget.getBudgetSummary();
          console.log('Budget summary:', summary);
          return summary;
        }
        console.log('Returning null for budget summary');
        return null;
      },

      // Get valid CategoryManager
      getValidCategoryManager: () => {
        const { categoryManager } = get();
        console.log('getValidCategoryManager called');
        console.log('CategoryManager exists:', !!categoryManager);
        console.log('CategoryManager type:', typeof categoryManager);
        
        // Ensure we have a valid CategoryManager instance
        let validCategoryManager = categoryManager;
        if (!categoryManager || typeof categoryManager.getIncomeCategories !== 'function') {
          console.log('CategoryManager is invalid, creating fresh instance');
          validCategoryManager = new CategoryManager();
          // Update the store with the valid categoryManager
          set({ categoryManager: validCategoryManager });
        }
        
        if (validCategoryManager) {
          console.log('CategoryManager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(validCategoryManager)));
          console.log('getIncomeCategories method type:', typeof validCategoryManager.getIncomeCategories);
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
    {
      name: 'budget-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        budget: state.budget ? state.budget.exportToJSON() : null,
        categoryManager: state.categoryManager.exportCategories(),
      }),
      onRehydrateStorage: () => (state) => {
        console.log('onRehydrateStorage called');
        console.log('State before rehydration:', state);
        
        if (state) {
          // Reconstruct CategoryManager instance from stored data
          if (state.categoryManager && typeof state.categoryManager === 'string') {
            console.log('Reconstructing CategoryManager from string');
            try {
              const categoryManager = new CategoryManager();
              const success = categoryManager.importCategories(state.categoryManager);
              if (success) {
                state.categoryManager = categoryManager;
                console.log('CategoryManager reconstructed successfully');
              } else {
                console.error('Failed to import CategoryManager');
              }
            } catch (error) {
              console.error('Error reconstructing CategoryManager:', error);
            }
          }
          
          // Reconstruct Budget instance from stored data
          if (state.budget && typeof state.budget === 'string') {
            console.log('Reconstructing Budget from string');
            try {
              // Create a new CategoryManager for the budget
              const categoryManager = new CategoryManager();
              
              // Create a new Budget instance
              const budget = new Budget('temp', 'temp', '', categoryManager);
              
              // Import the budget data
              const success = budget.importFromJSON(state.budget);
              console.log('Budget import success:', success);
              
              if (success) {
                state.budget = budget;
                console.log('Budget reconstructed successfully');
                console.log('Budget type:', typeof budget);
                console.log('Budget methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(budget)));
                console.log('getAllTransactions method:', typeof budget.getAllTransactions);
                console.log('getBudgetSummary method:', typeof budget.getBudgetSummary);
              } else {
                console.error('Failed to import budget from JSON');
                // Create a fresh budget if import fails
                state.budget = new Budget('temp', 'temp', '', new CategoryManager());
              }
            } catch (error) {
              console.error('Error reconstructing budget:', error);
              // Create a fresh budget if reconstruction fails
              state.budget = new Budget('temp', 'temp', '', new CategoryManager());
            }
          } else if (state.budget && typeof state.budget === 'object') {
            // If budget is already an object, try to reconstruct it
            console.log('Budget is already an object, attempting reconstruction');
            try {
              const categoryManager = new CategoryManager();
              const budget = new Budget('temp', 'temp', '', categoryManager);
              state.budget = budget;
            } catch (error) {
              console.error('Error creating fresh budget:', error);
            }
          } else {
            console.log('Budget data type:', typeof state.budget);
            console.log('Budget data:', state.budget);
            // Create a fresh budget if no data exists
            state.budget = new Budget('temp', 'temp', '', new CategoryManager());
          }
        }
        
        console.log('State after rehydration:', state);
      },
    }
  )
); 