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
    createFileIfNotExists,
    createFolderIfNotExists,
    getJSONContent,
    removeUser,
} from "./utils/dataManager";
import { updateCommands } from "./utils/deploy-commands";
import {
    sendDebugMessage,
    showMonthStatistic,
    showWeekStatistic,
} from "./utils/statisticsManager";
import {
    DATA_FOLDER_PATH,
    MONTH_TIMES_PATH,
    USER_TIMES_PATH,
} from "./utils/constants";
import { startScheduler } from "./utils/scheduler";

export const client = new Client({
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
    // Automatic statistics printing (disable by commenting out)
    sendDebugMessage(
        "Automatic statistics enabled",
        "Error starting automatic statistics",
        startScheduler()
    );
    const createBotDataIfNotExists =
        createFolderIfNotExists(DATA_FOLDER_PATH) &&
        createFileIfNotExists(USER_TIMES_PATH) &&
        createFileIfNotExists(MONTH_TIMES_PATH);

    sendDebugMessage(
        "Data is correct",
        "Error creating files",
        createBotDataIfNotExists
    );
});

//Chat commands
client.on("messageCreate", (message: Message) => {
    if (message.author.bot) {
        return;
    } else if (message.content === ".initialize-commands") {
        //Initializes new commands
        updateCommands();
        message.reply("Commands initialized!");
    }
});

//Interactions
client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName == "hey") {
        //Hello command
        interaction.reply("Hello!");
    } else if (interaction.commandName == "update_commands") {
        //Update commands
        (await updateCommands())
            ? interaction.reply("Commands updated!")
            : interaction.reply("Error updating commands!");
    } else if (interaction.commandName == "add_user") {
        //Add user
        const chosenUser = interaction.options.getUser("user");

        if (!chosenUser) {
            interaction.reply("No name provided");
        } else {
            addNewUser(chosenUser.id)
                ? interaction.reply(`User ${chosenUser} added`)
                : interaction.reply("Error adding user!");
        }
    } else if (interaction.commandName == "remove_user") {
        //Remove user
        const chosenUser = interaction.options.getUser("user");

        if (!chosenUser) {
            interaction.reply("No name provided");
        } else {
            removeUser(chosenUser.id)
                ? interaction.reply(`User ${chosenUser} removed`)
                : interaction.reply("Error removing user!");
        }
    } else if (interaction.commandName == "show_week_overview") {
        //Displays week overview
        (await showWeekStatistic())
            ? interaction.reply(
                  `Weekly statistic sent to <#${process.env.CHANNEL_ID}>!`
              )
            : interaction.reply("Error sending statistic!");
    } else if (interaction.commandName == "show_month_overview") {
        //Displays month overview
        (await showMonthStatistic())
            ? interaction.reply(
                  `Monthly statistic sent to <#${process.env.CHANNEL_ID}>!`
              )
            : interaction.reply("Error sending statistic!");
    }
});

//VoiceState listener
client.on("voiceStateUpdate", (oldState: VoiceState, newState: VoiceState) => {
    if (oldState.member && newState.member) {
        const trackedUsers = getJSONContent(USER_TIMES_PATH) || {};
        if (!(newState.member.id in trackedUsers)) return;

        if (!oldState.channel && newState.channel) {
            //New join
            const added = addJoinTime(oldState.member.id, new Date());
            sendDebugMessage(
                `User ${
                    oldState.member.displayName
                } joined a channel at ${new Date()}`,
                "Error adding join time",
                added
            );
        }

        if (oldState.channel && !newState.channel) {
            //Leaves channel
            const added = addUserTime(oldState.member.id, new Date());
            sendDebugMessage(
                `User ${
                    oldState.member.displayName
                } left a channel at ${new Date()}`,
                "Error adding time",
                added
            );
        }
    }
});

client.login(process.env.BOT_TOKEN);
