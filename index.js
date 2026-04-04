const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const TOKEN = process.env.TOKEN;

// ID kanału, na który mają iść logi bota
const LOG_CHANNEL = "WSTAW_TUTAJ_ID_KANAŁU";

// Tworzenie klienta Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Po zalogowaniu bota
client.on("ready", () => {
  console.log(`[BOT] Zalogowano jako ${client.user.tag}`);

  // Status bota
  client.user.setPresence({
    activities: [{ name: "MusicDrop", type: 3 }],
    status: "online"
  });

  // Log startu na kanał Discord
  const ch = client.channels.cache.get(LOG_CHANNEL);
  if (ch) {
    ch.send("🔵 Bot został uruchomiony i działa stabilnie.");
  }

  console.log("[INFO] Monitorowanie MusicDrop co 20 sekund...");
});

// Twój monitoring / funkcje bota
setInterval(() => {
  // tu zostawiasz swój kod monitorowania
  // nic nie zmieniam, bo działa
}, 20000);

// Automatyczny restart co 6 godzin
setInterval(() => {
  console.log("[BOT] Automatyczny restart...");
  process.exit(0);
}, 1000 * 60 * 60 * 6);

// Logowanie bota
client.login(TOKEN);
