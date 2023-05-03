const fs = require('fs')
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'))
const uuid = require('uuid');
const { Client, GatewayIntentBits, EmbedBuilder} = require('discord.js')
const { MessageContent, GuildMessages, Guilds, } = GatewayIntentBits

let channel = config.channel
const token = config.token
let paradoxChannel = config.paradoxLogsChannel
var paradoxLogs = config.ParadoxEnabled
const correction = {
        "§r§4[§6Paradox§4]§r": "Paradox",
        "§4[§6Paradox§4]": "Paradox",
        "§r": "",
        "§6": "",
        "§4": ""
      };

//Device OS ids to be converted to more friendly names
var DeviceOS;

// create new discord client that can see what servers the bot is in, as well as the messages in those servers
const client = new Client({ intents: [Guilds, GuildMessages, MessageContent] })
client.login(token)

// load Bedrock-Protocol
const bedrock = require('bedrock-protocol');
let options
console.log("ThirdEye v1.0.0");
// bot options
if(config.isRealm){
    //Handel the realm config here!
    console.log("Connecting to a realm");
    options = {
        realms: {
            realmInvite: config.realmInviteCode
            
          }
    }
}
else{
    console.log("Connecting to a server");
    options = {
        host: config.ip,
        port: config.port,
        username: config.username,   
        offline: config.AuthType 
    }
}
// join server
const bot = bedrock.createClient(options)
bot.on('spawn', () => {
  console.log(`Bedrock bot logged in as ${bot.username}`)
})

// when discord client is ready, send login message
client.once('ready', (c) => {
  console.log(`Discord bot logged in as ${c.user.tag}`)
  channel = client.channels.cache.get(channel)
  if(paradoxLogs === true){
    paradoxChannel = client.channels.cache.get(paradoxChannel)
  }
  
  if (!channel) {
    console.log(`I could not find the channel (${config.channel})!`)
    process.exit(1)
  }
  if(!paradoxChannel){
  console.log(`I could not find the channel (${config.paradoxLogsChannel})!`)
  process.exit(1)
  }
})

client.on('messageCreate', (message) => {
    if(message.author.bot === true){
        /**This check will prevent a loop back mesasge. 
         * If the incoming message is from a bot it will ingore it.
         */
    }else{
        //!!!!!!!!!!!!Must remove this before release!!!!!!!!!!!!!!!!!!!
        if(message.content.includes("!unban")){
            bot.queue('text', {
                type: 'chat', needs_translation: false, source_name: bot.username, xuid: '', platform_chat_id: '',
                message: `${message.content}`
              })

        }
        //We will then send a command to the server to trigger the message sent in discord.
        const cmd = `/tellraw @a {"rawtext":[{"text":"§8[§9Discord§8] §7${message.author.username}: §f${message.content}"}]}`
         bot.queue('command_request', {
            command: cmd,
            origin: {
            type: 'player',
            uuid: '',
            request_id: '',
    },
    internal: false,
          version: 52,
  })

    }
 
})

//Send connecting players device os to discord.
bot.on('add_player', (packet) => { 
    switch(packet.device_os){
        case "Win10":
            DeviceOS = "Windows PC";
            break;
        case "iOS":
            DeviceOS = "Apple Device";
            break;
        case "Nintendo":
            DeviceOS = "Nintendo Switch";  
            break;
        case "Android":
        DeviceOS = "Android"; 
        break;
        // just send default
        default: 
        DeviceOS = packet.device_os;
        console.log("DeviceOS defaulted to packet.device_os");

    }
     
    if(config.useEmbed === true){
        const msgEmbed = new EmbedBuilder()
        .setColor(config.setColor)
        .setTitle(config.setTitle)
        .setDescription('[In Game] '+ packet.username +': Has joined the server using ' + DeviceOS)
        channel.send({ embeds: [msgEmbed] });
}else{
   channel.send(`[In Game] **${packet.username}** Has joined the server using ${DeviceOS}`);
}
 })


//Redirect in-game messages to Discord channel
bot.on('text', (packet) => { 
    //Check to see if packet is a json_whisper
    if(packet.type === "json_whisper")
    {
        const msg = packet.message;
        var obj = JSON.parse(msg)
        if (obj.rawtext[0].text.includes("Discord")){
            //dont send the message otherwise it will loop 
            return;
    }
    //check for paradox messages now these could be sent to a diffrent channel if required.
    if(paradoxLogs === true){
        if (obj.rawtext[0].text.startsWith("§r§4[§6Paradox§4]§r")){
            var paradoxMsg = obj.rawtext[0].text
            const correctedText = autoCorrect(paradoxMsg, correction);
            if(config.useEmbed === true){
                const msgEmbed = new EmbedBuilder()
                .setColor(config.setColor)
                .setTitle(config.setTitle)
                .setDescription('[In Game] '+ correctedText)
                paradoxChannel.send({ embeds: [msgEmbed] });
                return;
            }else{
                paradoxChannel.send(`[In Game] Paradox: ${paradoxMsg}`);
                return;
            }
            
        } 
    }
    if (obj.rawtext[0].text.startsWith("§r§4[§6Paradox§4]§r")){
        var paradoxMsg = obj.rawtext[0].text.replace("§r§4[§6Paradox§4]§r","");
        if(config.useEmbed === true){
            const msgEmbed = new EmbedBuilder()
            .setColor(config.setColor)
            .setTitle(config.setTitle)
            .setDescription('[In Game] '+ "Paradox" +': ' + paradoxMsg)
            channel.send({ embeds: [msgEmbed] });
            return;
        }else{
            channel.send(`[In Game] Paradox: ${paradoxMsg}`);
            return;
        }
        
    } 
    //test
    // this is required by can be worked on 
    //Check to see if player message is using a chat rank system. where the message maybe a json_whisper.
        const pattern = /§7(.+?): (.+)/;
        var matches = pattern.exec(obj.rawtext[0].text);
        const Playername = matches[1]
        const PlayersMessage = matches[2].replace("§r","");
        if(config.useEmbed === true){
            const msgEmbed = new EmbedBuilder()
            .setColor(config.setColor)
            .setTitle(config.setTitle)
            .setDescription('[In Game] '+ Playername +': ' + PlayersMessage)
            channel.send({ embeds: [msgEmbed] });
            return;
        }else{
            channel.send(`[In Game] **${Playername}**: ${PlayersMessage}`)
            return;
        }


}
//Normal chat message no formatting required.
        if(packet.source_name === bot.username){
            /**If the chat system using json the source_name will be undefind 
             * if this is a normal chat packet the the user name will be in that 
             * field and if so if it is the bot we dont want to cause a loop.
            */

        }else{
            if(packet.message.includes("§e%multiplayer.player.joined")){
                // we dont want to duplicate the join message as this is handled in the add_player packet. 
                return;
            }
            //Check for player leaving and report thi back to discord.
            if(packet.message.includes("§e%multiplayer.player.left")){
                if(config.useEmbed === true){
                    var msg = packet.parameters+ ": Has left the server."
                    var username="Server"
                    const msgEmbed = new EmbedBuilder()
        .setColor(config.setColor)
        .setTitle(config.setTitle)
        .setDescription('[In Game] '+ username +': '+msg)
        channel.send({ embeds: [msgEmbed] });
        return;
           }else{
               channel.send(`[In Game] **${username}**: ${msg}`)
               return;
           } 
            }
             //Check for players sleeping.
             if(packet.message.includes("chat.type.sleeping")){
                if(config.useEmbed === true){
                    var msg = packet.parameters+ ": Is sleeping through the night."
                    var username="Server"
                    const msgEmbed = new EmbedBuilder()
        .setColor(config.setColor)
        .setTitle(config.setTitle)
        .setDescription('[In Game] '+ username +': '+msg)
        channel.send({ embeds: [msgEmbed] });
        return;
           }else{
               channel.send(`[In Game] **${username}**: ${msg}`)
               return;
           } 
            }
            //This is checking for operator commands this can be logged at a later date but for the time being we wont log it. 
            if(packet.message.includes('{"translate":"commands')){
                return;
            }

            if(packet.message.includes("death")){
              let playername;
              let reason;
              playername = packet.parameters[0];
              reason = packet.parameters[1];
            // General death messages
               
            if(packet.message.includes("death.attack.mob")||(packet.message.includes("death.attack.arrow"))){
              switch(reason){
                case "%entity.zombie.name":
                    reason ="was killed by a Zombie"
                    break;
                case "%entity.skeleton.name":
                    reason = "was killed by a Skeletons Arrow"
                case "%entity.spider.name":
                    reason = "was killed by a Spider"
                case "%entity.enderman.name":
                    reason = "was killed by a Enderman"   
                    break;
                case "%entity.zombie_pigman.name":
                    reason = "was killed by a Zombie Pigman"
                    break;
                case "%entity.iron_golem.name":
                    reason = "was killed by an Iron Golem"
                    break;
                case "%entity.piglin_brute.name":
                    reason = "was killed by a Piglin Brute."
                    break;
                case "%entity.piglin.name":
                    reason = "was killed by a Piglin" 
                    break;
                case "%entity.wither_skeleton.name":
                reason = "was killed by a Wither Skeleton"
                break;       
                
                default:
                    reason = "Was Killed." +"  ---  " + packet.message + " ----  " + packet.parameters;   

              }
            } else{
                switch(packet.message){
            
                    case "death.attack.inWall":
                        reason ="Suffocated to death!"
                        break;
                    case "death.attack.explosion.player":
                    reason = "Was Blown to bits by an explosion"
                    break;
                    case "death.attack.onFire":
                    reason = "Went up in flames!"
                    break;
                    case "death.attack.player":
                        reason = "Was killed by " + packet.parameters[1];
                        break;

                    default:
                        reason = "General Death" +"  ---  "  + packet.message + " ----  " + packet.parameters;  
                        break;    
    
                  }
            }

                if(config.useEmbed === true){
                    const msgEmbed = new EmbedBuilder()
                    .setColor(config.setColor)
                    .setTitle(config.setTitle)
                    .setDescription('[In Game] '+ playername + ": " + reason )
                    channel.send({ embeds: [msgEmbed] });
                    return;
           }else{
               channel.send(`[In Game] **${playername}**: ${reason}`)
               return;
           }

            }
            



            //Just send the packet to discord at this point we dont need to check for anything.
            if(config.useEmbed === true){
                const msgEmbed = new EmbedBuilder()
                .setColor(config.setColor)
                .setTitle(config.setTitle)
                .setDescription('[In Game] '+ packet.source_name +': '+packet.message)
                channel.send({ embeds: [msgEmbed] });
       }else{
           channel.send(`[In Game] **${packet.source_name}**: ${packet.message}`)
       }
        }
        
    

})



 function autoCorrect(text, correction) {
    const reg = new RegExp(Object.keys(correction).join("|"), "g");
    return text.replace(reg, (matched) => correction[matched]);
  }
  