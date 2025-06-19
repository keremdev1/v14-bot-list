const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { prefix, color } = require('../../ayarlar.js');

exports.run = async (client, message, args) => {
    const Komutlar = client.commands.filter(cmd => cmd.help.kat === "yardım");    
    let komutlarListesi = Komutlar.map(cmd => `:white_small_square: [**${prefix}${cmd.help.name}**](https://discord.gg/QcsCD5CEYM) **→** ${cmd.help.description}`).join("\n ");

    const embed = new EmbedBuilder()
        .setAuthor({ name: `${client.user.username} - Yardım`, iconURL: `${client.user.avatarURL()}` })
        .setColor(color)
        .setFooter({ text: `Sorgulayan ${message.author.username}`, iconURL: message.author.avatarURL() });

    if (komutlarListesi.length > 0) {
        embed.setDescription(komutlarListesi);
    } else {
        embed.setDescription("Şu anda yardım kategorisinde komut bulunmamaktadır.");
    }

    message.channel.send({ embeds: [embed] });
};

exports.conf = {
    aliases: ["help", "cmd", "h", "y"],
};

exports.help = {
    name: 'yardım',
    description: 'Botun Komutlarını Görürsünüz.',
    kat: "yardım"
};
