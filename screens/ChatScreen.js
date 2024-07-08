import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Text,
    Image,
    Pressable,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './AuthContext';
import 'core-js/stable/atob';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSocketContext } from './SocketContext';

const ChatListScreen = ({}) => {
    const { token, setToken, setUserId, userId, toggle } =
        useContext(AuthContext);
    const [chatsData, setChatsData] = useState([]);
    const navigation = useNavigation();

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('authToken');
            setToken('');

            navigation.replace('Login');
        } catch (error) {
            console.log('Logout Error', error);
        }
    };

    const listenMessages = () => {
        const { socket } = useSocketContext();

        useEffect(() => {
            if (socket) {
                socket.on('acceptRequest', (user) => {
                    setChatsData((prevChats) => [...prevChats, user]);
                    // refresh();
                    // fetchChats();
                });

                return () => {
                    socket.off('acceptRequest');
                };
            }
        }, [socket]);
    };

    listenMessages();

    const fetchChats = async () => {
        try {
            const response = await fetch(
                `http://192.168.100.3:8080/user/${userId}`
            );
            const data = await response.json();

            setChatsData(data);
        } catch (error) {
            console.log('Error in fatching chats', error);
        }
    };

    useEffect(() => {
        fetchChats();
    }, [chatsData]);

    const renderItem = ({ item }) => (
        <Pressable
            style={({ pressed }) => [
                {
                    backgroundColor: pressed ? '#f0f0f0' : 'white',
                },
                styles.listItem,
            ]}
            onPress={() =>
                navigation.navigate('ChatRoom', {
                    receiverId: item._id,
                    name: item.name,
                    image: item.image,
                })
            }
        >
            <Image
                source={{
                    uri: item.image
                        ? item.image
                        : 'https://cdn-icons-png.flaticon.com/128/4140/4140077.png',
                }}
                style={styles.avatar}
            />
            <View style={styles.listItemContent}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.message}>Chat with {item.name}</Text>
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>
                        Chat with your friends
                    </Text>
                    <View style={styles.headerButton}>
                        <Pressable
                            style={{ marginRight: 18 }}
                            onPress={() => {
                                navigation.navigate('People');
                            }}
                        >
                            <Octicons
                                name="person-add"
                                size={24}
                                color="white"
                            />
                        </Pressable>

                        <Pressable onPress={handleLogout}>
                            <MaterialCommunityIcons
                                name="logout"
                                size={24}
                                color="white"
                            />
                        </Pressable>
                    </View>
                </View>
                <FlatList
                    data={chatsData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#6200ee',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 16,
        backgroundColor: '#6200ee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 70,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
    },
    headerButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginRight: 5,
    },
    headerText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    listItem: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    listItemContent: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    message: {
        color: '#888',
    },
    time: {
        color: '#888',
    },
});

export default ChatListScreen;
