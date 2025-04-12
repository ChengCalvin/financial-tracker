import { View, StyleSheet, Text, ScrollView, Modal, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { Button, Card, Portal, Dialog, TextInput, useTheme, Modal as PModal } from "react-native-paper";
import React, { useEffect, useRef, useState } from "react";
// import Button from "../components/button/button";
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { homeStyles } from "../styles/home";
import { Picker } from '@react-native-picker/picker';
import { BarChart, LineChart, PieChart, PopulationPyramid, RadarChart } from "react-native-gifted-charts";
import { useExpense } from "../features/expense/useExpense";
import { ItemCard } from "../components/itemCard/itemCard";
import { ExpenseForm } from "../features/expense/expense.form";


export const HomeScreen = () => {
    const [visible, setVisible] = useState(false);
    const { expense, addNewExpense, initExepenseCollection, removeExpense, getTotalAmount, updateExpense } = useExpense();
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date()); // Default to today's date

    useEffect(() => {
        initExepenseCollection();
    }, [])


    const showModal = () => {
        setVisible(true);
    }

    const hideModal = () => {
        setVisible(false);
    };

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
        hideModal();
    }
    console.log(expense);
    return (
        <SafeAreaProvider>
            <SafeAreaView style={homeStyles.container} edges={['top', 'bottom']}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={visible}
                    onRequestClose={hideModal}
                    onTouchCancel={hideModal}
                    onDismiss={hideModal}
                >
                    {/* <TouchableWithoutFeedback onPress={hideModal}> */}
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={homeStyles.modalOverlay}>
                            <TouchableWithoutFeedback>
                                <ExpenseForm />
                                {/* <View style={homeStyles.modalContainer}>
                                    <Text style={homeStyles.modalTitle}>Add Expense</Text>
                                    <TextInput
                                        placeholder="Amount"
                                        value={amount}
                                        onChangeText={setAmount}
                                        keyboardType="numeric"
                                        style={homeStyles.input}
                                    />
                                    <TextInput
                                        placeholder="Category"
                                        value={category}
                                        onChangeText={setCategory}
                                        style={homeStyles.input}
                                    />
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={date}
                                        mode="date"
                                        is24Hour={true}
                                        onChange={(e, date) => {console.log('Date changed', date)}} // Placeholder for date change handler
                                    />
                                    <View style={homeStyles.buttonContainer}>
                                        <TouchableOpacity style={homeStyles.button} onPress={handleSubmit}>
                                            <Text style={homeStyles.buttonText}>Submit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[homeStyles.button, homeStyles.cancelButton]} onPress={hideModal}>
                                            <Text style={homeStyles.buttonText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View> */}
                            </TouchableWithoutFeedback>
                        </KeyboardAvoidingView>
                    {/* </TouchableWithoutFeedback> */}
                </Modal>
                <View style={homeStyles.toolbar}>
                    <Text>Calvin Cheng</Text>
                    <Text>Settings</Text>
                </View>
                <View style={homeStyles.summary}>
                    <Text>Summary</Text>
                    <Text>Total Amount: {getTotalAmount()}</Text>
                    <Text>Expenses Count: {expense.expenses.length}</Text>
                    {/* <PieChart
                        data={[{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }]}
                        radius={50}
                    /> */}
                </View>
                <View style={homeStyles.expenseToolbar}>
                    <Button
                        contentStyle={{ flexDirection: 'row-reverse' }}
                        icon="plus"
                        onPress={showModal}
                    >
                        <Text>Add</Text>
                    </Button>

                </View>
                <ScrollView style={homeStyles.scrollView}>
                    {expense.expenses.map((item, index) => (
                        <ItemCard key={index} item={item} />
                    ))}

                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}
