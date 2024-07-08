import React, {
    useState,
    useContext,
    useLayoutEffect,
    useEffect,
    useRef,
} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    Pressable,
    Alert,
    ScrollView,
    ImageBackground,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { useSocketContext } from './SocketContext';
import bgImage from '../images/bg2.jpg';

const ChatRoom = () => {
    const navigation = useNavigation();
    const { socket } = useSocketContext();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const { token, setToken, setUserId, userId, toggle, refresh } =
        useContext(AuthContext);
    const route = useRoute();

    useLayoutEffect(() => {
        return navigation.setOptions({
            headerTitle: '',
            headerStyle: {
                backgroundColor: '#6200ee', // Change this to the desired color
            },
            headerLeft: () => {
                return (
                    <View>
                        <Pressable
                            style={styles.backContainer}
                            onPress={() => {
                                navigation.navigate('Main');
                            }}
                        >
                            <Ionicons
                                name="chevron-back"
                                size={30}
                                color="white"
                            />
                            <Image
                                source={{
                                    uri: route.params.image
                                        ? route.params.image
                                        : 'https://cdn-icons-png.flaticon.com/128/4140/4140077.png',
                                }}
                                style={styles.userImage}
                            />

                            <Text
                                style={{
                                    color: 'white',
                                    marginLeft: 5,
                                    fontSize: 20,
                                }}
                            >
                                {route.params.name}
                            </Text>
                        </Pressable>
                    </View>
                );
            },
        });
    }, []);

    const listenMessages = () => {
        const { socket } = useSocketContext();

        useEffect(() => {
            if (socket) {
                socket.on('receiveMessage', (newMessage) => {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        newMessage,
                    ]);

                    // refresh();
                    // fetchMessages();
                });

                return () => {
                    socket.off('recieveMessage');
                };
            }
        }, [socket]);
    };

    listenMessages();

    const sendMessage = async (senderId, receiverId) => {
        try {
            // Send message to the server
            await axios.post('http://192.168.100.3:8080/sendMessage', {
                senderId,
                receiverId,
                message,
            });

            // Emit the message via socket
            socket.emit('sendMessage', { senderId, receiverId, message });

            // Clear the input field
            setMessage('');

            // Immediately update messages state locally
            // setMessages((prevMessages) => [
            //     ...prevMessages,
            //     {
            //         senderId,
            //         receiverId,
            //         message,
            //         timeStamp: new Date().toISOString(),
            //     },
            // ]);

            // Fetch the updated list of messages (optional)
            // await fetchMessages();
        } catch (error) {
            console.log('Error sending message:', error);
        }
    };

    const fetchMessages = async () => {
        try {
            const senderId = userId;
            const receiverId = route?.params?.receiverId;

            const response = await axios.get(
                'http://192.168.100.3:8080/messages',
                {
                    params: { senderId, receiverId },
                }
            );

            setMessages(response.data);
        } catch (error) {
            console.log('Error', error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [messages]);

    const scrollViewRef = useRef();

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const formatTime = (time) => {
        const options = { hour: 'numeric', minute: 'numeric' };
        return new Date(time).toLocaleString('en-US', options);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
            <ImageBackground
                source={bgImage}
                style={{ flex: 1, resizeMode: 'cover' }}
            >
                <ScrollView ref={scrollViewRef}>
                    {messages?.map((item, index) => {
                        return (
                            <Pressable
                                key={index}
                                style={[
                                    item?.senderId?._id == userId
                                        ? {
                                              alignSelf: 'flex-end',
                                              backgroundColor: '#DCF8C6',
                                              padding: 8,
                                              maxWidth: '60%',
                                              borderRadius: 7,
                                              margin: 10,
                                          }
                                        : {
                                              alignSelf: 'flex-start',
                                              backgroundColor: '#EDEADE',
                                              padding: 8,
                                              margin: 10,
                                              borderRadius: 7,
                                              maxWidth: '60%',
                                          },
                                ]}
                            >
                                <Text
                                    style={{ fontSize: 13, textAlign: 'left' }}
                                >
                                    {item?.message}
                                </Text>
                                <Text
                                    style={{
                                        textAlign: 'right',
                                        fontSize: 9,
                                        color: 'gray',
                                        marginTop: 4,
                                    }}
                                >
                                    {formatTime(item?.timeStamp)}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter  Message"
                        value={message}
                        onChangeText={setMessage}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={() =>
                            sendMessage(userId, route?.params?.receiverId)
                        }
                    >
                        <Ionicons name="send" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </View>
    );
};

export default ChatRoom;

const styles = StyleSheet.create({
    userImage: {
        width: 40,
        height: 40,
        borderRadius: 25,
    },

    backContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },

    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        height: 60,
        backgroundColor: '#007BFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    ReqMsg: {
        backgroundColor: '#6200ee',
        color: 'white',
        fontSize: 20,
        borderColor: 'black',
        borderWidth: 2,
        borderRadius: 35,
        padding: 15,

        marginTop: 20,
        textAlign: 'center',
        marginRight: 10,
    },
    requestItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    requestText: {
        fontSize: 16,
    },
    inputContainer: {
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        // borderTopWidth: 1,
        // borderTopColor: '#ccc',
        padding: 10,
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: '#FAF9F6',
        borderRadius: 20,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: '#6200ee',
        borderRadius: 20,
        padding: 10,
    },
});
