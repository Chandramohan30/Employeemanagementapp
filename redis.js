const {createClient}=require('redis')
const redisclient=createClient({
    url:"redis://localhost:6379"
});

redisclient.on("connect",()=>{
    console.log("Redis server connected")
})

redisclient.on("error",()=>{
    console.log("Redis server Not connected")
})

async function connectredis()
{
    await redisclient.connect()
}

module.exports={
    redisclient,
    connectredis
}