import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    KeyboardAvoidingView,
    TextInput,
    TouchableOpacity,
    Pressable,
    Image,
    Platform,
    Alert,
} from 'react-native';
import React, { useState, useContext, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import 'core-js/stable/atob';

const Login = () => {
    const navigation = useNavigation();

    const [passwordVisible, setPasswordVisible] = useState(false);

    const [email, setEmail] = useState('');

    const [password, setPassword] = useState('');

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const { token, setToken, setUserId, userId, setAuthUser } =
        useContext(AuthContext);

    useEffect(() => {
        if (token) {
            navigation.replace('MainStack', { screen: 'Main' });
        }
    }, [token, navigation]);

    const handleLogin = () => {
        let user = {
            email: email,
            password: password,
        };

        axios
            .post('http://192.168.100.3:8080/login', user)
            .then((response) => {
                const token = response.data.token;
                AsyncStorage.setItem('authToken', token);
                setToken(token);

                if (token) {
                    const decodedToken = jwtDecode(token);
                    const userId = decodedToken.userId;

                    setUserId(userId);
                    setToken(token);
                    setAuthUser(token);
                }
            })
            .catch((err) => {
                console.log('Error:', err);
                Alert.alert('Login Failed', 'An error occurred during Login');
            });
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                enabled="false"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
                style={styles.inner}
            >
                <View style={styles.header}>
                    <Text style={styles.headerText}>Login to Your Account</Text>
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Email"
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                        }}
                    />
                    <View style={styles.passwordContainer}>
                        <TextInput
                            placeholder="Password"
                            style={styles.passwordInput}
                            secureTextEntry={!passwordVisible}
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                            }}
                        />
                        <TouchableOpacity
                            style={styles.icon}
                            onPress={togglePasswordVisibility}
                        >
                            <Ionicons
                                name={passwordVisible ? 'eye-off' : 'eye'}
                                size={24}
                                color="gray"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                <Pressable
                    onPress={() => {
                        navigation.navigate('Register');
                    }}
                >
                    <Text
                        style={{
                            color: 'grey',
                            textAlign: 'center',
                            margin: 10,
                            fontSize: 16,
                        }}
                    >
                        Don't have account ? SignUp
                    </Text>
                </Pressable>
                <View
                    style={{
                        marginTop: 40,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Image
                        style={{ width: 140, height: 170 }}
                        source={{
                            uri: 'https://signal.org/assets/images/features/Groups.png',
                        }}
                    />
                    <Text>Enter the incredible society</Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    headerText: {
        fontSize: 24,
        fontWeight: '600',
    },
    inputContainer: {
        width: '100%',
    },
    input: {
        height: 50,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
    },
    passwordInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
    },
    icon: {
        padding: 5,
    },
    button: {
        height: 50,
        backgroundColor: '#6200ee',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '500',
    },
});
