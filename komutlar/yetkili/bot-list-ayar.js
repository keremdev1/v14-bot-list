const { EmbedBuilder, PermissionFlagsBits, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const { prefix, color } = require("../../ayarlar.js")
const db = require("croxydb")
exports.run = async (client, message, args) => {
    if(!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return await message.reply(`Bu Komutu Kullanmak İçin **\`Yönetici\`** İznine Sahip Olmalısın`)
    }
    const dbkey = db.get(`${message.guild.id}_botlist`);
    const { ytrol, log, kanal } = dbkey || {}
    const embed = new EmbedBuilder()
        .setAuthor({ name: `${client.user.username} - Bot List Ayar`, iconURL: `${client.user.avatarURL()}` })
        .setFields(
            { name: `Onay Red Kanalı`, value: `Bu Menü Sayesinde Onay Red Kanalını Ayarlarsınız. (${kanal ? `<#${kanal}>` : `**Kanal Ayarlanmamış**`})` },
            { name: `Bot Log Kanalı`, value: `Bu Menü Sayesinde Bot Log Kanalını Ayarlarısınz. (${log ? `<#${log}>` : `**Kanal Ayarlanmamış**`})` },
            { name: `Bot List Yetkili Rol`, value: `Bu Menü Sayesinde Bot List Yetkili RolÜünü Ayarlarsınız. (${ytrol ? `<@&${ytrol}>` : `**Rol Ayarlanmamış**`})` },
            { name: `Bot List Başlat`, value: `Bu Buton Sayesinde Bot List Sistemini Başlatırsınız` },
            { name: `Bot List Sıfırla`, value: `Bot List Ayarlarını Sıfırlar` },
        )
        .setColor(color)
        .setFooter({ text: `Sorgulayan ${message.author.username}`, iconURL: message.author.avatarURL() })
    const onay_red_kanal = new ChannelSelectMenuBuilder()
    .setChannelTypes(ChannelType.GuildAnnouncement, ChannelType.GuildText)
    .setCustomId("onay_red")
    .setMaxValues(1)
    .setMinValues(1)
    .setPlaceholder("Onay Red Kanalı")
    if(kanal) onay_red_kanal.setDefaultChannels(kanal)
    const bot_log = new ChannelSelectMenuBuilder()
    .setChannelTypes(ChannelType.GuildAnnouncement, ChannelType.GuildText)
    .setCustomId("bot_log")
    .setMaxValues(1)
    .setMinValues(1)
    .setPlaceholder("Bot Log Kanalı")
    if(log) bot_log.setDefaultChannels(log)
    const ytrol_menu = new RoleSelectMenuBuilder()
    .setCustomId("ytrol_m")
    .setMaxValues(1)
    .setMinValues(1)
    .setPlaceholder("Bot List Yetkili Rol")
    if(ytrol) ytrol_menu.setDefaultRoles(ytrol)
    
    const buton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setCustomId("bot_list_başlat")
        .setLabel("Bot List Başlat")
        .setStyle(ButtonStyle.Success)
        .setDisabled(!kanal || !log || !ytrol)
        .setEmoji("<:baslat:1348334980236968067>"),
        new ButtonBuilder()
        .setCustomId("bot_list_sıfırla")
        .setLabel("Bot List Sıfırla")
        .setDisabled(!kanal || !log || !ytrol)
        .setStyle(ButtonStyle.Danger)
        .setEmoji("<:sifirla:1348421624311058506>"),
    )
    const row = new ActionRowBuilder().addComponents(onay_red_kanal)
    const row2 = new ActionRowBuilder().addComponents(bot_log)
    const row3 = new ActionRowBuilder().addComponents(ytrol_menu)
    await message.reply({ embeds: [embed], components: [row, row2, row3, buton]})
}
exports.conf = {
    aliases: ["botlistayar"]
}
exports.help = {
    name: "bot-list-ayar",
    description: 'Bot List Ayarlarını Yaparsınız.',
    kat: "yardım"
}