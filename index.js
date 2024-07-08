const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const randomBytes = require('randombytes');

const app = express();
const port = 8080;
const cors = require('cors');

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const jwt = require('jsonwebtoken');

mongoose
    .connect('mongodb://127.0.0.1:27017/signal')
    .then((res) => {
        console.log('Connection Successful with mongoose');
    })
    .catch((err) => {
        console.log(err);
    });

app.listen(port, () => {
    console.log('Server is running on port 8080');
});

const User = require('./models/user');
const Message = require('./models/message');

app.post('/register', async (req, res) => {
    const { name, email, password, image } = req.body;

    const newUser = new User({ name, email, password, image });

    newUser
        .save()
        .then(() => {
            res.status(200).json({ message: 'User registered succesfully!' });
        })
        .catch((error) => {
            console.log('Error creating a user');
            res.status(500).json({ message: 'Error registering the user' });
        });
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email' });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const secretKey = randomBytes(32).toString('hex');

        const token = jwt.sign({ userId: user._id }, secretKey);

        res.status(200).json({ token });
    } catch (error) {
        console.log('error loggin in', error);
        res.status(500).json({ message: 'Error loggin In' });
    }
});

app.get('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const currentUser = await User.findById(userId).populate('friends');

        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const friendIds = currentUser.friends.map((friend) => friend._id);

        const nonFriendUsers = await User.find({
            _id: { $nin: [...friendIds, userId] },
        });

        res.json(nonFriendUsers);
    } catch (error) {
        console.error('Error fetching non-friend users:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/sendrequest', async (req, res) => {
    const { senderId, receiverId, message } = req.body;

    console.log(senderId);
    console.log(receiverId);
    console.log(message);

    const receiver = await User.findById(receiverId);
    if (!receiver) {
        return res.status(404).json({ message: 'Receiver not found' });
    }

    receiver.requests.push({ from: senderId, message });
    await receiver.save();

    res.status(200).json({ message: 'Request sent succesfully' });
});

app.get('/getrequests/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).populate(
            'requests.from',
            'name email image'
        );

        if (user) {
            res.json(user.requests);
        } else {
            res.status(400);
            throw new Error('User not found');
        }
    } catch (error) {
        console.log('error', error);
    }
});

app.post('/acceptrequest', async (req, res) => {
    try {
        const { userId, requestId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $pull: { requests: { from: requestId } },
            },
            { new: true }
        );
        console.log('hello', updatedUser);

        if (!updatedUser) {
            return res.status(404).json({ message: 'Request not found' });
        }

        await User.findByIdAndUpdate(userId, {
            $push: { friends: requestId },
        });

        const friendUser = await User.findByIdAndUpdate(requestId, {
            $push: { friends: userId },
        });

        if (!friendUser) {
            return res.status(404).json({ message: 'Friend not found' });
        }

        res.status(200).json({ message: 'Request accepted sucesfully' });
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const users = await User.findById(userId).populate(
            'friends',
            'name email image'
        );

        res.json(users.friends);
    } catch (error) {
        console.log('Error fetching user', error);
    }
});

const http = require('http').createServer(app);

const io = require('socket.io')(http);
//{"userId" : "socket ID"}

const userSocketMap = {};

io.on('connection', (socket) => {
    console.log('abc');
    console.log('a user is connected', socket.id);

    const userId = socket.handshake.query.userId;

    console.log('userid', userId);

    if (userId !== 'undefined') {
        userSocketMap[userId] = socket.id;
    }

    console.log('user socket data', userSocketMap);

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
        delete userSocketMap[userId];
    });

    socket.on('sendMessage', ({ senderId, receiverId, message }) => {
        console.log('message', message);
        const receiverSocketId = userSocketMap[receiverId];

        console.log('receiver Id', receiverId);
        console.log('found ');
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receiveMessage', {
                senderId,
                receiverId,
                message,
            });
        }
    });

    socket.on('reqRespond', async ({ senderId, receiverId }) => {
        let user = await User.findById(senderId);

        const receiverSocketId = userSocketMap[receiverId];

        console.log('receiver Id for request', receiverId);
        console.log('found ');
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('acceptRequest', user);
        }
    });
});

http.listen(3000, () => {
    console.log('Socket.IO running on port 3000');
});

app.post('/sendMessage', async (req, res) => {
    try {
        console.log('hii');
        const { senderId, receiverId, message } = req.body;

        const newMessage = new Message({
            senderId,
            receiverId,
            message,
        });

        await newMessage.save();
        console.log(userSocketMap);
        const receiverSocketId = userSocketMap[receiverId];

        if (receiverSocketId) {
            console.log(
                'emitting recieveMessage event to the reciver',
                receiverId
            );
            io.to(receiverSocketId).emit('newMessage', newMessage);
        } else {
            console.log('Receiver socket ID not found');
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log('ERROR', error);
    }
});

app.get('/messages', async (req, res) => {
    try {
        const { senderId, receiverId } = req.query;

        const messages = await Message.find({
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
        }).populate('senderId', '_id name');

        res.status(200).json(messages);
    } catch (error) {
        console.log('Error', error);
    }
});
