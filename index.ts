import { Api, Client } from 'traq-bot-ts';
import { Parser, jaModel } from "budoux";

const api = new Api({
    baseApiParams: { headers: { Authorization: `Bearer ${process.env.TOKEN}` } },
});
const client = new Client({ token: process.env.TOKEN });

const phraseParser = new Parser(jaModel);
let database: string[] = []

/**
 * 日本語の文を軽量なBudouXで文節に分割する。
 */
function decompose(text: string) {
    return phraseParser.parse(text)
        .map((chunk) => chunk.trim())
        .filter((chunk) => chunk.length > 0);
}

/**
 * Box-Muller法による正規分布に従う乱数の生成
 * @param {number} mean - 平均 (デフォルト: 0)
 * @param {number} stdev - 標準偏差 (デフォルト: 1)
 * @returns {number} 正規分布に従う乱数
 */
function randomNormal(mean = 0, stdev = 1) {
  let u1 = 0;
  let u2 = 0;
  // Math.random()が0になるのを防ぐ
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();

  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdev + mean;
}


client.on('PING', async ({ body }) => {
    await api.channels.postMessage("019a4ce9-d2de-74f6-9245-f43e303b1b6d", {content: "activated", embed: true});
})

client.on('MESSAGE_CREATED', async ({ body }) => {
    const {
        user: { name },
        plainText,
        channelId,
        createdAt,
    } = body.message;

    for (let token of decompose(plainText)){
        if (token.length > 100){token = token.slice(0, 100);}
        database.push(token);
    }

    if (database.length > 2000){
        let database2: string[] = []
        for (let i = database.length-1000; i < database.length; i++){
            database2.push(database[i] ?? "");
        }
        database = database2;
    }

    if (name.match("BOT.*")){
        console.log("message from bot is ignored");
        return;
    }

    console.log(`@${name} < ${plainText}`);

    if (plainText == `@BOT_2251799813685248 join`){
        console.log(`joined to ${channelId}`);
        await api.bots.letBotJoinChannel("019ca9ff-d4e7-72ef-bc48-d76875345802", {channelId: channelId});
        await api.channels.postMessage(channelId, {content: "join request: :accepted:", embed: true});
        return;
    }
    if (plainText == `@BOT_2251799813685248 leave`){
        console.log(`leaved from ${channelId}`);
        await api.bots.letBotLeaveChannel("019ca9ff-d4e7-72ef-bc48-d76875345802", {channelId: channelId});
        await api.channels.postMessage(channelId, {content: "leave request: :accepted:", embed: true});
        return;
    }


    if (Math.random() < 0.15){
        let val = 1n;
        let N = 1+Math.random()*64;
        for (let i = 0; i < N; i++){
            val *= 2n;
        }
        api.channels.postMessage(channelId, {content: `${val}`, embed: true});
    }
    

    if (Math.random() < 0.85){return;}


    let res = "";
    
    const M = Math.floor(Math.abs(randomNormal(0, 25))+1);

    for (let i = 0; i < M; i++){
        res += database[Math.floor(Math.random()*database.length)];
    }

    if (res == ""){
        await api.channels.postMessage(channelId, { content: ":runtime_error:", embed: true });
        return;
    }

    await api.channels.postMessage(channelId, { content: res, embed: true });
    
});

client.listen(() => {
    console.log('Listening...');
});
