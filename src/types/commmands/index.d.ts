import { Collection } from "discord.js";
import { Command } from "../../functions/interface.js";

declare module "discord.js" {
    interface Client {
        commands: Collection<string, Command>;
    }
}
