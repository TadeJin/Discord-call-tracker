"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommands = void 0;
require("dotenv/config");
const discord_js_1 = require("discord.js");
const commands = [
    {
        name: "update_commands",
        description: "Updates commands, including their options"
    },
    {
        name: "add_user",
        description: "Adds user for tracking call time",
        options: [
            {
                name: "user",
                description: "Specifies which user to be added",
                type: discord_js_1.ApplicationCommandOptionType.User,
                required: true
            }
        ]
    }
];
const updateCommands = () => {
    const botID = process.env.BOT_ID;
    const serverID = process.env.SERVER_ID;
    const botToken = process.env.BOT_TOKEN;
    if (botID && serverID && botToken) {
        const rest = new discord_js_1.REST().setToken(botToken);
        const commandsRegister = async () => {
            try {
                console.log("Registering commands");
                await rest.put(discord_js_1.Routes.applicationGuildCommands(botID, serverID), {
                    body: commands
                });
                console.log("Commands loaded");
            }
            catch (error) {
                console.error(error);
            }
        };
        commandsRegister();
    }
};
exports.updateCommands = updateCommands;
