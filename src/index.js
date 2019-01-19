const { Client  } = require('discord.js')
const config = require('./config.json')
const client = new Client()
const yt = require('ytdl-core');

const commands = {
  'join': (msg) => {
    return msg.member.voiceChannel.join()
  },
  'leave': (msg) => {
    return msg.member.voiceChannel.leave()
  },
  'play': (msg) => {
    return commands.join(msg)
      .then(connection => {
        url = msg.content.slice(config.prefix.length).split(' ')[2]
        dispatcher = connection.playStream(yt(url))

        dispatcher.on('end', () => {
          console.log("Ended")
        })

        dispatcher.on('error', err => {
          console.log(err)
        })

        // Add additional media controlls
        mediaControlls(msg.channel.createCollector(m => m), dispatcher)
      })
  }
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

  reqCommand = msg.content.toLowerCase().slice(config.prefix.length).split(' ')[1]

  if(commands.hasOwnProperty(reqCommand)) {
    commands[reqCommand](msg)
  }
})

client.login(config.d_token)
