//const { RichEmbed } = require('discord.js');

function codeMessage(content, language, userName, maxLength = 2000) {

    const userLength = userName.length + 3; //@username,\n

    let lenght = maxLength = maxLength - userLength - language.length - 7; //6` + 1\n

    const blocks = [];

    let first = true;
    let block = 0;
    let i = 0;
    while (i < content.length - lenght) {

        block = content.substring(i, i + lenght);

        let l = block.lastIndexOf('\n');
        if (i >= 0) {
            block = content.substring(i, i + l);
            i += l;
        } else i += lenght;

        const text = '```' + language + '\n' + block + '```';
        blocks.push(text);

        if (first) {
            lenght += userName.length;
            first = false;
        }
    }

    block = content.substring(i, i + lenght);
    const text = '```' + language + '\n' + block + '```';
    blocks.push(text);

    return blocks;
}

module.exports = {
    codeMessage
};