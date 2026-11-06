import { Api, Client } from 'traq-bot-ts';
import * as kuromoji from "kuromoji";

const api = new Api({
    baseApiParams: { headers: { Authorization: `Bearer ${process.env.TOKEN}` } },
});
const client = new Client({ token: process.env.TOKEN });

function buildTokenizer() {
    return new Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>>((resolve, reject) => {
        kuromoji.builder({ dicPath: "node_modules/kuromoji/dict" }).build((err, tokenizer) => {
            if (err) {
                reject(err);
            } else {
                resolve(tokenizer);
            }
        });
    });
}

const tokenizer = await buildTokenizer();

// 自立語（新しく文節が始まる品詞）の定義
const whitespace = /( |\n|\t|\r)+/
let database: string[] = []

/**
 * 形態素の配列を文節の配列に変換する関数（複合名詞対応版）
 */
function decompose(S: string) {
    const chunks = [];
    let currentChunk = "";

    const tokens = tokenizer.tokenize(S);

    tokens.forEach((token, index) => {
        if (whitespace.test(token.surface_form)){token.surface_form = "";}
        // 自立語（文節の開始点）になり得る品詞の判定
        let isJiritsugo = (
            token.pos === "名詞" && token.pos_detail_1 !== "非自立" ||
            token.pos === "動詞" && token.pos_detail_1 !== "非自立" ||
            token.pos === "形容詞" ||
            token.pos === "副詞" ||
            token.pos === "接続詞" ||
            token.pos === "感動詞" ||
            token.pos === "連体詞" ||
            token.pos === "接頭詞"
        );

        // 2語目以降の区切り判定
        if (index > 0 && isJiritsugo) {
            let prevToken = tokens[index - 1];

            // 【複合名詞の結合ルール】
            // 前の単語が「名詞」で、現在の単語も「名詞」の場合は、
            // 新しい文節に分けず、複合名詞として繋げる（自立語フラグをオフにする）
            if (prevToken?.pos === "名詞" && token.pos === "名詞") {
                // ただし、現在の名詞が「代名詞」「数」などの場合は結合したくない場合が多いため、
                // 必要に応じてここで除外します（例：token.pos_detail_1 !== "代名詞"）
                isJiritsugo = false; 
            }
            
            // 前の単語が「名詞」で、現在が名詞の「接尾」語（〜さん、〜たち等）の場合も繋げる
            if (prevToken?.pos === "名詞" && token.pos_detail_1 === "接尾") {
                isJiritsugo = false;
            }

            // 自立語判定が残っている場合のみ、新しい文節として区切る
            if (isJiritsugo) {
                chunks.push(currentChunk);
                currentChunk = "";
            }
        }

        currentChunk += token.surface_form;
    });

    // 最後の文節を追加
    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
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
        await api.channels.postMessage("019a4ce9-d2de-74f6-9245-f43e303b1b6d", {content: "join request: :accepted:", embed: true});
        return;
    }
    if (plainText == `@BOT_2251799813685248 leave`){
        console.log(`leaved from ${channelId}`);
        await api.bots.letBotLeaveChannel("019ca9ff-d4e7-72ef-bc48-d76875345802", {channelId: channelId});
        await api.channels.postMessage("019a4ce9-d2de-74f6-9245-f43e303b1b6d", {content: "leave request: :accepted:", embed: true});
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