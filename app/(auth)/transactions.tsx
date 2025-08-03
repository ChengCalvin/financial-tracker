import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { CategoryType, Expense, Income, TransactionType } from '../../models';
import { useBudgetStore } from '../../store/budgetStore';

export default function TransactionsScreen() {
  const router = useRouter();
  const currentUser = auth().currentUser;
  
  const {
    budget,
    categoryManager,
    loading,
    error,
    initializeBudget,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    getBudgetSummary,
    getValidCategoryManager,
    clearError,
  } = useBudgetStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCustomCategoryModal, setShowCustomCategoryModal] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    categoryId: '',
  });
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [pendingCategoryId, setPendingCategoryId] = useState('');
  const [formattedAmount, setFormattedAmount] = useState('');
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    amount: '',
    categoryId: '',
  });
  const [editFormattedAmount, setEditFormattedAmount] = useState('');

  // Initialize budget when component mounts
  useEffect(() => {
    if (currentUser && !budget) {
      initializeBudget(currentUser.uid);
    }
  }, [currentUser, budget, initializeBudget]);

  // Debug budget object
  useEffect(() => {
    if (budget) {
      console.log('Budget type:', typeof budget);
      console.log('Budget methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(budget)));
      console.log('getAllTransactions method:', typeof budget.getAllTransactions);
      console.log('getBudgetSummary method:', typeof budget.getBudgetSummary);
    }
  }, [budget]);

  // Show loading state while budget is being initialized
  if (loading || !budget) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Clear error when it changes
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, clearError]);

  const handleAddTransaction = async () => {
    if (!formData.name || !formData.amount || !formData.categoryId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than 0');
      return;
    }

    const category = categoryManager.getCategory(formData.categoryId);
    if (!category) {
      Alert.alert('Error', 'Please select a valid category');
      return;
    }

    try {
      const transaction = transactionType === TransactionType.INCOME
        ? new Income(
            Date.now().toString(),
            formData.name,
            formData.description,
            amount,
            new Date(),
            category
          )
        : new Expense(
            Date.now().toString(),
            formData.name,
            formData.description,
            amount,
            new Date(),
            category
          );

      await addTransaction(transaction);
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction');
    } finally {
      setShowAddModal(false);
      resetForm();
    }
  };

  const handleDeleteTransaction = (transactionId: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTransaction(transactionId),
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      amount: '',
      categoryId: '',
    });
    setTransactionType(TransactionType.EXPENSE);
    setCustomCategoryName('');
    setPendingCategoryId('');
    setShowCustomCategoryModal(false);
    setFormattedAmount('');
    setEditingTransactionId(null);
    setEditFormData({
      name: '',
      description: '',
      amount: '',
      categoryId: '',
    });
    setEditFormattedAmount('');
  };

  const handleCategorySelection = (categoryId: string) => {
    const isOtherCategory = categoryId === 'other_expense' || categoryId === 'other_income';
    
    if (isOtherCategory) {
      setPendingCategoryId(categoryId);
      setShowCustomCategoryModal(true);
    } else {
      setFormData({ ...formData, categoryId });
    }
  };

  const handleCustomCategoryConfirm = () => {
    if (customCategoryName.trim()) {
      // Create a custom category
      const categoryType = pendingCategoryId === 'other_income' ? CategoryType.INCOME : CategoryType.EXPENSE;
      const validCategoryManager = getValidCategoryManager();
      
      // Create the custom category
      const customCategory = validCategoryManager.createCustomCategory(
        customCategoryName.trim(),
        categoryType,
        '#9E9E9E' // Default gray color
      );
      
      setFormData({ ...formData, categoryId: customCategory.id });
    } else {
      // Use the default "other" category
      setFormData({ ...formData, categoryId: pendingCategoryId });
    }
    
    setShowCustomCategoryModal(false);
    setCustomCategoryName('');
    setPendingCategoryId('');
  };

  const handleCustomCategoryCancel = () => {
    // Use the default "other" category
    setFormData({ ...formData, categoryId: pendingCategoryId });
    setShowCustomCategoryModal(false);
    setCustomCategoryName('');
    setPendingCategoryId('');
  };

  // Currency formatting functions
  const formatCurrency = (value: string): string => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Handle multiple decimal points
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    return numericValue;
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatCurrency(text);
    setFormattedAmount(formatted);
    setFormData({ ...formData, amount: formatted });
  };

  const formatDisplayAmount = (amount: string): string => {
    if (!amount) return '';
    
    const numericValue = parseFloat(amount);
    if (isNaN(numericValue)) return amount;
    
    // Format as currency with 2 decimal places
    return numericValue.toFixed(2);
  };

  const handleAmountFocus = () => {
    // If amount is empty, don't do anything
    if (!formattedAmount) return;
    
    // If amount doesn't have decimal places, add .00
    if (!formattedAmount.includes('.')) {
      const formatted = formattedAmount + '.00';
      setFormattedAmount(formatted);
      setFormData({ ...formData, amount: formatted });
    }
  };

  const handleAmountBlur = () => {
    // Format the amount to always show 2 decimal places
    if (formattedAmount && !formattedAmount.includes('.')) {
      const formatted = formattedAmount + '.00';
      setFormattedAmount(formatted);
      setFormData({ ...formData, amount: formatted });
    } else if (formattedAmount && formattedAmount.endsWith('.')) {
      const formatted = formattedAmount + '00';
      setFormattedAmount(formatted);
      setFormData({ ...formData, amount: formatted });
    } else if (formattedAmount && formattedAmount.split('.')[1]?.length === 1) {
      const formatted = formattedAmount + '0';
      setFormattedAmount(formatted);
      setFormData({ ...formData, amount: formatted });
    }
  };

  // Quick edit functions
  const startQuickEdit = (transaction: any) => {
    setEditingTransactionId(transaction.getId());
    setEditFormData({
      name: transaction.getName(),
      description: transaction.getDescription(),
      amount: transaction.getAmount().toString(),
      categoryId: transaction.getCategory().id,
    });
    setEditFormattedAmount(transaction.getAmount().toFixed(2));
  };

  const cancelQuickEdit = () => {
    setEditingTransactionId(null);
    setEditFormData({
      name: '',
      description: '',
      amount: '',
      categoryId: '',
    });
    setEditFormattedAmount('');
  };

  const handleEditAmountChange = (text: string) => {
    const formatted = formatCurrency(text);
    setEditFormattedAmount(formatted);
    setEditFormData({ ...editFormData, amount: formatted });
  };

  const handleEditCategorySelection = (categoryId: string) => {
    const isOtherCategory = categoryId === 'other_expense' || categoryId === 'other_income';
    
    if (isOtherCategory) {
      setPendingCategoryId(categoryId);
      setShowCustomCategoryModal(true);
    } else {
      setEditFormData({ ...editFormData, categoryId });
    }
  };

  const saveQuickEdit = async () => {
    if (!editingTransactionId || !editFormData.name || !editFormData.amount || !editFormData.categoryId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(editFormData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than 0');
      return;
    }

    const category = categoryManager.getCategory(editFormData.categoryId);
    if (!category) {
      Alert.alert('Error', 'Please select a valid category');
      return;
    }

    try {
      // Get the original transaction
      const originalTransaction = budget?.getTransaction(editingTransactionId);
      if (!originalTransaction) {
        Alert.alert('Error', 'Transaction not found');
        return;
      }

      // Update the transaction directly using its setter methods
      originalTransaction.setName(editFormData.name);
      originalTransaction.setDescription(editFormData.description);
      originalTransaction.setAmount(amount);
      originalTransaction.setCategory(category);

      // Trigger a re-render by updating the budget state
      // This is a workaround since we can't directly update the store state
      // We'll force a re-render by calling the store's sync method
      const { syncWithFirebase } = useBudgetStore.getState();
      await syncWithFirebase();
      
      cancelQuickEdit();
    } catch (error) {
      Alert.alert('Error', 'Failed to update transaction');
    }
  };

  const getAvailableCategories = () => {
    // Get a valid CategoryManager from the store
    const validCategoryManager = getValidCategoryManager();
    
    console.log('CategoryManager type:', typeof validCategoryManager);
    console.log('CategoryManager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(validCategoryManager)));
    console.log('getExpenseCategories method:', typeof validCategoryManager.getExpenseCategories);
    
    if (typeof validCategoryManager.getExpenseCategories === 'function') {
      const categories = transactionType === TransactionType.INCOME
        ? validCategoryManager.getIncomeCategories()
        : validCategoryManager.getExpenseCategories();
      console.log('Available categories:', categories);
      return categories;
    } else {
      console.error('CategoryManager methods are still not available');
      return [];
    }
  };

  console.log('Calculating budgetSummary...');
  console.log('Budget exists:', !!budget);
  console.log('Budget type:', typeof budget);
  if (budget) {
    console.log('Budget methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(budget)));
    console.log('getBudgetSummary method:', typeof budget.getBudgetSummary);
  }
  
  const budgetSummary = budget && typeof budget.getBudgetSummary === 'function' 
    ? budget.getBudgetSummary() 
    : null;
    
  console.log('BudgetSummary result:', budgetSummary);

  if (loading && !budget) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your budget...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Budget Summary */}
      {budgetSummary && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={styles.summaryAmountIncome}>
                ${budgetSummary.totalIncome.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={styles.summaryAmountExpense}>
                ${budgetSummary.totalExpenses.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Net</Text>
              <Text style={[
                styles.summaryAmountNet,
                { color: budgetSummary.netAmount >= 0 ? '#4CAF50' : '#F44336' }
              ]}>
                ${budgetSummary.netAmount.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Transactions List */}
      <ScrollView style={styles.transactionsContainer}>
        {!budget?.getAllTransactions()?.length || budget?.getAllTransactions()?.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={64} color="#999" />
            <Text style={styles.emptyStateText}>No transactions yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the + button to add your first transaction
            </Text>
          </View>
        ) : (
          budget?.getAllTransactions()?.map((transaction) => (
            <View key={transaction.getId()} style={styles.transactionItem}>
              {editingTransactionId === transaction.getId() ? (
                // Edit mode
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    placeholder="Transaction name"
                    value={editFormData.name}
                    onChangeText={(text) => setEditFormData({ ...editFormData, name: text })}
                  />
                  
                  <TextInput
                    style={styles.editInput}
                    placeholder="Description (optional)"
                    value={editFormData.description}
                    onChangeText={(text) => setEditFormData({ ...editFormData, description: text })}
                    multiline
                  />
                  
                  <View style={styles.amountContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0.00"
                      value={editFormattedAmount}
                      onChangeText={handleEditAmountChange}
                      keyboardType="numeric"
                      autoComplete="off"
                      autoCorrect={false}
                    />
                  </View>
                  
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                    {getAvailableCategories()?.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryButton,
                          editFormData.categoryId === category.id && styles.categoryButtonActive
                        ]}
                        onPress={() => handleEditCategorySelection(category.id)}
                      >
                        <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                        <Text style={[
                          styles.categoryButtonText,
                          editFormData.categoryId === category.id && styles.categoryButtonTextActive
                        ]}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={[styles.editButton, styles.cancelEditButton]}
                      onPress={cancelQuickEdit}
                    >
                      <Text style={styles.cancelEditButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.editButton, styles.saveEditButton]}
                      onPress={saveQuickEdit}
                    >
                      <Text style={styles.saveEditButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // Normal view
                <>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionName}>{transaction.getName()}</Text>
                    <Text style={styles.transactionDescription}>
                      {transaction.getDescription()}
                    </Text>
                    <Text style={styles.transactionCategory}>
                      {transaction.getCategory().name}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {transaction.getFormattedDate()}
                    </Text>
                  </View>
                  <View style={styles.transactionActions}>
                    <Text style={[
                      styles.transactionAmount,
                      { color: transaction.isIncome() ? '#4CAF50' : '#F44336' }
                    ]}>
                      {transaction.isIncome() ? '+' : '-'}${transaction.getAmount().toFixed(2)}
                    </Text>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => startQuickEdit(transaction)}
                      >
                        <Ionicons name="pencil-outline" size={20} color="#007AFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteTransaction(transaction.getId())}
                      >
                        <Ionicons name="trash-outline" size={20} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Transaction Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Transaction</Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Transaction Type Toggle */}
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionType === TransactionType.EXPENSE && styles.typeButtonActive
                ]}
                onPress={() => setTransactionType(TransactionType.EXPENSE)}
              >
                <Text style={[
                  styles.typeButtonText,
                  transactionType === TransactionType.EXPENSE && styles.typeButtonTextActive
                ]}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionType === TransactionType.INCOME && styles.typeButtonActive
                ]}
                onPress={() => setTransactionType(TransactionType.INCOME)}
              >
                <Text style={[
                  styles.typeButtonText,
                  transactionType === TransactionType.INCOME && styles.typeButtonTextActive
                ]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <TextInput
              style={styles.input}
              placeholder="Transaction name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
            />

            <Text style={styles.label}>Amount</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                value={formattedAmount}
                onChangeText={handleAmountChange}
                onFocus={handleAmountFocus}
                onBlur={handleAmountBlur}
                keyboardType="numeric"
                autoComplete="off"
                autoCorrect={false}
              />
            </View>

            {/* Category Picker */}
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
              {getAvailableCategories()?.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    formData.categoryId === category.id && styles.categoryButtonActive
                  ]}
                  onPress={() => handleCategorySelection(category.id)}
                >
                  <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                  <Text style={[
                    styles.categoryButtonText,
                    formData.categoryId === category.id && styles.categoryButtonTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Add Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddTransaction}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Add Transaction</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Custom Category Modal */}
      <Modal
        visible={showCustomCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Custom Category</Text>
            <TouchableOpacity onPress={handleCustomCategoryCancel}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.label}>
              Enter a name for your custom category:
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Category name"
              value={customCategoryName}
              onChangeText={setCustomCategoryName}
              autoFocus
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCustomCategoryCancel}
              >
                <Text style={styles.cancelButtonText}>Use Default</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCustomCategoryConfirm}
              >
                <Text style={styles.confirmButtonText}>Create Category</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryAmountIncome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  summaryAmountExpense: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
  },
  summaryAmountNet: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  transactionItem: {
    backgroundColor: 'white',
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionActions: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  typeButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#007AFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingVertical: 0,
  },
  editContainer: {
    flex: 1,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  editButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelEditButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  saveEditButton: {
    backgroundColor: '#007AFF',
  },
  cancelEditButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveEditButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 