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
    getJSONContent,
    removeUser,
} from "./utils/dataManager";
import { updateCommands } from "./utils/deploy-commands";
import {
    showMonthStatistic,
    showWeekStatistic,
} from "./utils/statisticsManager";
import { USER_TIMES_PATH } from "./utils/constants";

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
});

client.on("messageCreate", (message: Message) => {
    if (message.author.bot) {
        return;
    } else if (message.content === ".initialize-commands") {
        //Initializes new commands
        updateCommands();
        message.reply("Commands initialized!");
    }
});

client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName == "hey") {
        //Hello command
        interaction.reply("Hello!");
    } else if (interaction.commandName == "update_commands") {
        //Update commands
        updateCommands();
        interaction.reply("Commands updated!");
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
        (await showWeekStatistic().then())
            ? interaction.reply(
                  `Weekly statistic sent to <#${process.env.CHANNEL_ID}>!`
              )
            : interaction.reply("Error sending statistic!");
    } else if (interaction.commandName == "show_month_overview") {
        //Displays month overview
        (await showMonthStatistic().then())
            ? interaction.reply(
                  `Monthly statistic sent to <#${process.env.CHANNEL_ID}>!`
              )
            : interaction.reply("Error sending statistic!");
    }
});

client.on("voiceStateUpdate", (oldState: VoiceState, newState: VoiceState) => {
    if (oldState.member && newState.member) {
        if (!(newState.member.id in getJSONContent(USER_TIMES_PATH))) return;

        if (!oldState.channel && newState.channel) {
            //New join
            addJoinTime(oldState.member.id, new Date());
        }

        if (oldState.channel && !newState.channel) {
            //Leaves channel
            addUserTime(oldState.member.id, new Date());
        }
    }
});

client.login(process.env.BOT_TOKEN);
