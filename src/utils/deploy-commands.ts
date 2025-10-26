import "dotenv/config";
import { ApplicationCommandOptionType, REST, Routes } from "discord.js";

const commands = [
    {
        name: "update_commands",
        description: "Updates commands, including their options",
    },
    {
        name: "add_user",
        description: "Adds user for tracking call time",
        options: [
            {
                name: "user",
                description: "Specifies which user to be added",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
        ],
    },
    {
        name: "remove_user",
        description: "Removes user from tracking",
        options: [
            {
                name: "user",
                description: "Specifies which user to be removed",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
        ],
    },
    {
        name: "show_week_overview",
        description: "Shows the current week overview",
    },
    {
        name: "show_month_overview",
        description: "Shows the current month overview",
    },
];

export const updateCommands = async (): Promise<boolean> => {
    const botID = process.env.BOT_ID;
    const serverID = process.env.SERVER_ID;
    const botToken = process.env.BOT_TOKEN;

    if (botID && serverID && botToken) {
        const rest = new REST().setToken(botToken);

        const commandsRegister = async (): Promise<boolean> => {
            try {
                console.log("Registering commands");
                await rest.put(
                    Routes.applicationGuildCommands(botID, serverID),
                    {
                        body: commands,
                    }
                );

                console.log("Commands loaded");
                return true;
            } catch (error) {
                console.error(error);
                return false;
            }
        };

        return await commandsRegister();
    }

    return false;
};
