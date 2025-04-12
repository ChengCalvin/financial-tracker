import React, { useState } from "react"
import { TouchableOpacity, View, Text, FlatList } from "react-native";
import { List, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useExpense } from "./useExpense";
import { ScrollView } from "react-native-gesture-handler";
import { expenseFormStyles } from "./expenseForm.style";

export const ExpenseForm = () => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date()); // Default to today's date
    const { expense, addNewExpense, initExepenseCollection, removeExpense, getTotalAmount, updateExpense } = useExpense();
    const handleSubmit = () => {
        if (amount === '' || category === '') {
            alert('Please fill in all fields');
            return;
        }
        addNewExpense({
            amount: Number(amount),
            category,
            description,
            date
        });
        updateExpense();
        // hideModal();
    }

    const categories = [
        'Tech', 'Health', 'Music', 'Art', 'Science',
        'History', 'Travel', 'Food', 'Sports', 'Finance'
    ];

    return (
        <View style={expenseFormStyles.modalContainer}>
            <Text style={expenseFormStyles.modalTitle}>Add Expense</Text>
            <TextInput
                placeholder="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={expenseFormStyles.input}
            />
            <View style={expenseFormStyles.categoryContainer}>
                <Text>Categories</Text>
                {/* <ScrollView style={expenseFormStyles.scrollView}> */}
                    <FlatList
                        data={categories}
                        numColumns={3}
                        keyExtractor={(item) => item.toString()}
                        renderItem={({ item }) => (
                            <Text style={expenseFormStyles.categoryItem}>{item}</Text>
                        )}
                        style={expenseFormStyles.flatList}
                    />
                    {/* <Text>
                        SomeInput
                    </Text>
                    <Text>
                        SomeInput
                    </Text>
                    <Text>
                        SomeInput
                    </Text>
                    <Text>
                        SomeInput
                    </Text>
                    <Text>
                        SomeInput
                    </Text> */}
                {/* </ScrollView> */}
            </View>
            {/* <List.Section title="Category" >
                <List.Accordion
                    title="Select Category"
                    left={props => <List.Icon {...props} icon="folder" />}
                >
                    <List.Item title="Food" onPress={() => setCategory('Food')} />
                    <List.Item title="Transport" onPress={() => setCategory('Transport')} />
                    <List.Item title="Entertainment" onPress={() => setCategory('Entertainment')} />
                </List.Accordion>
            </List.Section> */}
            <TextInput
                placeholder="Category"
                value={category}
                onChangeText={setCategory}
                style={expenseFormStyles.input}
            />
            <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                is24Hour={true}
                onChange={(e, date) => { console.log('Date changed', date) }} // Placeholder for date change handler
            />
            <View style={expenseFormStyles.buttonContainer}>
                <TouchableOpacity style={expenseFormStyles.button} onPress={handleSubmit}>
                    <Text style={expenseFormStyles.buttonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[expenseFormStyles.button, expenseFormStyles.cancelButton]}
                // onPress={hideModal}
                >
                    <Text style={expenseFormStyles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}