import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ItemCard = ({ item }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.left}>{item.date}</Text>
            <Text style={styles.center}>{item.category}</Text>
            <Text style={styles.right}>${item.amount}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
        marginVertical: 4,
        marginHorizontal: 4,
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        display: 'flex',
        flexDirection: 'row',
    },
    left: {
        flex: 1,
        textAlign: 'left',
    },
    center: {
        flex: 1,
        textAlign: 'center',
    },
    right: {
        flex: 1,
        textAlign: 'right',
    },
});