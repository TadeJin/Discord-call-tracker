# Discord call tracking bot
This is code for a discord bot, that can track time spend in calls on discord. <br>
The bot uses Discord.js library https://discord.js.org/

## Features
- Weekly and monthly call statistics, including average call time
- Tracked users management

## Setup
In order for the bot to work you have to create a .env file that includes these variables:
- BOT_ID (Discord ID of the bot)
- SERVER_ID (Discord ID of the server)
- CHANNEL_ID (Channel ID where statistics will be sent)
- DEBUG_CHANNEL_ID (Channel ID where debug messages will be sent to)
- BOT_TOKEN
- ADMIN_ID (This is the Discord ID of the admin, that will be pinged in error messages sent to debug)