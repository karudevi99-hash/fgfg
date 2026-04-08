const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const TOKEN = "YOUR_WHATSAPP_TOKEN";
const PHONE_NUMBER_ID = "YOUR_PHONE_NUMBER_ID";

// user state store (memory based)
let userState = {};

// helper function to send message
async function sendMessage(to, message) {
  await axios.post(
    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: message }
    },
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}

// send image (QR)
async function sendImage(to) {
  await axios.post(
    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: to,
      type: "image",
      image: {
        link: "https://yourdomain.com/qr.png" // upload QR somewhere
      }
    },
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}

// webhook
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    const from = message.from;

    // initialize state
    if (!userState[from]) {
      userState[from] = 1;
    }

    let step = userState[from];

    // STEP 1
    if (step === 1) {
      await sendMessage(from, `🎯 Daily Bumper Ticket Offer 🎯

✨ Trusted • Simple • Winning Opportunity ✨

💰 Affordable Ticket Plans – Best Value Guaranteed

1️⃣ ₹40 – 1 Ticket (Value: 10 CR)
2️⃣ ₹200 – 5 Tickets (Each worth 10 CR)
3️⃣ ₹400 – 10 Tickets + 🎁 2 Tickets FREE
4️⃣ ₹800 – 20 Tickets + 🎁 5 Tickets FREE

⏰ Result Time:
🕙 Morning – 10:00 AM
🕒 Afternoon – 3:00 PM

📞 Call: 8670163368

🔥 Roz ka chance – bada jeetne ka mauka!`);

      userState[from] = 2;
    }

    // STEP 2
    else if (step === 2) {
      await sendImage(from);

      await sendMessage(from, `1️⃣ ₹40 – 1 Ticket (Value: 10 CR)
2️⃣ ₹200 – 5 Tickets
3️⃣ ₹400 – 10 Tickets + 🎁 2 FREE
4️⃣ ₹800 – 20 Tickets + 🎁 5 FREE

Kindly complete the payment and share screenshot 🙂

कृपया पेमेंट करके स्क्रीनशॉट भेजें 🙂`);

      userState[from] = 3;
    }

    // STEP 3
    else if (step === 3) {
      await sendMessage(from, `Please contact support: 8670163368 🙂

कृपया सहायता के लिए 8670163368 पर संपर्क करें 🙂`);

      userState[from] = 4; // stop loop
    }

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// verification (IMPORTANT for Meta)
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "my_verify_token";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.listen(3000, () => console.log("Server running"));
