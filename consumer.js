const { connectrabbitmq } = require("./rabbitmq.js");
async function consumemessage(){
    const queue = "hello";
    const channel = await connectrabbitmq();
    await channel.assertQueue(queue, {
        durable: true,
        arguments: {
            "x-queue-type": "quorum"
        }
    });
    channel.consume(queue, (msg) => {
        if (msg !== null) {
            const message = msg.content.toString();
            console.log("Received:", message);
            channel.ack(msg);
        }
    });
}
module.exports = {
    consumemessage
};