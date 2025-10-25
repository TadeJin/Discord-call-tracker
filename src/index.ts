import "dotenv/config";
import {
    Client,
    IntentsBitField,
    Interaction,
    Message,
    VoiceState,
} from "discord.js";
import {
    addJoinTime,
    addNewUser,
    addUserTime,
    getUserTimeJSON,
    removeUser,
} from "./utils/dataManager";
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
    } else if (interaction.commandName == "remove_user") {
        const chosenUser = interaction.options.getUser("user");

        if (!chosenUser) {
            interaction.reply("No name provided");
        } else {
            removeUser(chosenUser.id)
                ? interaction.reply(`User ${chosenUser} removed`)
                : interaction.reply("Error removing user!");
        }
    }
});

client.on("voiceStateUpdate", (oldState: VoiceState, newState: VoiceState) => {
    if (oldState.member && newState.member) {
        if (!(newState.member.id in getUserTimeJSON())) return;

        if (!oldState.channel && newState.channel) {
            addJoinTime(oldState.member.id, new Date());
        }

        if (oldState.channel && !newState.channel) {
            addUserTime(oldState.member.id, new Date());
        }
    }
});

client.login(process.env.BOT_TOKEN);
