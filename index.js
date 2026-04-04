const { Client, GatewayIntentBits } = require("discord.js");

const TOKEN = process.env.TOKEN; // Railway ma to w Variables

// ID kanału, gdzie mają iść logi
const LOG_CHANNEL = "1489800618515366032";

// Tworzenie klienta
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Po starcie bota
client.on("ready", () => {
  console.log(`[BOT] Zalogowano jako ${client.user.tag}`);

  // Status jak na Fly.io
  client.user.setPresence({
    activities: [{ name: "MusicDrop", type: 3 }],
    status: "online"
  });

  // Log startu
  const ch = client.channels.cache.get(LOG_CHANNEL);
  if (ch) ch.send("🔵 Bot uruchomiony i działa stabilnie.");

  console.log("[INFO] Monitoring aktywny...");
});

// Monitoring – tu wklejasz swój kod, który JUŻ działał
setInterval(() => {
  // ← tutaj był Twój kod monitorowania MusicDrop
}, 20000);

// Automatyczny restart co 6 godzin (tak jak na Fly.io)
setInterval(() => {
  console.log("[BOT] Automatyczny restart...");
  process.exit(0);
}, 1000 * 60 * 60 * 6);

// Logowanie
client.login(TOKEN);
