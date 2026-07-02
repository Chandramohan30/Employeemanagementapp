const rabbitmq = require('amqplib')

async function connectrabbitmq() {
    const connection = await rabbitmq.connect(
        "amqp://guest:guest@localhost:5672/"
    );
    const channel = await connection.createChannel()
    return channel
}
module.exports = {
    connectrabbitmq
}