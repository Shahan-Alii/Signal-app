import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Image,
    Pressable,
} from 'react-native';
import { AuthContext } from './AuthContext';
import { useNavigation } from '@react-navigation/native';

const People = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const { token, userId } = useContext(AuthContext);
    const navigation = useNavigation();

    const fetchUsers = async () => {
        try {
            const response = await fetch(
                `http://192.168.100.3:8080/users/${userId}`
            );
            const data = await response.json();
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#6200ee" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>People</Text>
            <FlatList
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                data={users}
                keyExtractor={(item) => item._id.toString()} // Assuming each user has a unique 'id'
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => {
                            navigation.navigate('Request', {
                                name: item.name,
                                receiverId: item._id,
                                img: item.image,
                            });
                        }}
                    >
                        <View style={styles.userContainer}>
                            {item.image ? (
                                <Image
                                    source={{ uri: item.image }}
                                    style={styles.userImage}
                                />
                            ) : (
                                <Image
                                    source={{
                                        uri: 'https://cdn-icons-png.flaticon.com/128/4140/4140077.png',
                                    }}
                                    style={styles.userImage}
                                />
                            )}
                            <View style={styles.userInfoContainer}>
                                <Text style={styles.userName}>{item.name}</Text>
                                <Text style={styles.userInfo}>
                                    Email: {item.email}
                                </Text>
                            </View>
                        </View>
                    </Pressable>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAF9F6',
        marginBottom: 15,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 15,
    },
    userInfoContainer: {
        marginLeft: 10,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    userInfo: {
        fontSize: 14,
        color: '#666',
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
});

export default People;
