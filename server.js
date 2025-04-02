const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: "https://chat-app-frontend-opal-eight.vercel.app", // Ensure the frontend URL is correct
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://chat-app-frontend-opal-eight.vercel.app",
        methods: ["GET", "POST"]
    }
});

// Funny name generator
const adjectives = ['Wacky', 'Lazy', 'Fluffy', 'Bouncy', 'Silly', 'Nerdy', 'Giggly', 'Grumpy', 'Witty', 'Goofy', 'Sleepy', 'Crazy', 'Hungry', 'Clumsy', 'Jolly'];
const nouns = ['Penguin', 'Dinosaur', 'Monkey', 'Unicorn', 'Dragon', 'Hamster', 'Banana', 'Panda', 'Zombie', 'Alien', 'Ninja', 'Taco', 'Potato', 'Pineapple', 'Octopus'];

function generateFunnyRoomName() {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adjective} ${noun} Room`;
}

const queue = [];

io.on('connection', (socket) => {

    socket.on('join_queue', () => {
        queue.push(socket);
        
        if (queue.length >= 2) {
            const user1 = queue.shift();
            const user2 = queue.shift();
            
            // Generate a funny room name
            const roomId = generateFunnyRoomName();
            
            user1.join(roomId);
            user2.join(roomId);
            
            user1.emit('joined', roomId);
            user2.emit('joined', roomId);
            
            user1.roomId = roomId;
            user2.roomId = roomId;
        }
    });

    socket.on('send_message', (data) => {
        const { roomId, message } = data;
        io.to(roomId).emit('receive_message', { message, sender: socket.id });
    });

    socket.on('disconnect', () => {
        if (socket.roomId) {
            io.to(socket.roomId).emit('receive_message', { message: 'User has disconnected', sender: 'System' });
        }
    });
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
