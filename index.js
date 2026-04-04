const axios = require("axios");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const MONITORS = [
  {
    name: "Taylor Swift",
    apiUrl: "https://musicdrop.pl/collections/taylor-swift/products.json?limit=250",
    channelId: "1489595897875791872"
  },
  {
    name: "Ariana Grande",
    apiUrl: "https://musicdrop.pl/collections/ariana-grande/products.json?limit=250",
    channelId: "1489595978892710070"
  },
  {
    name: "Selena Gomez",
    apiUrl: "https://musicdrop.pl/collections/selena-gomez/products.json?limit=250",
    channelId: "1489596049323462788"
  },
  {
    name: "Lady Gaga",
    apiUrl: "https://musicdrop.pl/collections/lady-gaga/products.json?limit=250",
    channelId: "1489596081271738549"
  },
  {
    name: "Yungblud",
    apiUrl: "https://musicdrop.pl/collections/yungblud/products.json?limit=250",
    channelId: "1489596152478437509"
  },
  {
    name: "Olivia Rodrigo",
    apiUrl: "https://musicdrop.pl/collections/olivia-rodrigo/products.json?limit=250",
    channelId: "1489598100459753563"
  }
];

const PRIORITY_KEYWORDS = [
  "signed", "podpisany", "podpisana", "podpisane",
  "autograf", "autographed",
  "limited edition", "limitowana", "limitowany", "limitowane", "limited",
  "special edition", "specjalna edycja",
  "exclusive", "ekskluzywny", "ekskluzywna",
  "deluxe", "box set", "collector", "kolekcjonerski", "kolekcjonerska"
];

function isPriority(title) {
  const lower = title.toLowerCase();
  return PRIORITY_KEYWORDS.some(keyword => lower.includes(keyword));
}

function formatPrice(price) {
  const num = parseFloat(price);
  if (isNaN(num)) return null;
  return num.toFixed(2).replace(".", ",") + " zł";
}

let lastState = {};

async function fetchProducts(apiUrl) {
  try {
    const res = await axios.get(apiUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MusicdropMonitor/1.0)" },
      timeout: 15000
    });
    const products = res.data.products || [];
    return products.map(p => ({
      title: p.title,
      link: `https://musicdrop.pl/products/${p.handle}`,
      image: p.images && p.images[0] ? p.images[0].src : null,
      price: p.variants && p.variants[0] ? formatPrice(p.variants[0].price) : null
    }));
  } catch (err) {
    console.error(`[ERROR] Błąd pobierania ${apiUrl}: ${err.message}`);
    return [];
  }
}

async function checkForNewProducts() {
  for (const monitor of MONITORS) {
    const { name, apiUrl, channelId } = monitor;

    let channel;
    try {
      channel = await client.channels.fetch(channelId);
    } catch (err) {
      console.error(`[ERROR] Nie można pobrać kanału dla ${name}: ${err.message}`);
      continue;
    }

    const products = await fetchProducts(apiUrl);
    if (products.length === 0) continue;

    const known = lastState[apiUrl] || null;
    if (known === null) {
      console.log(`[INFO] Inicjalizacja ${name}: zapamiętano ${products.length} produktów`);
      lastState[apiUrl] = products;
      continue;
    }

    const knownTitles = new Set(known.map(p => p.title));

    for (const product of products) {
      if (!knownTitles.has(product.title)) {
        const priority = isPriority(product.title);
        console.log(`[${priority ? "PRIORITY" : "NEW"}] ${name}: ${product.title} — ${product.price || "brak ceny"}`);

        const embed = new EmbedBuilder()
          .setURL(product.link)
          .setFooter({ text: `MusicDrop Monitor • ${name}` })
          .setTimestamp();

        if (priority) {
          embed
            .setTitle(`⭐ ${product.title}`)
            .setColor(0xFFD700)
            .setDescription("**Specjalne / podpisane wydanie!**");
        } else {
          embed
            .setTitle(product.title)
            .setColor(0x00AEEF);
        }

        if (product.price) embed.addFields({ name: "Cena", value: product.price, inline: true });
        if (product.image) embed.setThumbnail(product.image);

        try {
          if (priority) {
            await channel.send({ content: "@here", embeds: [embed] });
          } else {
            await channel.send({ embeds: [embed] });
          }
        } catch (sendErr) {
          console.error(`[ERROR] Nie można wysłać wiadomości do ${name}: ${sendErr.message}`);
        }
      }
    }

    lastState[apiUrl] = products;
  }
}

client.once("ready", async () => {
  console.log(`[BOT] Zalogowano jako ${client.user.tag}`);
  console.log(`[BOT] Monitorowanie MusicDrop co 20 sekund...`);
  MONITORS.forEach(m => console.log(`[BOT]  • ${m.name} → kanał ${m.channelId}`));
  await checkForNewProducts();
  setInterval(checkForNewProducts, 20 * 1000);
});

client.on("error", (err) => {
  console.error(`[CLIENT ERROR] ${err.message}`);
});

process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED REJECTION]", reason);
});

if (!process.env.TOKEN) {
  console.error("[ERROR] Brak TOKEN w zmiennych środowiskowych!");
  process.exit(1);
}

client.login(process.env.TOKEN);
