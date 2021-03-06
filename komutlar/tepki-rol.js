const Discord = require("discord.js")
const db = require('wio.db')

module.exports.run = async(client,message,args)=> {
  if (!message.guild.me.hasPermission("MANAGE_ROLES"))
    return message.reply(
      "Rol verme yetkim yok"
    ); 
  if (!message.member.hasPermission("MANAGE_ROLES"))
    return message.reply("Yetkin bulunmuyor");
  
  let prompts = [
    "Hangi **rol**'ü vermemi istersin'? (id yada etiketle)",
    "Hangi **emoji**'ye tıklayarak rol almalılar'?(Emojiyi Sohbete atın)",
    "Yazı olarak ne yazayım?",
    "Bunu nereye atayım? Id/kanal etiketle"
  ];
  let roles = await getResponses(message);
  let embed = new Discord.MessageEmbed()
    .setColor("BLUE")
    .setDescription(
      `\`Rol:\`<@&${roles.role}>\n\`Emoji:\`${roles.emoji}\n\`Yazı:\`${roles.text}\n\`Kanal\`${roles.channel}`
    );
  let msg = await message.channel.send("Onaylıyormusun?", embed);
  await msg.react("✅");
  await msg.react("❌");
  let filter = (reaction, user) =>
    ["✅", "❌"].includes(reaction.emoji.name) &&
    !user.bot &&
    user.id === message.author.id;
  let reactions = await msg.awaitReactions(filter, {
    max: 1,
    time: 60000,
    errors: ["time"]
  });
  let choice = reactions.get("✅") || reactions.get("❌");
  if (choice.emoji.name === "✅") {
    roles.channel.send(roles.text || `Bu rolü almak için emojiye bas :  <@&${roles.role}>`).then(msg => {
      msg.react(roles.emoji);
        function random(length) {
    let string =
      "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
    let secret = "";
    for (let i = length; i > 0; i--) {
      const random = Math.floor(Math.random() * string.length);
      const char = string.charAt(random);
      string = string.replace(char, "");
      secret += char;
    }
    return secret;
  }
  let string = random(24);
      roles.id = string
      roles.msg = msg.id
      roles.url = msg.url
      db.set(`rolereactions_${message.guild.id}_${msg.id}`, roles);
    });
  } else if (choice.emoji.name === "❌") {
    message.channel.send("Komutu iptal ettiniz.");
  }
  async function getResponses(message) {
    let settings = {};
    for (let i = 0; i < prompts.length; i++) {
      await message.channel.send(prompts[i]);
      let response = await message.channel.awaitMessages(
        m => m.author.id === message.author.id,
        { max: 1 }
      );
      let { content } = response.first();
      if (i === 0) {
        try {
          let role =
            response.first().mentions.roles.first() ||
            message.guild.roles.cache.get(args[0]);
          settings.role = role.id;
        } catch (err) {
          throw new Error("invalid role")
          message.reply(
            "Rol bulunmadı."
          );
        }
      } else if (i === 1) {
        let emoji = content;
        function isCustomEmoji(emoji) {
          return emoji.split(":").length == 1 ? false : true;
        }
        if (isCustomEmoji(emoji)){
           throw new Error("invalid emoji")
          return message.reply(
            "emojiyi bulamıyorum."
          );
        }else{
        settings.emoji = emoji;
        }
      } else if (i === 2) {
        if (content === "--geç") {
          settings.text = "";
        } else {
          settings.text = content;
        }
      } else if (i === 3) {
        let channel =
          response.first().mentions.channels.first() ||
          message.guild.channels.cache.get(r => r.name === content) ||
          message.guild.channels.cache.get(content) ||
          message.channel;
        let channel1 = message.guild.channels.cache.get(channel.id);
        let channel2 = message.guild.channels.cache.get(message.channel.id);
        if (
          !channel1
            .permissionsFor(message.author)
            .toArray()
            .includes("SEND_MESSAGES")
        ) {
          settings.channel = channel2;
        } else if (
          !channel1
            .permissionsFor(message.guild.me)
            .toArray()
            .includes("SEND_MESSAGES")
        ) {
          settings.channel = channel2;
        } else {
          settings.channel = channel1;
        }
      }
    }
    return settings;
  }
};
exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ['tepki-rol','relacitonrole','relaciton-role'],
  permLevel: 0
};

exports.help = {
  name: 'tepkirol'
};