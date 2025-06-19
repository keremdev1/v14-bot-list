const { Client, GatewayIntentBits, Partials, ButtonBuilder, ButtonComponent, ButtonStyle, ActionRowBuilder, PermissionsFlags, ModalBuilder, TextInputBuilder, TextInputStyle, Collection, AttachmentBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType, EmbedBuilder } = require("discord.js");
const fs = require("fs")
const ayarlar = require("./ayarlar.js");
const { prefix, color } = require("./ayarlar.js")
const db = require("croxydb")
const Discord = require("discord.js")
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.User,
        Partials.ThreadMember,
    ],
});

module.exports = client;

const { error } = require("console");

client.login(ayarlar.token)


client.on("messageCreate", async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    let command = message.content.toLocaleLowerCase().split(" ")[0].slice(prefix.length);
    let params = message.content.split(" ").slice(1);
    let cmd;
    if (client.commands.has(command)) {
        cmd = client.commands.get(command);
    } else if (client.aliases.has(command)) {
        cmd = client.commands.get(client.aliases.get(command));
    }
    if (cmd) {
        cmd.run(client, message, params)
    }
});

client.commands = new Collection();
client.aliases = new Collection();

client.on('ready', () => {

    client.user.setPresence({ activities: [{ name: 'CODE WORLD' }] });

    console.log(`Prefix: ${ayarlar.prefix}`);
    console.log(`Bot Aktif!`);
});

fs.readdir("./komutlar/kullanıcı", (err, files) => {
    if (err) console.error(err);
    files.forEach(f => {
        let props = require(`./komutlar/kullanıcı/${f}`);
        client.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });
})

fs.readdir("./komutlar/yetkili", (err, files) => {
    if (err) console.error(err);
    files.forEach(f => {
        let props = require(`./komutlar/yetkili/${f}`);
        client.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });
})

////////////////////////////////////////// MAİN COMMANDS ////////////////////////////////////////////

client.on("interactionCreate", async i => {
    if(i.customId === "onay_red") {
        if(i.message.mentions.members.first().id !== i.member.id) {
            return await i.reply({ content: "Bu Menüyü Sadece Kommutu Çağıran Kulllana Bilir", ephemeral: true })
        }
        await db.set(`${i.guild.id}_botlist.kanal`, i.values[0]);
        const dbkey = db.get(`${i.guild.id}_botlist`);
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
            .setFooter({ text: `Sorgulayan ${i.user.username}`, iconURL: i.user.avatarURL() })
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
        if(ytrol) ytrol_menu.setDefaultRoles(lytrolog)
        
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
        i.update({ embeds: [embed], components: [row, row2, row3, buton]})
    }
    if(i.customId === "bot_log") {
        if(i.message.mentions.members.first().id !== i.member.id) {
            return await i.reply({ content: "Bu Menüyü Sadece Kommutu Çağıran Kulllana Bilir", ephemeral: true })
        }
        await db.set(`${i.guild.id}_botlist.log`, i.values[0]);
        const dbkey = db.get(`${i.guild.id}_botlist`);
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
            .setFooter({ text: `Sorgulayan ${i.user.username}`, iconURL: i.user.avatarURL() })
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
        if(ytrol) ytrol_menu.setDefaultRoles(lytrolog)
        
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
        i.update({ embeds: [embed], components: [row, row2, row3, buton]})
    }
    if(i.customId === "ytrol_m") {
        if(i.message.mentions.members.first().id !== i.member.id) {
            return await i.reply({ content: "Bu Menüyü Sadece Kommutu Çağıran Kulllana Bilir", ephemeral: true })
        }
        await db.set(`${i.guild.id}_botlist.ytrol`, i.values[0]);
        const dbkey = db.get(`${i.guild.id}_botlist`);
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
            .setFooter({ text: `Sorgulayan ${i.user.username}`, iconURL: i.user.avatarURL() })
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
        i.update({ embeds: [embed], components: [row, row2, row3, buton]})
    }
    if(i.customId === "bot_list_sıfırla") {
        if(i.message.mentions.members.first().id !== i.member.id) {
            return await i.reply({ content: "Bu Butonu Sadece Kommutu Çağıran Kulllana Bilir", ephemeral: true })
        }
        await db.delete(`${i.guild.id}_botlist`);
        const dbkey = db.get(`${i.guild.id}_botlist`);
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
            .setFooter({ text: `Sorgulayan ${i.user.username}`, iconURL: i.user.avatarURL() })
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
        i.update({ embeds: [embed], components: [row, row2, row3, buton]})
    }
    if(i.customId === "bot_list_başlat") {
        if(i.message.mentions.members.first().id !== i.member.id) {
            return await i.reply({ content: "Bu Butonu Sadece Kommutu Çağıran Kulllana Bilir", ephemeral: true })
        }
        const dbkey = db.get(`${i.guild.id}_botlist`);
        const { ytrol, log, kanal } = dbkey || {}
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${i.guild.name} | Bot List`, iconURL: `${i.guild.iconURL()}` })
            .setTimestamp()
            .setDescription(`Bot Ekleme Başvuru Yapmak İçin Aşağıdaki **\`\`Başvuru Yap\`\`** Butonuna Tıklayabilirsiniz!`)
            .setColor(color)
            .setFooter({ text: `${i.guild.name} | Bot List`, iconURL: i.guild.iconURL() })
        const buton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setCustomId("bot_list_başvuru")
            .setLabel("Başvuru Yap")
            .setStyle(ButtonStyle.Success)
        )
        const kanal2 = await i.guild.channels.fetch(kanal)
        await kanal2.send({ embeds: [embed], components: [buton] })
        await i.reply({ content: `Sistem Başlatıldı!`, ephemeral: true })
    }
    if(i.customId === "bot_list_başvuru") {
        const modal = new ModalBuilder()
        .setCustomId("bot_list_b_modal")
        .setTitle("Bot List Başvurusu")

        const bot_id = new TextInputBuilder()
        .setCustomId("bot_id")
        .setLabel("Botun İD'sini Girin")
        .setRequired(true)
        .setStyle(TextInputStyle.Short)

        const bot_prefix = new TextInputBuilder()
        .setCustomId("bot_prefix")
        .setLabel("Botun Prefixinisini Girin")
        .setRequired(true)
        .setStyle(TextInputStyle.Short)

        const bot_onay = new TextInputBuilder()
        .setCustomId("bot_onay")
        .setLabel("Botunuz Top.gg de Onaylandımı ?")
        .setPlaceholder("Evet Veya Hayır")
        .setRequired(true)
        .setStyle(TextInputStyle.Short)

        const bot_hakkında = new TextInputBuilder()
        .setCustomId("bot_hakkında")
        .setLabel("Botunuz Hakkında Bize Bilgi Verin?")
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph)

        const row = new ActionRowBuilder().addComponents(bot_id)
        const row2 = new ActionRowBuilder().addComponents(bot_prefix)
        const row3 = new ActionRowBuilder().addComponents(bot_onay)
        const row4 = new ActionRowBuilder().addComponents(bot_hakkında)

        modal.setComponents(row, row2, row3, row4)

        await i.showModal(modal)
    }
    if(i.customId === "bot_list_b_modal") {
        const soru1 = i.fields.getTextInputValue("bot_id")
        const soru2 = i.fields.getTextInputValue("bot_prefix")
        const soru3 = i.fields.getTextInputValue("bot_onay")
        const soru4 = i.fields.getTextInputValue("bot_hakkında")

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${i.guild.name} | Bot List`, iconURL: `${i.guild.iconURL()}` })
            .setTimestamp()
            .setDescription(`Bot Başvurusu Yapan Kişi ${i.member}`)
            .setFields(
                { name: `Botun İD'si`, value: `**\`${soru1}\`**` },
                { name: `Botun Prefixsi`, value: `**\`${soru2}\`**` },
                { name: `Botun Top.gg de Onaylandımı ?`, value: `**\`${soru3}\`**` },
                { name: `Botunuz Hakkında Bize Bilgi Verin?`, value: `**\`${soru4}\`**` },
            )
            .setColor(color)
            .setFooter({ text: `${i.guild.name} | Bot List`, iconURL: i.guild.iconURL() })
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setCustomId(`bot_onay-${soru1}`)
            .setStyle(ButtonStyle.Success)
            .setEmoji("<:evet:1350151994492457021>"),
            new ButtonBuilder()
            .setCustomId(`bot_red-${soru1}`)
            .setStyle(ButtonStyle.Danger)
            .setEmoji("<:nono:1350155288774316155>")
        )
        const { log } = await db.get(`${i.guild.id}_botlist`)
        const log2 = await i.guild.channels.fetch(log)
        await log2.send({ embeds: [embed], components: [row], content: `${i.user}` })
        await db.set(`${i.user.id}_botları`, {
            soru1: {
                prefix: soru2,
                onay: soru3,
                bot_hakkında: soru4,
                durum: "onaylanmadı"
            }
        })
        await i.reply({ content: `Başvurunuz Alınmıştır!`, ephemeral: true })
    }
    if(i.customId.startsWith("bot_onay-")) {
        const bot_id = i.customId.split("bot_onay-")[1];
        const sahip = i.message.mentions.members.first()
        const { ytrol, kanal } = await db.get(`${i.guild.id}_botlist`)
        const ytrol2 = await i.guild.roles.fetch(ytrol)
        if(!i.member.roles.cache.has(ytrol)) {
            return await i.reply({ content: `Bu Butonu Kullanmak İçin **\`${ytrol2.name}\`** Rolüne İhtiyacınız Var`, ephemeral: true })
        }
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setCustomId(`bot_onay-${bot_id}`)
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
            .setEmoji("<:evet:1350151994492457021>"),
            new ButtonBuilder()
            .setLabel("Botu Ekle")
            .setStyle(ButtonStyle.Link)
            .setEmoji("<a:bot:1379223563902517328>")
            .setURL(`https://discord.com/oauth2/authorize?client_id=${bot_id}&permissions=8&scope=bot+applications.commands`)
        )
       await i.update({ components: [row] })
       const kanal2 = await i.guild.channels.fetch(kanal)
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${i.guild.name} | Bot List`, iconURL: `${i.guild.iconURL()}` })
            .setTimestamp()
            .setDescription(`${sahip} İsimli Kullanıcının Botu ${i.user} Tarafından Onaylandı!`)
            .setColor(color)
            .setFooter({ text: `${i.guild.name} | Bot List`, iconURL: i.guild.iconURL() })
        await kanal2.send({ embeds: [embed] })
    }
    if(i.customId.startsWith("bot_red-")) {
        const bot_id = i.customId.split("bot_red-")[1];
        const { ytrol, kanal } = await db.get(`${i.guild.id}_botlist`)
        const ytrol2 = await i.guild.roles.fetch(ytrol)
        if(!i.member.roles.cache.has(ytrol)) {
            return await i.reply({ content: `Bu Butonu Kullanmak İçin **\`${ytrol2.name}\`** Rolüne İhtiyacınız Var`, ephemeral: true })
        }
        const modal = new ModalBuilder()
        .setCustomId(`bot_red_modal-${i.message.mentions.members.first().id}-${bot_id}`)
        .setTitle("Bot Rer Sebebi")

        const red_bilgi = new TextInputBuilder()
        .setCustomId("red_bilgi")
        .setLabel("Botu Neden Reddetiğinizi Yazın")
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph)

        const row = new ActionRowBuilder().addComponents(red_bilgi)

        modal.setComponents(row)

        await i.showModal(modal)
    }
    if(i.customId.startsWith("bot_red_modal-")) {
    const [sahip_id, bot_id] = i.customId.split("bot_red_modal-")[1].split("-");
        const red_sebep = i.fields.getTextInputValue("red_bilgi")
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setCustomId("gıpsdgajmsd")
            .setDisabled(true)
            .setEmoji("<:nono:1350155288774316155>")
        )
       await i.update({ components: [row] })
        const { ytrol, kanal } = await db.get(`${i.guild.id}_botlist`)
       const kanal2 = await i.guild.channels.fetch(kanal)
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${i.guild.name} | Bot List`, iconURL: `${i.guild.iconURL()}` })
            .setTimestamp()
            .setDescription(`<@${sahip_id}> İsimli Kullanıcının Botu ${i.user} Tarafından Reddedildi! \n Sebebi = ${red_sebep}`)
            .setColor(color)
            .setFooter({ text: `${i.guild.name} | Bot List`, iconURL: i.guild.iconURL() })
        await db.delete(`${sahip_id}_botları.${bot_id}`)
        await kanal2.send({ embeds: [embed] })
    }
})