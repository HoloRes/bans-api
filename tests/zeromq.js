// Imports
const zmq = require('zeromq');

// Initialize socket
const sock = zmq.socket('sub');
sock.connect('tcp://127.0.0.1:5555');
sock.subscribe('');

// Log all messages
sock.on('message', (topic, message) => {
	console.log(`${topic}: ${JSON.stringify(JSON.parse(message), null, 2)}`);
});
