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
    Alert,
    ScrollView,
    Platform,
} from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const Register = () => {
    const navigation = useNavigation();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [profileImage, setProfileImage] = useState(null);

    const handleRegister = () => {
        let user = {
            name: name,
            email: email,
            password: password,
            image: profileImage,
        };

        console.log('Registering user:', user);

        axios
            .post('http://192.168.100.3:8080/register', user)
            .then((response) => {
                console.log('Response:', response.data.message);
                Alert.alert(
                    'Registration Successful',
                    'You have been registered successfully'
                );
                setName('');
                setEmail('');
                setPassword('');
                setProfileImage(null);
            })
            .catch((err) => {
                console.log('Error:', err); // Debugging statement
                Alert.alert(
                    'Registration Failed',
                    'An error occurred during registration'
                );
            });
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                enabled="true"
                style={styles.inner}
                // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                // keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollView}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Text style={styles.headerText}>
                            Setup your profile
                        </Text>
                    </View>
                    <View style={styles.imagePickerContainer}>
                        <TouchableOpacity>
                            <Image
                                source={{
                                    uri: profileImage
                                        ? profileImage
                                        : 'https://cdn-icons-png.flaticon.com/128/13462/13462525.png',
                                }}
                                style={styles.image}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Profile Image"
                            style={styles.input}
                            value={profileImage}
                            onChangeText={(text) => setProfileImage(text)}
                        />

                        <TextInput
                            placeholder="Username"
                            style={styles.input}
                            value={name}
                            onChangeText={(text) => setName(text)}
                        />
                        <TextInput
                            placeholder="Email"
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={(text) => setEmail(text)}
                        />
                        <View style={styles.passwordContainer}>
                            <TextInput
                                placeholder="Password"
                                style={styles.passwordInput}
                                secureTextEntry={!passwordVisible}
                                value={password}
                                onChangeText={(text) => setPassword(text)}
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
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                    >
                        <Text style={styles.buttonText}>Register</Text>
                    </TouchableOpacity>
                    <Pressable
                        onPress={() => {
                            navigation.navigate('Login');
                        }}
                    >
                        <Text style={styles.loginText}>
                            Already have an account? Login
                        </Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Register;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: '600',
    },
    imagePickerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },

    imagePlaceholderText: {
        color: 'gray',
        marginTop: 5,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderColor: 'black',
        borderWidth: 2,
        padding: 5,
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
    loginText: {
        color: 'grey',
        textAlign: 'center',
        margin: 10,
        fontSize: 16,
    },
});
