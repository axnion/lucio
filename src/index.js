const { Client  } = require('discord.js')
const config = require('./config.json')
const client = new Client()
const yt = require('ytdl-core');

/*
 * TODO
 * Add loop feature
 * Add logging for events
 * Add message feedback on events
 * Improve errorhandling
 */

const commands = {
  'join': (msg) => {
    return msg.member.voiceChannel.join()
      .then(connection => {
        play(connection, msg, "https://www.youtube.com/watch?v=yr7h_CTHc1k")
        return connection
      })
  },
  'leave': (msg) => {
    return msg.member.voiceChannel.leave()
  },
  'play': (msg) => {
    return commands.join(msg)
      .then(connection => {
        play(connection, msg, msg.content.slice(config.prefix.length).split(' ')[2])
      })
  },
  'loop': (msg) => {
    return commands.join(msg)
      .then(connection => {
        loop(connection, msg, msg.content.slice(config.prefix.length).split(' ')[2])
      })
  }
}

const play = (connection, msg, url) => {
  const dispatcher = connection.playStream(yt(url,{quality: 'highestaudio', highWaterMark: 1048576 }), {highWaterMark: 1})

  dispatcher.on('error', err => {
    console.log(err)
  })

  dispatcher.on('end', () => {
    console.log("Looping...")
  })

  // Add additional media controlls
  mediaControlls(msg.channel.createCollector(m => m), dispatcher)
}

const loop = (connection, msg, url) => {
  const dispatcher = connection.playStream(yt(url))

  dispatcher.on('error', err => {
    console.log(err)
  })

  dispatcher.on('end', () => {
    loop(connection, msg, url)
    console.log("Looping...")
  })

  // Add additional media controlls
  mediaControlls(msg.channel.createCollector(m => m), dispatcher)
}

const mediaControlls = (collector, dispatcher) => {
  collector.on('collect', m => {
    if(m.content.startsWith(`${config.prefix} pause`)) {
      dispatcher.pause()
    } else if(m.content.startsWith(`${config.prefix} resume`)) {
      console.log("resuming")
      dispatcher.resume()
    } else if(m.content.startsWith(`${config.prefix} stop`)) {
      dispatcher.end()
    } 
  })
}

client.on('ready', () => {
  console.log('ready!')
})

client.on('message', msg => {
  if (!msg.content.startsWith(config.prefix)) {
    return
  }

  if (!msg.member.hasPermission("ADMINISTRATOR") && config.adminOnly) {
    msg.channel.send(`Sorry ${msg.member.user.username}, but you are not cool enough to use this feature.`)
    return
  }

  reqCommand = msg.content.toLowerCase().slice(config.prefix.length).split(' ')[1]

  if(commands.hasOwnProperty(reqCommand)) {
    commands[reqCommand](msg)
  }
})

client.login(config.d_token)
