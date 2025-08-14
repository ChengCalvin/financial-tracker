import { Dimensions, ScrollView, StyleSheet, Text } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { useBudgetStore } from "../../store/budgetStore";

export default function ReportsScreen() {
  const { budget } = useBudgetStore();

  // Example data for the charts
  const incomeData = budget?.getMonthlyIncomeData() || [500, 700, 800, 600, 900];
  const expenseData = budget?.getMonthlyExpenseData() || [300, 400, 500, 450, 600];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Financial Reports</Text>

      {/* Income Chart */}
      <Text style={styles.chartTitle}>Monthly Income</Text>
      <LineChart
        data={{
          labels: ["Jan", "Feb", "Mar", "Apr", "May"],
          datasets: [
            {
              data: incomeData,
              color: () => "#4CAF50", // Line color
            },
          ],
        }}
        width={Dimensions.get("window").width - 32}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
      />

      {/* Expense Chart */}
      <Text style={styles.chartTitle}>Monthly Expenses</Text>
      <BarChart
        data={{
          labels: ["Jan", "Feb", "Mar", "Apr", "May"],
          datasets: [
            {
              data: expenseData,
            },
          ],
        }}
        width={Dimensions.get("window").width - 32}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        yAxisLabel={""}
        yAxisSuffix={""}
      />
    </ScrollView>
  );
}

const chartConfig = {
  backgroundColor: "#f8f9fa",
  backgroundGradientFrom: "#f8f9fa",
  backgroundGradientTo: "#f8f9fa",
  decimalPlaces: 2,
  color: () => "#007AFF",
  labelColor: () => "#666",
  style: {
    borderRadius: 16,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  chart: {
    marginVertical: 16,
    borderRadius: 16,
  },
});