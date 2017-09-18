/**
 * Created by Pointless on 15/07/17.
 */
import {DiscordThingy} from 'discordthingy';
import * as config from './config';

const thing = new DiscordThingy();
thing
    .login(config.token)
    .setOwner(config.owner)
    .setLogChannel(config.logChannel)
    .addCommandDirectory('./commands');

process.on('unhandledRejection', err => {
  console.error(err.stack || err);
});
