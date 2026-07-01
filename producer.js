const { connectrabbitmq } = require('./rabbitmq.js')
async function publishmessage(){
    const queue = 'hello';
    const msg = 'Hello World!';
    const channel = await connectrabbitmq();
    await channel.assertQueue(queue, {
        durable: true,
        arguments: {
            'x-queue-type': 'quorum'
        }
    });
    channel.sendToQueue(queue, Buffer.from(msg));
    console.log("Sent %s", msg);
}
module.exports = {
    publishmessage
}