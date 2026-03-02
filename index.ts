import { Api, Client } from 'traq-bot-ts';

const api = new Api({
  baseApiParams: { headers: { Authorization: `Bearer ${process.env.TOKEN}` } },
});
const client = new Client({ token: process.env.TOKEN });

client.on('MESSAGE_CREATED', async ({ body }) => {
  const {
    user: { name },
    plainText,
    channelId,
    createdAt,
  } = body.message;
  console.log(`@${name} < ${plainText}`);

  let digits_in_message: string[] = [];
  for (const char of plainText) {
    if (char >= '0' && char <= '9') {
      digits_in_message.push(char);
    }
  }

  digits_in_message = digits_in_message.slice(16);

  if (digits_in_message.length === 0) {
    console.log('No digits found in the message. Skipping response.');
    await api.channels.postMessage(channelId, { content: ":runtime_error:", embed: true });
    return;
  }

  const digits = BigInt(digits_in_message.join(''));

  if (digits > 7600n){
    console.log('Digits exceed 7600. Skipping response.');
    await api.channels.postMessage(channelId, { content: ":memory_limit_exceeded:", embed: true });
    return;
  }

  let value = 1n;
  let counter_2 = 0n;
  let distribution = "";
  for (let i = 0n; i < digits; i++) {
    const randomValue = Math.random();
    distribution += randomValue < 0.5 ? "1" : "2";
    value *= randomValue < 0.5 ? 1n : 2n;
    if (randomValue >= 0.5) {
      counter_2++;
    }
  }

  const message = `@${name} < ${plainText}\nDistribution: ${distribution}\nValue: ${value}\nCounter_2: ${counter_2  }`;

  console.log(`Sending message: ${message}`);

  await api.channels.postMessage(channelId, { content: message, embed: true });
});

client.listen(() => {
  console.log('Listening...');
});