import { View, Text } from 'react-native';
import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChatScreen from '../screens/ChatScreen';
import { Ionicons } from '@expo/vector-icons';
import Profile from '../screens/Profile';
import Register from '../screens/Register';
import Login from '../screens/Login';
import People from '../screens/People';
import ChatRoom from '../screens/ChatRoom';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthContext } from '../screens/AuthContext';
import RequestRoom from '../screens/RequestRoom';

export default function StackNavigator() {
    const Stack = createNativeStackNavigator();
    const Tab = createBottomTabNavigator();

    const { token, setToken, userId } = useContext(AuthContext);
    // console.log('token value', token);
    // console.log('user Id inside stack', userId);

    useEffect(() => {
        const fetchUser = async () => {
            const token = await AsyncStorage.getItem('authToken');
        };

        fetchUser();
    }, []);

    function BottomTabs() {
        return (
            <Tab.Navigator>
                <Tab.Screen
                    name="Chats"
                    component={ChatScreen}
                    options={{
                        tabBarStyle: {
                            backgroundColor: '#28282B',
                        },
                        headerShown: false,
                        tabBarIcon: ({ focused }) =>
                            focused ? (
                                <Ionicons
                                    name="chatbox-ellipses-sharp"
                                    size={24}
                                    color="white"
                                />
                            ) : (
                                <Ionicons
                                    name="chatbox-ellipses-sharp"
                                    size={24}
                                    color="#989898"
                                />
                            ),
                    }}
                />

                <Tab.Screen
                    name="Profile"
                    component={Profile}
                    options={{
                        tabBarStyle: { backgroundColor: '#28282B' },
                        headerShown: false,
                        tabBarIcon: ({ focused }) =>
                            focused ? (
                                <Ionicons
                                    name="person"
                                    size={30}
                                    color="white"
                                />
                            ) : (
                                <Ionicons
                                    name="person"
                                    size={30}
                                    color="#989898"
                                />
                            ),
                    }}
                />
            </Tab.Navigator>
        );
    }

    const AuthStack = () => {
        return (
            <Stack.Navigator>
                <Stack.Screen
                    name="Login"
                    component={Login}
                    options={{ headerShown: false }}
                />

                <Stack.Screen
                    name="Register"
                    component={Register}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        );
    };

    function MainStack() {
        return (
            <Stack.Navigator>
                <Stack.Screen
                    name="Main"
                    component={BottomTabs}
                    options={{ headerShown: false }}
                />

                <Stack.Screen
                    name="People"
                    component={People}
                    options={{ headerShown: false }}
                />
                <Stack.Screen name="Request" component={RequestRoom} />
                <Stack.Screen name="ChatRoom" component={ChatRoom} />
            </Stack.Navigator>
        );
    }

    return (
        <NavigationContainer>
            {token === null || token === '' ? <AuthStack /> : <MainStack />}
        </NavigationContainer>
    );
}
