import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { IconButton } from 'react-native-paper';
import { buttonStyle } from './buttonStyle';

export default function Button(props: any) {
    const { onPress, title, icon } = props;
    return (
        <Pressable style={buttonStyle.button} onPress={onPress}>
            {icon && <IconButton icon={icon} size={20} />}
            {title && <Text style={buttonStyle.text}>{title}</Text>}
        </Pressable>
    );
}
