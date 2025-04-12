import { Dimensions, StyleSheet } from "react-native";
const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const ITEM_MARGIN = 10;
const ITEM_WIDTH = (screenWidth - ITEM_MARGIN * (numColumns + 1)) / numColumns;
export const expenseFormStyles = StyleSheet.create({
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        // marginBottom: 16,
        paddingHorizontal: 10,
    },
    categoryContainer:{
        width: '100%',
        // height: 200,
        flexGrow: 1,
        
        // marginBottom: 16,
        
    },
    flatList: {
        // maxHeight: 200, // Set a max height for the scroll view
        marginBottom: 16,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: ITEM_MARGIN,
        paddingVertical: ITEM_MARGIN,
    },
    categoryItem: {
        // flex: 1,
        width: ITEM_WIDTH-24,
        padding: 10,
        margin: 2,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        flex: 1,
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
})