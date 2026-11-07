import { Api, Client } from 'traq-bot-ts';
import { Parser, jaModel } from "budoux";

const api = new Api({
    baseApiParams: { headers: { Authorization: `Bearer ${process.env.TOKEN}` } },
});
const client = new Client({ token: process.env.TOKEN });

const phraseParser = new Parser(jaModel);

let database: string[] = []

let prev_pow2: string = "";
let prev_pow2_index: bigint = 0n;

const numberstamp = ["5334cc7a-6510-4ea5-9e20-f85db75aa47a", "9f0be841-fbfa-4abf-871e-c1c72627e691", "350c45b4-a048-4f62-bf2b-e98f4edef40c", "ea0e7725-5b86-456b-b34a-060035153be2", "1463cc12-9758-478f-b968-e031a912d426", "2d04f8d3-b2db-4e53-b11c-111350c7b70d", "4134c613-8e9d-45f8-a8e3-d0f0d464d788", "0e76176f-fa55-4ba3-aa28-af9b6c247871", "08e48c75-5ba9-4c9c-a09a-426861f60329", "776b01db-95dc-474f-a3a7-a727f9803345"]


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
function generate_random_text(){

    let res: string = "";

    if (database.length == 0){return res;}

    const M = Math.floor(Math.abs(randomNormal(0, 25))+1);

    for (let i = 0; i < M; i++){
        res += database[Math.floor(Math.random()*database.length)];
    }

    return res;
}
function generate_random_pow2(){
    let val = 1n;
    let N = BigInt(Math.floor(1+Math.random()*64));
    for (let i = 0n; i < N; i++){
        val *= 2n;
    }
    return {N, val}
}

client.on('PING', async ({ body }) => {
    await api.channels.postMessage("019a4ce9-d2de-74f6-9245-f43e303b1b6d", {content: "activated", embed: true});
});

client.on("BOT_MESSAGE_STAMPS_UPDATED", async ({ body }) => {

    if (body.messageId != prev_pow2){return;}
    if (body.stamps.length == 0){return;}
    
    if (body.stamps[0]?.stampId == "01978acd-e952-79f1-b09a-5c5a11621d1c"){
        let ans: bigint[] = [];
        while (prev_pow2_index > 0){
            ans.push(prev_pow2_index%10n);
            prev_pow2_index /= 10n;
        }
        ans.reverse();
        for (const n of ans){
            await api.messages.addMessageStamp(prev_pow2, numberstamp[Number(n)]??"019b5e62-8afa-79e1-8f52-9ce219283251", {count: 1});
        }
        prev_pow2 = "";
        return;
    }

    let stamplist = []

    for (const s of body.stamps){
        if (s.count >= 10){continue;}
        for (let i = 0; i < s.count; i++){
            stamplist.push(s);
        }
    }

    let res = 0n;
    let pow10 = 1n;
    
    stamplist.sort((a, b) =>  b.updatedAt.getTime() - a.updatedAt.getTime());

    for (const s of stamplist){
        const idx = numberstamp.indexOf(s.stampId);
        if (idx == -1){return;}
        if (pow10 >= 10000000000000000000000000000000000000000n){return;}
        res += pow10*BigInt(idx);
        pow10 *= 10n;
    }

    if (res == prev_pow2_index){
        await api.messages.addMessageStamp(prev_pow2, "daed768f-7bf9-4085-a50d-7bcad670ec52", {count: Math.min(100, Number(prev_pow2_index))});
        prev_pow2 = "";
    }

});

client.on('MESSAGE_CREATED', async ({ body }) => {
    const {
        user: { name },
        plainText,
        channelId,
        createdAt,
    } = body.message;


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
    if (plainText == `@BOT_2251799813685248 generate`){
        const res = generate_random_text();
        if (res == ""){
            await api.channels.postMessage(channelId, { content: ":runtime_error:", embed: true });
            return;
        }
        await api.channels.postMessage(channelId, { content: res, embed: true });
        return;
    }
    if (plainText == `@BOT_2251799813685248 pow2`){
        const val = generate_random_pow2();
        const res = await api.channels.postMessage(channelId, {content: `${val.val}`, embed: true});
        if (prev_pow2 != ""){
            await api.messages.addMessageStamp(prev_pow2, "6f8a7751-5276-426d-931d-bfb419e70038", {count: 1});
        }
        prev_pow2 = res.data.id;
        prev_pow2_index = val.N;
        return;
    }


    for (let token of decompose(plainText)){
        if (token.length > 100){
            let error_msg = `The phrase "${token}" is too long. Only first 100 characters will be recorded.`
            await api.channels.postMessage(channelId, {content: error_msg, embed: true});
            token = token.slice(0, 100);
        }
        database.push(token);
    }


    if (database.length > 6000){
        let database2: string[] = []
        for (let i = database.length-3000; i < database.length; i++){
            database2.push(database[i] ?? "");
        }
        database = database2;
    }

    if (name.match("BOT.*")){
        console.log("message from bot is ignored");
        return;
    }


    if (Math.random() < 0.15){
        const val = generate_random_pow2();
        const res = await api.channels.postMessage(channelId, {content: `${val.val}`, embed: true});
        if (prev_pow2 != ""){
            await api.messages.addMessageStamp(prev_pow2, "6f8a7751-5276-426d-931d-bfb419e70038", {count: 1});
        }
        prev_pow2 = res.data.id;
        prev_pow2_index = val.N;
    }
    

    if (Math.random() < 0.85){return;}


    const res = generate_random_text();
    if (res == ""){
        await api.channels.postMessage(channelId, { content: ":runtime_error:", embed: true });
        return;
    }
    await api.channels.postMessage(channelId, { content: res, embed: true });
    
});

client.listen(() => {
    console.log('Listening...');
});
