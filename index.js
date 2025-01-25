


const mineflayer = require("mineflayer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const saviorsAds = JSON.parse(fs.readFileSync(path.join(__dirname, 'ads.json'))).saviorsAds;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const webhookURL = "https://discord.com/api/webhooks/1330532752562589729/w3hY8Arl70VuXEolV4Thmrb5Tr-3aMZ5W_mqd5NX0jA-7hnXoaF2xrNhsmv4xBNQ54nR";
const tpaLogger = "https://discord.com/api/webhooks/1330661283304968307/KMqyjhKNC7-u6MD-1FMPI1Zh8Y1qWb6f8xWNwNu5z1vaeUe-Uro0g5Aoy317REOCblbQ"
const allowed = ["ryk_cbaool", ".JBTMojang", "Meacia", "saviors_on_top"]; // DO NOT EDIT

function createBot() {
    const bot = mineflayer.createBot({
        host: "6b6t.org",
        port: 25565,
        username: "SaviorsBest",
        auth: "offline",
        version: "1.20.1",
        keepAlive: true,
        checkTimeoutInterval: 60000
    });

    let hasSpawnedOnce = false;
    let canSendMessage = true;
    let teleporting = false;
    let currentWeather = null;

    async function handleTeleport(requester) {
        if (allowed.includes(requester)) {
            bot.chat(`/tpy ${requester}`);
            await sleep(1000);
            bot.chat(`/msg ${requester} I have accepted your teleport request.`);
        }
    }

    async function sendDiscordAlert(message) {
        try {
            await axios.post(webhookUrl, { content: message });
        } catch (error) {
            console.error('Failed to send Discord webhook:', error);
        }
    }

let weatherAvailable = false;

bot.once('spawn', () => {
  console.log("Bot has spawned. Waiting for weather data...");

  // Continuously check for weather updates until it is available
  const weatherCheckInterval = setInterval(() => {
    const weather = bot.world.weather;

    if (weather) {
      weatherAvailable = true;
      logCurrentWeather();
      clearInterval(weatherCheckInterval); // Stop checking once weather is available
    }
  }, 1000);

  // React to real-time weather changes
  bot.on('weather', () => {
    logCurrentWeather();
  });
});

// Function to log the current weather
function logCurrentWeather() {
  const weather = bot.world.weather;

  if (!weather) {
    console.log("Weather data is not available yet.");
    return;
  }

  switch (weather) {
    case 'clear':
      console.log('The weather is clear.');
      break;
    case 'rain':
      console.log('It is currently raining.');
      break;
    case 'thunder':
      console.log('There is a thunderstorm happening.');
      break;
    default:
      console.log('Weather state could not be determined.');
      break;
  }
}

    
    bot.once("spawn", async () => {
        bot.chat("/login Savior");
        bot.setControlState('forward', true);
    });

    bot.on("playerJoined", (player) => {
    const targetPlayers = ["ryk_cbaool", "iced_cave"]; // List of players to monitor

    if (targetPlayers.includes(player.username)) {
        bot.chat("Best player has joined");
        console.log(`${player.username} joined. Announced in chat.`);
    }
});

    
    bot.on('spawn', () => {
        if (hasSpawnedOnce) {
            bot.setControlState('forward', false);
        }
        hasSpawnedOnce = true;
    });

    
bot.on("chat", (username, message) => {
    if (username === bot.username) return; // Ignore the bot's own messages

    // Check if the message contains a TPA request sent to the bot
    const tpaRequestPattern = /^\${username} wants to teletport to you\b/i; // Match "/tpa" at the beginning of the message
    if (tpaRequestPattern.test(message)) {
        console.log(`TPA request detected from ${username}.`);

        // Prepare the webhook data
        const data = {
            username: "Minecraft Bot",
            avatar_url: "https://i.imgur.com/AfFp7pu.png", // Optional bot avatar image
            content: `**TPA Request Received:**\nFrom: ${username}\nMessage: "${message}"`
        };

        // Send the TPA request details to Discord
        axios.post(tpaLogger, data)
            .then(() => {
                console.log(`Successfully sent TPA request notification for ${username}.`);
            })
            .catch((error) => {
                console.error(`Failed to send webhook for TPA request from ${username}:`, error.message);
            });
    }
});



	bot.on("entitySpawn", (entity) => {
    // Check if the entity is a player, is not the bot itself, and is not on the allowed list
    if (entity.type === 'player' && entity.username !== bot.username && !allowed.includes(entity.username)) {
        console.log(`Player ${entity.username} came into view!`);

        // Prepare the data for the webhook
        const data = {
            username: "Watch Dog",
            avatar_url: "https://i.imgur.com/AfFp7pu.png", // Optional bot avatar image
            content: `**Player Detected:** ${entity.username}\nLocation: X=${entity.position.x.toFixed(1)}, Y=${entity.position.y.toFixed(1)}, Z=${entity.position.z.toFixed(1)}`
        };

        // Send the notification to Discord
        axios.post(webhookURL, data)
            .then(() => {
                console.log(`Successfully sent player detection notification for ${entity.username}.`);
            })
            .catch((error) => {
                console.error(`Failed to send webhook for ${entity.username}:`, error.message);
            });
    }
});



    
    bot.on("error", (err) => {
        console.error('Error:', err);
        bot.end();
    });

    bot.on('message', async (message) => {
        const messageString = message.toString();

        const tpaRequestPattern = /^(\w+) wants to teleport to you\.$/;
        const tpaMatch = messageString.match(tpaRequestPattern);
        if (tpaMatch) {
            const requester = tpaMatch[1];
            await handleTeleport(requester).catch(console.error);
            return;
        }

        const cooldownMatch = messageString.match(/Please wait (\d+) seconds before sending another message!/);
        if (cooldownMatch) {
            const waitSeconds = parseInt(cooldownMatch[1]);
            console.log(`Server requested wait of ${waitSeconds} seconds`);
            canSendMessage = false;
            await sleep(waitSeconds * 1000);
            canSendMessage = true;
        }
    });

     bot.on('time', () => {
        const weather = bot.world.weather;
        if (weather === 'clear' && lastWeatherState !== 'clear') {
            sendDiscordAlert("The weather is now clear!");
            console.log("The weather is now clear!");
            lastWeatherState = 'clear';
        } else if (weather === 'thunderstorm' && lastWeatherState !== 'thunder') {
            sendDiscordAlert("@here A thunderstorm has started!");
            console.log("A thunderstorm has started!");
            lastWeatherState = 'thunder';
        }
    });
    
    bot.on('whisper', (username, message) => {
    console.log(`Whisper from ${username}: ${message}`);
});


    //commands start
   bot.on("chat", (username, message) => {
    // Check if the message is "?kit" and if the player is allowed
    if (message.trim().toLowerCase() === '?kit-build' && allowed.includes(username)) {
        // Send a teleport request to the player
        bot.chat(`/tpa ${username}`);
        console.log(`${username} orderd a kit!`);
    } else if (message.trim().toLowerCase() === '?kit-build') {
        // If the player is not allowed, inform them
        bot.chat(`/msg ${username} You don't have permission to use this command.`);
    }
});
bot.on('chat', (player, msg) => {
    if (msg.includes("accepted your teleport request") && allowed.includes(player)) {
        setTimeout(() => {
            bot.chat('/kill');
            console.log(`Executed /kill after teleporting to ${player}`);
        }, 2000); // 2 seconds delay to ensure teleportation happens
    }
});

// Handle teleport acceptance
bot.on('chat', (player, msg) => {
    if (msg.includes("accepted your teleport request") && allowed.includes(player)) {
        setTimeout(() => {
            bot.chat('/kill');
            console.log(`Executed /kill after teleporting to ${player}`);
        }, 2000);
    }
});



    bot.on("chat", (username, message) => {
        if (message.trim().toLowerCase() === '?bestclan') {
            bot.chat('https://discord.gg/gevZAkn2HJ');
        }
    });
    
    bot.on("chat", (username, message) => {
        if (message.trim().toLowerCase() === '?bestplayer') {
            bot.chat('ryk_cbaool is the best 6b6t player. fr fr');
        }
    });
    
     bot.on("chat", (username, message) => {
        if (message.trim().toLowerCase() === '?commands') {
            bot.chat('Commands: ?bestplayer, ?bestclan');
        }
    });
    
     bot.on("chat", (username, message) => {
    if (username === 'ryk_cbaool' && message.startsWith('?say ')) {
        // If the user is ryk_cbaool and uses ?say, the bot will say the message
        const sayMessage = message.slice(5).trim();

        if (sayMessage.length > 0) {
            bot.chat(sayMessage);
        } else {
            bot.chat(`/msg ${username} You need to provide a message to say.`);
        }
    } else if (username !== 'ryk_cbaool' && message.startsWith('?say ')) {
        // Only log if someone ELSE tries to use ?say
        console.log(`User ${username} tried to use the ?say command: ${message}`);
    }
});

    
    //commands end

    bot.on('kicked', (reason, loggedIn) => {
        console.log(`Kicked from server: ${reason} | Logged In: ${loggedIn}`);
    });

    bot.on('end', (reason) => {
        console.log(`Disconnected. Reconnecting in 10 seconds... Reason: ${reason}`);
        setTimeout(initBot, 10000);
    });

    return bot;
}

function initBot() {
    console.log('Initializing bot...');
    return createBot();
}

let bot = initBot();
