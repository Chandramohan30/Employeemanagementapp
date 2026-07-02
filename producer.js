const { connectrabbitmq } = require('./rabbitmq.js')
async function publishmessage(message){
    const queue = 'empdata';
    const msg = message;
    const channel = await connectrabbitmq();
    await channel.assertQueue(queue, {
        durable: true,
        arguments:
        {
            'x-queue-type': 'quorum'
        }
    });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
    console.log("Sent %s", msg);
}
module.exports = {
    publishmessage
}