import { StyleSheet } from 'react-native';

export const buttonStyle = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
        // paddingHorizontal: 32,
        borderRadius: 50,
        height: 46,
        elevation: 3,
        backgroundColor: 'gray',
    },
    text: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
    },
});