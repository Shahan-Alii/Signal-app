import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import StackNavigator from './navigation/StackNavigator';
import { AuthProvider } from './screens/AuthContext';
import { SocketContextProvider } from './screens/SocketContext';

export default function App() {
    return (
        <AuthProvider>
            <SocketContextProvider>
                <StackNavigator />
            </SocketContextProvider>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
