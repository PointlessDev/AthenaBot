/**
 * Created by Pointless on 19/07/17.
 */
import {Message, TextChannel} from 'discord.js';
import {Command, Arguments, Responder, DiscordThingy} from 'discordthingy';
import * as snekfetch from 'snekfetch';

const WIKIHOW_ENDPOINT = 'https://www.wikihow.com/api.php?action=query&list=search&format=json&srsearch=';

interface SnekResponse {
  body: any;
}

export default class SearchCommands {
  private responder: Responder;
  constructor(private thingy: DiscordThingy) {
    this.responder = thingy.responder;
  }

  @Command('wikihow')
  public async wikihow(message: Message, args: Arguments): Promise<any> {
    if(!args.contentFrom(1)) return this.responder.fail(message, 'No search provided');
    message.channel.startTyping();
    const encodedQuery = encodeURIComponent(args.contentFrom(1));

    snekfetch.get(WIKIHOW_ENDPOINT + encodedQuery).then((res: SnekResponse) => {
      const result = res.body.query.search[0];
      message.channel.stopTyping();
      if(!result) {
        return message.channel.send({
          embed: {
            color: 0xf44336,
            description: ':x: *No Results Found*',
            footer: {
              icon_url: 'http://www.wikihow.com/images/7/71/Wh-logo.jpg',
              text: `Results for search "${args.contentFrom(1)}"`
            }
          }
        })
            .then(() => message.delete())
            .catch(this.responder.rejection(message, `Adding "no results found" embed for wikihow search`));
      }else {
        const hitCount = parseInt(res.body.query.searchinfo.totalhits);
        message.channel.send({
          embed: {
            color: 0x93b874,
            description: result.snippet.replace(/<(?:.|\n)*?>/gm, ''), // Snippet contains html marking up matching words
            footer: {
              icon_url: 'http://www.wikihow.com/images/7/71/Wh-logo.jpg',
              text: `Result 1 of ${hitCount.toLocaleString()} | Results for search "${args.contentFrom(1)}"`
            },
            title: result.title,
            url: `https://www.wikihow.com/${result.title.replace(/\s/g, '-')}`
          }
        })
            .then(() => message.delete())
            .catch(this.responder.rejection(message, 'Adding embed'));
      }
    });
  }
}
