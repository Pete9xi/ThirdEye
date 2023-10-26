import { Channel, ChannelType, Guild, GuildMember, PermissionsBitField } from "discord.js";
import { Client } from "bedrock-protocol";
import config from "../config.js";
export function setupVoiceChatListener(bot: Client, targetGuild: Guild) {
    //CreateVC
    bot.on("text", (packet) => {
        switch (packet.type) {
            case "json_whisper": {
                const msg = packet.message;
                const obj = JSON.parse(msg);
                let requester: string;
                if (obj.rawtext[0].text.includes(config.voiceChannelCommandPrefix + "createVoiceChannel")) {
                    const inputString = obj.rawtext[0].text;

                    // Find the index of the first occurrence of '§r'
                    const index = inputString.indexOf("§r");
                    const requesterIndex = inputString.indexOf("§7");
                    if (requesterIndex !== -1) {
                        // Find the position of ":" after "§7"
                        const colonIndex = inputString.indexOf(":", requesterIndex);

                        if (colonIndex !== -1) {
                            // Extract the substring before ":"
                            requester = inputString.substring(requesterIndex + 2, colonIndex).trim();
                            console.log(requester);
                        }
                    }
                    // Extract everything after '§r'
                    const result = index !== -1 ? inputString.substring(index + 2) : "";
                    const guild = targetGuild;
                    const category = guild.channels.cache.find((ch: Channel) => ch.type === ChannelType.GuildCategory && ch.name === config.voiceChannelsCategory);
                    //Get the channel name and members

                    const values = result.split(" ");
                    const channelName = "v" + values[1];

                    // Extract the members starting from index 2
                    const members = values.slice(2);

                    // Create an array of promises to fetch members
                    const fetchPromises = members.map((memberName: string) => fetchUserByUsername(memberName));
                    function fetchUserByUsername(username: string) {
                        return new Promise((resolve, reject) => {
                            guild.members
                                .fetch({ query: username, limit: 1 })
                                .then((fetchedMembers) => {
                                    const member = fetchedMembers.first();
                                    if (member) {
                                        resolve(member);
                                    } else {
                                        reject(`User "${username}" not found.`);
                                    }
                                })
                                .catch(reject);
                        });
                    }
                    Promise.allSettled(fetchPromises)
                        .then((results) => {
                            //@ts-ignore
                            const users = results.filter((result) => result.status === "fulfilled").map((result) => result.value);

                            // Now 'users' contains the found members as variables
                            const memberIDs = users.map((user) => user.id.toString());
                            const usersInPrivateChannels = [];
                            const usernamesInPrivateChannels: string[] = [];

                            users.forEach((user) => {
                                const currentChannelName = user.voice.channel ? user.voice.channel.name : null;
                                if (currentChannelName && currentChannelName.startsWith("v")) {
                                    usersInPrivateChannels.push(user);
                                    usernamesInPrivateChannels.push(user.user.username);
                                }
                            });

                            if (usersInPrivateChannels.length > 0) {
                                console.log("Users in private channels:");
                                usernamesInPrivateChannels.forEach((username) => {
                                    console.log(username);
                                });

                                console.log("Skipping channel creation.");
                                const cmd = `/tellraw ${requester} {"rawtext":[{"text":"§8[§9VC Error§8] §6The following users are already in a private voice channel ${usernamesInPrivateChannels}. Your request has been canceled"}]}`;
                                bot.queue("command_request", {
                                    command: cmd,
                                    origin: {
                                        type: "player",
                                        uuid: "",
                                        request_id: "",
                                    },
                                    internal: false,
                                    version: 52,
                                });
                                return;
                            }

                            console.log("Getting IDs:");
                            console.log(memberIDs);
                            console.log("Trying to create the channel");

                            guild.channels
                                .create({
                                    name: channelName,
                                    type: ChannelType.GuildVoice,
                                    parent: category.id,
                                    permissionOverwrites: [
                                        // Admin Role ID
                                        {
                                            id: config.voiceAdminRoleID, // Replace with the role ID you want to restrict
                                            allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel],
                                        },
                                        // Example: Allow each member to view and connect
                                        ...memberIDs.map((id) => ({
                                            id,
                                            allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.UseVAD, PermissionsBitField.Flags.Speak],
                                        })),
                                        // Example: Deny @everyone to view and connect (overrides default permissions)
                                        {
                                            id: guild.roles.everyone, // @everyone role ID
                                            deny: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel],
                                        },
                                    ],
                                })
                                .then((channel) => {
                                    // Do something with the created channel if needed
                                    console.log(`Created voice channel: ${channel.name}`);
                                    const channelID = channel.id;
                                    users.forEach((user) => {
                                        /*if (members.includes(requester)) {
                                            console.log("members: " + user.user.username + "requester: " + requester);
                                        }*/
                                        user.voice.setChannel(channelID);
                                        user.voice.setMute(false);
                                        user.voice.setDeaf(false);
                                    });
                                })
                                .catch(console.error);
                        })
                        .catch((error) => {
                            console.error(`Error fetching members: ${error}`);
                        });
                    break;
                }
            }
            case "chat": {
                //handle the vc request from a standard chat message

                if (packet.message.includes(config.voiceChannelCommandPrefix + "createVoiceChannel")) {
                    const guild = targetGuild;
                    const category = guild.channels.cache.find((ch: Channel) => ch.type === ChannelType.GuildCategory && ch.name === config.voiceChannelsCategory);
                    //Get the channel name and members
                    const values = packet.message.split(" ");
                    const channelName = "v" + values[1];
                    const requester = packet.source_name;

                    // Extract the members starting from index 2
                    const members = values.slice(2);
                    // Create an array of promises to fetch members
                    const fetchPromises = members.map((memberName: string) => fetchUserByUsername(memberName));
                    function fetchUserByUsername(username: string) {
                        return new Promise((resolve, reject) => {
                            guild.members
                                .fetch({ query: username, limit: 1 })
                                .then((fetchedMembers) => {
                                    const member = fetchedMembers.first();
                                    if (member) {
                                        resolve(member);
                                    } else {
                                        reject(`User "${username}" not found.`);
                                    }
                                })
                                .catch(reject);
                        });
                    }
                    Promise.allSettled(fetchPromises)
                        .then((results) => {
                            //@ts-ignore
                            const users = results.filter((result) => result.status === "fulfilled").map((result) => result.value);

                            // Now 'users' contains the found members as variables
                            const memberIDs = users.map((user) => user.id.toString());
                            const usersInPrivateChannels = [];
                            const usernamesInPrivateChannels: string[] = [];

                            users.forEach((user) => {
                                const currentChannelName = user.voice.channel ? user.voice.channel.name : null;
                                if (currentChannelName && currentChannelName.startsWith("v")) {
                                    usersInPrivateChannels.push(user);
                                    usernamesInPrivateChannels.push(user.user.username);
                                }
                            });

                            if (usersInPrivateChannels.length > 0) {
                                console.log("Users in private channels:");
                                usernamesInPrivateChannels.forEach((username) => {
                                    console.log(username);
                                });

                                console.log("Skipping channel creation.");
                                const cmd = `/tellraw ${requester} {"rawtext":[{"text":"§8[§9VC Error§8] §6The following users are already in a private voice channel ${usernamesInPrivateChannels}. Your request has been canceled"}]}`;
                                bot.queue("command_request", {
                                    command: cmd,
                                    origin: {
                                        type: "player",
                                        uuid: "",
                                        request_id: "",
                                    },
                                    internal: false,
                                    version: 52,
                                });
                                return;
                            }

                            if (!users.every((user) => user.voice.channel)) {
                                console.log("All members must be in a voice channel. You need to be in a holding channel.");
                                return;
                            }

                            console.log("Getting IDs:");
                            console.log(memberIDs);
                            console.log("Trying to create the channel");

                            guild.channels
                                .create({
                                    name: channelName,
                                    type: ChannelType.GuildVoice,
                                    parent: category.id,
                                    permissionOverwrites: [
                                        // Admin Role ID
                                        {
                                            id: config.voiceAdminRoleID,
                                            allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel],
                                        },
                                        // Allow each member to view and connect
                                        ...memberIDs.map((id) => ({
                                            id,
                                            allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.UseVAD, PermissionsBitField.Flags.Speak],
                                        })),
                                        //Deny @everyone to view and connect (overrides default permissions)
                                        {
                                            id: guild.roles.everyone,
                                            deny: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel],
                                        },
                                    ],
                                })
                                .then((channel) => {
                                    console.log(`Created voice channel: ${channel.name}`);
                                    const channelID = channel.id;
                                    users.forEach((user) => {
                                        user.voice.setChannel(channelID);
                                        user.voice.setMute(false);
                                        user.voice.setDeaf(false);
                                    });
                                })
                                .catch(console.error);
                        })
                        .catch((error) => {
                            console.error(`Error fetching members: ${error}`);
                        });
                    break;
                }
            }
        }
    });
    //Invite to VC
    bot.on("text", (packet) => {
        switch (packet.type) {
            case "json_whisper": {
                const msg = packet.message;
                const obj = JSON.parse(msg);
                let requester: string;
                if (obj.rawtext[0].text.includes(config.voiceChannelCommandPrefix + "invite")) {
                    const inputString = obj.rawtext[0].text;
                    // Find the index of the first occurrence of '§r'
                    const index = inputString.indexOf("§r");
                    const requesterIndex = inputString.indexOf("§7");
                    if (requesterIndex !== -1) {
                        // Find the position of ":" after "§7"
                        const colonIndex = inputString.indexOf(":", requesterIndex);
                        if (colonIndex !== -1) {
                            // Extract the substring before ":"
                            requester = inputString.substring(requesterIndex + 2, colonIndex).trim();
                            console.log(requester);
                        }
                    }
                    // Extract everything after '§r'
                    const result = index !== -1 ? inputString.substring(index + 2) : "";
                    const guild = targetGuild;
                    //Get the channel name and members
                    const values = result.split(" ");
                    const channelName = "v" + values[1];
                    // Extract the members starting from index 2
                    const memberToBeInvited = values.slice(2);
                    const channelToBeInvitedTo: Channel = guild.channels.cache.find((ch: Channel) => ch.type === ChannelType.GuildVoice && ch.name === channelName);
                    //Get the Requesters User object in discord.
                    function fetchSingleMemberAndCheck(username: string) {
                        return new Promise((resolve, reject) => {
                            guild.members
                                .fetch({ query: username, limit: 1 })
                                .then((fetchedMembers) => {
                                    const member = fetchedMembers.first();
                                    if (member) {
                                        const currentChannelName = member.voice.channel ? member.voice.channel.name : null;
                                        if (currentChannelName && currentChannelName.startsWith("v")) {
                                            resolve(member);
                                        } else {
                                            reject(`User "${username}" is not in a private voice channel.`);
                                            runCMD(`/tellraw ${requester} {"rawtext":[{"text":"§8[§9VC Error§8] §6You are not in: ${values[1]}, you are not able to invite members to this channel."}]}`);
                                        }
                                    } else {
                                        reject(`User "${username}" not found.`);
                                    }
                                })
                                .catch(reject);
                        });
                    }
                    function fetchSingleMember(username: string) {
                        return new Promise((resolve, reject) => {
                            guild.members
                                .fetch({ query: username, limit: 1 })
                                .then((fetchedMembers) => {
                                    const member = fetchedMembers.first();
                                    if (member) {
                                        resolve(member);
                                    } else {
                                        reject(`User "${username}" not found.`);
                                    }
                                })
                                .catch(reject);
                        });
                    }
                    fetchSingleMemberAndCheck(requester)
                        .then((user: GuildMember) => {
                            runCMD(`/tellraw ${requester} {"rawtext":[{"text":"§8[§9VC§8] §2You have invited ${memberToBeInvited[0]} to : ${values[1]}."}]}`);
                            fetchSingleMember(memberToBeInvited[0])
                                .then((member: GuildMember) => {
                                    const UserID = member.user.id.toString();
                                    //@ts-ignore
                                    channelToBeInvitedTo.permissionOverwrites
                                        .edit(
                                            UserID,
                                            // Permission overwrite for the member
                                            {
                                                Connect: true,
                                                ViewChannel: true,
                                                UseVAD: true,
                                                Speak: true,
                                            }
                                        )
                                        .then(() => {
                                            // Move the member
                                            member.voice.setChannel(channelToBeInvitedTo.id);
                                            member.voice.setMute(false);
                                            member.voice.setDeaf(false);
                                            //If the name is the same ingame as well as in discord a message will be sent to the invitee
                                            runCMD(`/tellraw ${memberToBeInvited[0]} {"rawtext":[{"text":"§8[§9VC§8] §2You have joined: ${values[1]}"}]}`);
                                            runCMD(`/tellraw ${requester} {"rawtext":[{"text":"§8[§9VC§8] §2${memberToBeInvited[0]} has Joined."}]}`);
                                        })
                                        .catch((error: any) => {
                                            console.error(`Error updating permissions: ${error}`);
                                        });
                                })
                                .catch((error) => {
                                    console.error(error);
                                });
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                }
                break;
            }
            case "chat": {
                let requester: string;
                if (packet.message.includes(config.voiceChannelCommandPrefix + "invite")) {
                    requester = packet.source_name;
                    const guild = targetGuild;
                    //Get the channel name and members
                    const values = packet.message.split(" ");
                    const channelName = "v" + values[1];
                    // Extract the members starting from index 2
                    const memberToBeInvited = values.slice(2);
                    const channelToBeInvitedTo: Channel = guild.channels.cache.find((ch: Channel) => ch.type === ChannelType.GuildVoice && ch.name === channelName);
                    //Get the Requesters User object in discord.
                    function fetchSingleMemberAndCheck(username: string) {
                        return new Promise((resolve, reject) => {
                            guild.members
                                .fetch({ query: username, limit: 1 })
                                .then((fetchedMembers) => {
                                    const member = fetchedMembers.first();
                                    if (member) {
                                        const currentChannelName = member.voice.channel ? member.voice.channel.name : null;
                                        if (currentChannelName && currentChannelName.startsWith("v")) {
                                            resolve(member);
                                        } else {
                                            reject(`User "${username}" is not in a private voice channel.`);
                                            runCMD(`/tellraw ${requester} {"rawtext":[{"text":"§8[§9VC Error§8] §6You are not in: ${values[1]}, you are not able to invite members to this channel."}]}`);
                                        }
                                    } else {
                                        reject(`User "${username}" not found.`);
                                    }
                                })
                                .catch(reject);
                        });
                    }
                    function fetchSingleMember(username: string) {
                        return new Promise((resolve, reject) => {
                            guild.members
                                .fetch({ query: username, limit: 1 })
                                .then((fetchedMembers) => {
                                    const member = fetchedMembers.first();
                                    if (member) {
                                        resolve(member);
                                    } else {
                                        reject(`User "${username}" not found.`);
                                    }
                                })
                                .catch(reject);
                        });
                    }
                    fetchSingleMemberAndCheck(requester)
                        .then((user: GuildMember) => {
                            runCMD(`/tellraw ${requester} {"rawtext":[{"text":"§8[§9VC§8] §2You have invited ${memberToBeInvited[0]} to : ${values[1]}."}]}`);
                            fetchSingleMember(memberToBeInvited[0])
                                .then((member: GuildMember) => {
                                    const UserID = member.user.id.toString();
                                    //@ts-ignore
                                    channelToBeInvitedTo.permissionOverwrites
                                        .edit(
                                            UserID,
                                            // Permission overwrite for the member
                                            {
                                                Connect: true,
                                                ViewChannel: true,
                                                UseVAD: true,
                                                Speak: true,
                                            }
                                        )
                                        .then(() => {
                                            // Move the member
                                            member.voice.setChannel(channelToBeInvitedTo.id);
                                            member.voice.setMute(false);
                                            member.voice.setDeaf(false);
                                            //If the name is the same ingame as well as in discord a message will be sent to the invitee
                                            runCMD(`/tellraw ${memberToBeInvited[0]} {"rawtext":[{"text":"§8[§9VC§8] §2You have joined: ${values[1]}"}]}`);
                                            runCMD(`/tellraw ${requester} {"rawtext":[{"text":"§8[§9VC§8] §2${memberToBeInvited[0]} has Joined."}]}`);
                                        })
                                        .catch((error: any) => {
                                            console.error(`Error updating permissions: ${error}`);
                                        });
                                })
                                .catch((error) => {
                                    console.error(error);
                                });
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                    break;
                }
            }
        }
    });
    function runCMD(cmd: string) {
        bot.queue("command_request", {
            command: cmd,
            origin: {
                type: "player",
                uuid: "",
                request_id: "",
            },
            internal: false,
            version: 52,
        });
    }
}
