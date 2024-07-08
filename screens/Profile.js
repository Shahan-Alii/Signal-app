import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Pressable,
    Image,
    Button,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import InstaStory from 'react-native-insta-story';
import { Ionicons } from '@expo/vector-icons';
import { useSocketContext } from './SocketContext';

const Requests = () => {
    const { userId, toggle, refresh } = useContext(AuthContext);
    const navigation = useNavigation();
    const [requests, setRequests] = useState([]);
    const [showRequests, setShowRequests] = useState(true);

    const toggleRequests = () => {
        setShowRequests(!showRequests);
    };

    const data = [
        {
            user_id: 1,
            user_image:
                'https://img.freepik.com/free-photo/3d-illustration-teenager-with-funny-face-glasses_1142-50955.jpg?t=st=1720259012~exp=1720262612~hmac=82b6b441c9eed7dfbe311a0925817a1e77a8d9019a2fc88899499f16293c4980&w=740',
            user_name: 'Shahan Ali',
            stories: [
                {
                    story_id: 1,
                    story_image:
                        'https://image.freepik.com/free-vector/universe-mobile-wallpaper-with-planets_79603-600.jpg',
                    swipeText: 'hello world',
                    onPress: () => console.log('story 1 swiped'),
                },
                {
                    story_id: 2,
                    story_image:
                        'https://image.freepik.com/free-vector/mobile-wallpaper-with-fluid-shapes_79603-601.jpg',
                },
            ],
        },
        {
            user_id: 2,
            user_image:
                'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80',
            user_name: 'Aran',
            stories: [
                {
                    story_id: 1,
                    story_image:
                        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjORKvjcbMRGYPR3QIs3MofoWkD4wHzRd_eg&usqp=CAU',
                    swipeText: 'how are you doing',
                    onPress: () => console.log('story 1 swiped'),
                },
                {
                    story_id: 2,
                    story_image:
                        'https://files.oyebesmartest.com/uploads/preview/vivo-u20-mobile-wallpaper-full-hd-(1)qm6qyz9v60.jpg',
                    swipeText: 'welcome to signal',
                    onPress: () => console.log('story 2 swiped'),
                },
            ],
        },
    ];

    const fetchRequests = async () => {
        try {
            const requests = await fetch(
                `http://192.168.100.3:8080/getrequests/${userId}`
            );

            const data = await requests.json();
            setRequests(data);
            console.log(data);
        } catch (error) {
            console.log('Error fethcing requestes in profile page', error);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const { socket } = useSocketContext();

    const handleAccept = (user) => {
        try {
            axios.post('http://192.168.100.3:8080/acceptrequest', {
                userId: userId,
                requestId: user.from._id,
            });

            fetchRequests();
            refresh();
            socket.emit('reqRespond', {
                senderId: userId,
                receiverId: user._id,
            });
        } catch (error) {
            console.log('Error in handling request', error);
        }
    };

    const handleReject = (user) => {
        try {
            axios.post('http://192.168.100.3:8080/deleterequest', {
                userId: userId,
                requestId: user.from._id,
            });

            fetchRequests();
            refresh();
        } catch (error) {
            console.log('Error in handling request', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={{ padding: 10 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                    Stories
                </Text>

                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginHorizontal: -1,
                        marginTop: 4,
                    }}
                >
                    <InstaStory data={data} duration={10} />
                </View>
            </View>

            <View>
                <Pressable
                    onPress={toggleRequests}
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 10,
                    }}
                >
                    <Text style={styles.heading}>Requests</Text>

                    <Ionicons
                        name={showRequests ? 'chevron-down' : 'chevron-forward'}
                        size={25}
                        color="black"
                        style={{ marginBottom: 1 }}
                    />
                </Pressable>
            </View>
            <FlatList
                data={requests}
                keyExtractor={(item) => item.from._id.toString()}
                renderItem={({ item }) =>
                    showRequests ? (
                        <View style={styles.userContainer}>
                            {item.from.image ? (
                                <Image
                                    source={{ uri: item.from.image }}
                                    style={styles.userImage}
                                />
                            ) : (
                                <Image
                                    source={{
                                        uri: 'https://cdn-icons-png.flaticon.com/128/13462/13462525.png',
                                    }}
                                    style={styles.userImage}
                                />
                            )}
                            <View style={styles.userInfoContainer}>
                                <Text style={styles.userName}>
                                    {item.from.name}
                                </Text>
                                <Text style={styles.userInfo}>
                                    {item.from.email}
                                </Text>
                            </View>
                            <View style={styles.buttonContainer}>
                                <Button
                                    title="Accept"
                                    onPress={() => handleAccept(item)}
                                    color="#4CAF50"
                                />
                                <Button
                                    title="Reject"
                                    onPress={() => handleReject(item)}
                                    color="#F44336"
                                />
                            </View>
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

export default Requests;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 10,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9f9f9',
        marginBottom: 16,
        borderRadius: 8,
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    userInfoContainer: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    userInfo: {
        fontSize: 14,
        color: '#666',
    },
    buttonContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 8,
    },
});
