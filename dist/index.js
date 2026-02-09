"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
require("dotenv/config");
const discord_js_1 = require("discord.js");
const dataManager_1 = require("./utils/dataManager");
const deploy_commands_1 = require("./utils/deploy-commands");
const statisticsManager_1 = require("./utils/statisticsManager");
const constants_1 = require("./utils/constants");
const scheduler_1 = require("./utils/scheduler");
const userManager_1 = require("./utils/userManager");
exports.client = new discord_js_1.Client({
    intents: [
        discord_js_1.IntentsBitField.Flags.Guilds,
        discord_js_1.IntentsBitField.Flags.GuildMembers,
        discord_js_1.IntentsBitField.Flags.GuildMessages,
        discord_js_1.IntentsBitField.Flags.MessageContent,
        discord_js_1.IntentsBitField.Flags.GuildVoiceStates,
    ],
});
exports.client.on("clientReady", (c) => {
    console.log(`${c.user.tag} is online.`);
    (0, statisticsManager_1.sendDebugMessage)(`<@${c.user.id}> is online.`, "", true);
    // Automatic statistics printing (disable by commenting out)
    (0, statisticsManager_1.sendDebugMessage)("", "Error starting automatic statistics", (0, scheduler_1.startScheduler)());
    const createBotDataIfNotExists = (0, dataManager_1.createFolderIfNotExists)(constants_1.DATA_FOLDER_PATH) &&
        (0, dataManager_1.createFileIfNotExists)(constants_1.USER_TIMES_PATH) &&
        (0, dataManager_1.createFileIfNotExists)(constants_1.MONTH_TIMES_PATH);
    (0, statisticsManager_1.sendDebugMessage)("", "Error creating files", createBotDataIfNotExists);
});
//Chat commands
exports.client.on("messageCreate", (message) => {
    if (message.author.bot) {
        return;
    }
    else if (message.content === ".initialize-commands") {
        //Initializes new commands
        (0, deploy_commands_1.updateCommands)();
        message.reply("Commands initialized!");
    }
});
//Interactions
exports.client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    if (interaction.commandName == "hey") {
        //Hello command
        interaction.reply("Hello!");
    }
    else if (interaction.commandName == "update_commands") {
        //Update commands
        (await (0, deploy_commands_1.updateCommands)())
            ? interaction.reply("Commands updated!")
            : interaction.reply("Error updating commands!");
    }
    else if (interaction.commandName == "add_user") {
        //Add user
        const chosenUser = interaction.options.getUser("user");
        if (!chosenUser) {
            interaction.reply("No name provided");
        }
        else {
            await (0, userManager_1.addNewUser)(chosenUser.id)
                ? interaction.reply(`User ${chosenUser} added`)
                : interaction.reply("Error adding user!");
        }
    }
    else if (interaction.commandName == "remove_user") {
        //Remove user
        const chosenUser = interaction.options.getUser("user");
        if (!chosenUser) {
            interaction.reply("No name provided");
        }
        else {
            (0, userManager_1.removeUser)(chosenUser.id)
                ? interaction.reply(`User ${chosenUser} removed`)
                : interaction.reply("Error removing user!");
        }
    }
    else if (interaction.commandName == "show_week_overview") {
        //Displays week overview
        (await (0, statisticsManager_1.showWeekStatistic)(process.env.CHANNEL_ID))
            ? interaction.reply(`Showing weekly statistic in <#${process.env.CHANNEL_ID}>`)
            : interaction.reply("Error sending statistic!");
    }
    else if (interaction.commandName == "show_month_overview") {
        //Displays month overview
        (await (0, statisticsManager_1.showMonthStatistic)(process.env.CHANNEL_ID))
            ? interaction.reply(`Showing monthly statistic in <#${process.env.CHANNEL_ID}>`)
            : interaction.reply("Error sending statistic!");
    }
    else if (interaction.commandName == "show_tracked") {
        const reply = await (0, userManager_1.showTrackedUsers)();
        interaction.reply(reply);
    }
});
//VoiceState listener
exports.client.on("voiceStateUpdate", (oldState, newState) => {
    if (oldState.member && newState.member) {
        const trackedUsers = (0, dataManager_1.getJSONContent)(constants_1.USER_TIMES_PATH) || {};
        if (!(newState.member.id in trackedUsers))
            return;
        if (!oldState.channel && newState.channel) {
            //New join
            (0, dataManager_1.addJoinTime)(oldState.member.id, new Date());
            (0, statisticsManager_1.sendDebugMessage)(`User ${oldState.member.displayName} joined a channel at ${new Date()}`, "", true);
        }
        if (oldState.channel && !newState.channel) {
            //Leaves channel
            (0, dataManager_1.addUserTime)(oldState.member.id, new Date());
            (0, statisticsManager_1.sendDebugMessage)(`User ${oldState.member.displayName} left a channel at ${new Date()}`, "", true);
        }
    }
});
exports.client.login(process.env.BOT_TOKEN);
