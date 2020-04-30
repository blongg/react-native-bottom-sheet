import {StyleSheet} from "react-native";

export default StyleSheet.create({
    wrapper: {
        width: '100%',
        position: 'absolute',
        zIndex: 100,
        elevation: 50,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    mask: {
        backgroundColor: 'rgba(0,0,0,0.40)',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    container: {
        backgroundColor: '#fff',
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
        width: '100%',
        height: 0,
        overflow: 'hidden'
    },
});