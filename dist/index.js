"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const discord_js_1 = require("discord.js");
const dataManager_1 = require("./utils/dataManager");
const deploy_commands_1 = require("./utils/deploy-commands");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.IntentsBitField.Flags.Guilds,
        discord_js_1.IntentsBitField.Flags.GuildMembers,
        discord_js_1.IntentsBitField.Flags.GuildMessages,
        discord_js_1.IntentsBitField.Flags.MessageContent,
        discord_js_1.IntentsBitField.Flags.GuildVoiceStates,
    ],
});
client.on("clientReady", (c) => {
    console.log(`${c.user.tag} is online.`);
});
client.on("messageCreate", (message) => {
    if (message.author.bot) {
        return;
    }
    else if (message.content === ".initialize-commands") {
        (0, deploy_commands_1.updateCommands)();
        message.reply("Commans initialized!");
    }
    else if (message.content === ".readData") {
        // readData();
        const filePath = path_1.default.join(__dirname, "botConfig", "userTimes.json");
        const userTimes = fs_1.default.readFileSync(filePath, "utf-8");
        console.log(userTimes);
        message.reply("Read!");
    }
    else if (message.content === ".off") {
        message.reply("*OFF*");
        client.destroy();
    }
});
client.on("interactionCreate", (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    if (interaction.commandName == "hey") {
        interaction.reply("Hello!");
    }
    else if (interaction.commandName == "update_commands") {
        (0, deploy_commands_1.updateCommands)();
        interaction.reply("Commands updated!");
    }
    else if (interaction.commandName == "add_user") {
        const chosenUser = interaction.options.getUser("user");
        if (!chosenUser) {
            interaction.reply("No name provided");
        }
        else {
            (0, dataManager_1.addNewUser)(chosenUser.id) ? interaction.reply(`User ${chosenUser} added`) : interaction.reply("Error adding user!");
        }
    }
});
client.login(process.env.BOT_TOKEN);
