const { connectrabbitmq } = require("./rabbitmq.js");
const { assertmodel } = require("./models/assertmodel.js")
async function consumemessage() {
    const queue = "empdata";
    const channel = await connectrabbitmq();
    await channel.assertQueue(queue, {
        durable: true,
        arguments: {
            "x-queue-type": "quorum"
        }
    });
    channel.consume(queue, async (msg) => {
        if (msg !== null) {
            const message = JSON.parse(msg.content.toString());
            const asserts = await assertmodel.create({
                empid:message.empid,
                asserts: message.asserts
            });
            console.log("asserts added")
            channel.ack(msg);
        }
    });
}
module.exports = {
    consumemessage
};