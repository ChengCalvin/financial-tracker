import { Ionicons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import PagerView from "react-native-pager-view";

import { useBudgetStore } from "../../store/budgetStore";

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen() {
  const router = useRouter();
  const currentUser = auth().currentUser;

  const {
    budget,
    loading,
    initializeBudget,
    getBudgetSummary,
    deleteTransaction,
    addTransaction,
    getValidCategoryManager,
  } = useBudgetStore();

  // Edit state
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    amount: "",
    categoryId: "",
  });
  const [editFormattedAmount, setEditFormattedAmount] = useState("");
  const [activePage, setActivePage] = useState(0);

  // Customizable reports
  const [selectedReports, setSelectedReports] = useState<string[]>([
    "incomeVsExpenses",
    "savingsRate",
    "categoryBreakdown",
  ]);

  // Initialize budget when component mounts
  useEffect(() => {
    if (currentUser && !budget) {
      initializeBudget(currentUser.uid);
    }

    // Load user preferences for reports
    // const loadPreferences = async () => {
    //   const storedReports = await AsyncStorage.getItem("selectedReports");
    //   if (storedReports) {
    //     setSelectedReports(JSON.parse(storedReports));
    //   }
    // };
    // loadPreferences();
  }, [currentUser, budget, initializeBudget]);

  const budgetSummary = getBudgetSummary();

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

  const renderReport = (reportType: string) => {
    switch (reportType) {
      case "incomeVsExpenses":
        return (
          <View style={styles.reportContainer}>
            <Text style={styles.reportTitle}>Income vs Expenses</Text>
            <BarChart
              data={{
                labels: ["Income", "Expenses"],
                datasets: [
                  {
                    data: [
                      budgetSummary?.totalIncome || 0,
                      budgetSummary?.totalExpenses || 0,
                    ],
                  },
                ],
              }}
              width={screenWidth - 40} // Adjust width to fit the screen
              height={220}
              chartConfig={{
                backgroundColor: "#f8f9fa",
                backgroundGradientFrom: "#f8f9fa",
                backgroundGradientTo: "#f8f9fa",
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              style={styles.chart} yAxisLabel={""} yAxisSuffix={""}            />
          </View>
        );
      case "savingsRate":
        return (
          <View style={styles.reportContainer}>
            <Text style={styles.reportTitle}>Savings Rate</Text>
            <PieChart
              data={[
                {
                  name: "Saved",
                  amount: budgetSummary ? budgetSummary.totalIncome - budgetSummary.totalExpenses : 0,
                  color: "#4CAF50",
                  legendFontColor: "#333",
                  legendFontSize: 12,
                },
                {
                  name: "Spent",
                  amount: budgetSummary?.totalExpenses || 0,
                  color: "#F44336",
                  legendFontColor: "#333",
                  legendFontSize: 12,
                },
              ]}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: "#f8f9fa",
                backgroundGradientFrom: "#f8f9fa",
                backgroundGradientTo: "#f8f9fa",
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              }}
              accessor={"amount"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              style={styles.chart}
            />
          </View>
        );
      case "categoryBreakdown":
        const categoryData = budget?.getCategorySummary().map((category) => ({
          name: category.name,
          amount: category.total,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
          legendFontColor: "#333",
          legendFontSize: 12,
        }));

        return (
          <View style={styles.reportContainer}>
            <Text style={styles.reportTitle}>Category Breakdown</Text>
            <PieChart
              data={categoryData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: "#f8f9fa",
                backgroundGradientFrom: "#f8f9fa",
                backgroundGradientTo: "#f8f9fa",
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              }}
              accessor={"amount"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              style={styles.chart}
            />
          </View>
        );
      default:
        return null;
    }
  };

  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {selectedReports.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              activePage === index && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  const handleSignOut = () => {
    auth().signOut();
  };

  const navigateToTransactions = () => {
    (router as any).push('transactions');
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

  const handleEditAmountChange = (text: string) => {
    const formatted = formatCurrency(text);
    setEditFormattedAmount(formatted);
    setEditFormData({ ...editFormData, amount: formatted });
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

    const categoryManager = getValidCategoryManager();
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
    const categoryManager = getValidCategoryManager();
    return categoryManager.getExpenseCategories();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.userEmail}>
            {currentUser?.displayName || currentUser?.email}
          </Text>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={() => auth().signOut()}>
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => (router as any).push("transactions")}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="add-circle-outline" size={32} color="#007AFF" />
          </View>
          <Text style={styles.actionText}>Add Transaction</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => (router as any).push("reports")}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="analytics-outline" size={32} color="#4CAF50" />
          </View>
          <Text style={styles.actionText}>View Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => (router as any).push("settings")}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="settings-outline" size={32} color="#FF9800" />
          </View>
          <Text style={styles.actionText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Budget Overview */}
      {budgetSummary && (
        <View style={styles.overviewContainer}>
          <Text style={styles.overviewTitle}>Budget Overview</Text>
          <PagerView 
          style={styles.pagerView} 
          initialPage={0}
          onPageSelected={(e) => setActivePage(e.nativeEvent.position)}
          >
            {selectedReports.map((reportType, index) => (
              <View key={index} style={styles.page}>
                {renderReport(reportType)}
              </View>
            ))}
          </PagerView>
          {renderPaginationDots()}
          <TouchableOpacity
            style={styles.customizeButton}
            onPress={() => (router as any).push("customizeOverview")}
          >
            <Text style={styles.customizeButtonText}>Customize Overview</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recent Transactions */}
      <ScrollView style={styles.recentContainer}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={navigateToTransactions}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {!budget?.getAllTransactions?.()?.length || budget?.getAllTransactions?.()?.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={48} color="#999" />
            <Text style={styles.emptyStateText}>No transactions yet</Text>
            <TouchableOpacity style={styles.addFirstButton} onPress={navigateToTransactions}>
              <Text style={styles.addFirstButtonText}>Add Your First Transaction</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {budget?.getAllTransactions?.()?.slice(0, 3).map((transaction) => (
              <View key={transaction.getId()} style={styles.recentItem}>
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
                          onPress={() => setEditFormData({ ...editFormData, categoryId: category.id })}
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
                  <View style={styles.recentItem}>
                    <View style={styles.recentItemInfo}>
                      <Text style={styles.recentItemName}>{transaction.getName()}</Text>
                      <Text style={styles.recentItemCategory}>
                        {transaction.getCategory().name}
                      </Text>
                    </View>
                    <View style={styles.recentItemActions}>
                      <Text style={[
                        styles.recentItemAmount,
                        { color: transaction.isIncome() ? '#4CAF50' : '#F44336' }
                      ]}>
                        {transaction.isIncome() ? '+' : '-'}${transaction.getAmount().toFixed(2)}
                      </Text>
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => startQuickEdit(transaction)}
                        >
                          <Ionicons name="pencil-outline" size={16} color="#007AFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
    // backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  signOutButton: {
    padding: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  overviewContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  overviewAmountIncome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  overviewAmountExpense: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
  },
  netContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  netLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  netAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  savingsRate: {
    fontSize: 12,
    color: '#999',
  },
  recentContainer: {
    // backgroundColor: 'white',
    margin: 8,
    padding: 20,
    borderRadius: 12,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 16,
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    // borderBottomWidth: 1,
    // borderBottomColor: '#f0f0f0',
    minHeight: 40,
  },
  recentItemInfo: {
    flex: 1,
  },
  recentItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  recentItemCategory: {
    fontSize: 12,
    color: '#999',
  },
  recentItemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  editContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    fontSize: 14,
    color: '#333',
    backgroundColor: 'white',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: 'white',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#666',
    marginRight: 5,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingVertical: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  categoryButtonActive: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  categoryButtonTextActive: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  categoryColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    // borderWidth: 1,
    // borderColor: '#007AFF',
  },
  cancelEditButton: {
    borderColor: '#F44336',
    borderWidth: 1,
  },
  cancelEditButtonText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '600',
  },
  saveEditButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  saveEditButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  recentItemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // minWidth: 120,
  },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  pagerView: {
    height: 200,
  },
  page: {
    justifyContent: "center",
    alignItems: "center",
  },
  reportContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  reportRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  reportItem: {
    alignItems: "center",
  },
  reportLabel: {
    fontSize: 14,
    color: "#666",
  },
  reportValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: "#666",
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  customizeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
  },
  customizeButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#007AFF",
  },
});