import React, { useState, useContext, useLayoutEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from './AuthContext';
import axios from 'axios';

const RequestRoom = () => {
    const [requestSent, setRequestSent] = useState(false);
    const [requestMsgText, setRequestMsgText] = useState('');
    const navigation = useNavigation();
    const [message, setMessage] = useState('');
    const { token, setToken, setUserId, userId } = useContext(AuthContext);
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
                                navigation.navigate('People');
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

    const handleSendRequest = async () => {
        let userData = {
            senderId: userId,
            receiverId: route.params.receiverId,
            message: message,
        };

        if (!requestSent && message != '') {
            try {
                const response = await axios.post(
                    'http://192.168.100.3:8080/sendrequest',
                    userData
                );

                if (response.status == 200) {
                    setRequestMsgText(message);
                    setRequestSent(true);
                    setMessage('');
                    Alert.alert(
                        'Chat Request Sent',
                        'You can chat when the user accept your request!'
                    );
                }
            } catch (error) {
                console.log('Error', error);
            }
        } else if (!requestSent && message !== '') {
            Alert.alert('Error', 'Please fill the message field!');
        } else if (requestSent) {
            Alert.alert(
                'Already Sent Request',
                'Wait for user to accept your chat request'
            );
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>
                    Send Request to start chatting
                </Text>
            </View>

            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                {requestSent ? (
                    <Text style={styles.ReqMsg}>{requestMsgText}</Text>
                ) : null}
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Request Message"
                    value={message}
                    onChangeText={setMessage}
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendRequest}
                >
                    <Ionicons name="send" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default RequestRoom;

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
        alignSelf: 'flex-end',
        backgroundColor: '#DCF8C6',
        padding: 8,
        maxWidth: '60%',
        borderRadius: 7,
        margin: 10,
        fontSize: 20,
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
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        padding: 10,
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: '#f0f0f0',
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
