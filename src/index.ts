import "dotenv/config";
import { Client, IntentsBitField, Interaction, Message } from "discord.js";
import { addNewUser, addUserTime } from "./utils/dataManager";
import { updateCommands } from "./utils/deploy-commands";
import fs from "fs";
import path from "path";

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildVoiceStates,
    ],
});

client.on("clientReady", (c) => {
    console.log(`${c.user.tag} is online.`);
});

client.on("messageCreate", (message: Message) => {
    if (message.author.bot) {
        return;
    } else if (message.content === ".initialize-commands") {
        updateCommands();
        message.reply("Commans initialized!");
    } else if (message.content === ".off") {
        message.reply("*OFF*");
        client.destroy();
    }
});

client.on("interactionCreate", (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName == "hey") {
        interaction.reply("Hello!");
    } else if (interaction.commandName == "update_commands") {
        updateCommands();
        interaction.reply("Commands updated!");
    } else if (interaction.commandName == "add_user") {
        const chosenUser = interaction.options.getUser("user");

        if (!chosenUser) {
            interaction.reply("No name provided");
        } else {
            addNewUser(chosenUser.id)
                ? interaction.reply(`User ${chosenUser} added`)
                : interaction.reply("Error adding user!");
        }
    }
});

client.login(process.env.BOT_TOKEN);
