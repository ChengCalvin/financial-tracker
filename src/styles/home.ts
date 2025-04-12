import { StatusBar, StyleSheet } from "react-native";
import { theme } from "./theme";

export const homeStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
        backgroundColor: theme.colors.background,
        flexDirection: 'column',
    },
    toolbar: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 8,

    },
    summary: {
        flex: 0.3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        height: 'auto',
        paddingHorizontal: 24,
        marginBottom: 12,
        marginHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.secondary,
    },
    scrollView: {
        flex: 0.4,
        marginHorizontal: 12,
        // borderWidth: 1,
        borderRadius: 8,
        // borderColor: theme.colors.secondary,
    },
    exexpenseSectionpense: {
        // backgroundColor: 'blue',
    },
    expenseToolbar: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    modal: {
        marginHorizontal: 20,
        height: 400,
        backgroundColor: 'white',
        // position: 'absolute',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        // flex: 0.5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        
    },
    modalContent: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
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
        marginBottom: 16,
        paddingHorizontal: 10,
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
});