var request = require('request')

const credentials = require('../config/auth.json')
const simpleQuotes = require('../config/simpleQuotes.json')
const placeholderQuotes = require('../config/placeholderQuotes.json')
const names = require('../config/names.json')

var appRouter = function (app) {
  app.get('/', function (req, res) {
    res.send('Hello World')
  })

  app.get('/api', function (req, res) {
    res.send('Use a fukin post')
  })

  app.post('/api', function (req, res) {
    if (!req.body.apitoken) {
      return res.send({'status': 'error', 'message': 'missing token'})
    } else {
      var tokenIsValid = false
      for (var i = 0; i < credentials.apiTokens.length; i++) {
        if (credentials.apiTokens[i] === req.body.apitoken) {
          tokenIsValid = true
        }
      }

      if (tokenIsValid) {
        var chat = req.body.chat
        if (!chat) {
          return res.send({'status': 'error', 'message': 'no chatid'})
        }
        if (req.body.quoteonly) {
          postToTelegram(getSlashQuote(), chat)
          return res.send({'status': 'ok'})
        }

        var msg = buildMessage(req.body.subject, req.body.body)
        postToTelegram(msg, chat)
        return res.send({'status': 'ok'})
      } else {
        return res.send({'status': 'error', 'message': 'invalid token'})
      }

      // !req.body.subject || !req.body.body
    }
  })
}

function postToTelegram (string, chatId, counter) {
  var token = credentials.telegramToken
  if (counter === undefined || counter === null) {
    counter = 0
  }
  counter++
  // eslint-disable-next-line
  request.post(
    'https://api.telegram.org/bot' + token + '/sendMessage',
    { json: { chat_id: chatId, text: string, parse_mode: 'HTML' } },
    function (error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log(body)
      } else {
        console.log('ERROR: ', body)
        if (counter >= 5) {
          postToTelegram(string, chatId, counter)
        } else {
          console.log('ERROR: Failed 5 times pls wai')
        }
      }
    }
  )
}

function buildMessage (subject, body) {
  if (subject === undefined || subject === null) {
    subject = '<pre>No subject</pre>'
  }
  if (body === undefined || body === null) {
    body = '<pre>No body</pre>'
  }

  var message = getSlashQuote()

  message += '\n\n\n'
  message += '<b>' + subject + '</b>\n'
  message += body

  return message
}

function getSlashQuote () {
  if (randomNumberFromRange(0, 9) >= 8) {
    return simpleQuotes[randomNumberFromRange(0, simpleQuotes.length - 1)]
  } else {
    var type = ''
    if (randomNumberFromRange(0, 1)) {
      type = 'good'
    } else {
      type = 'bad'
    }
    var q = placeholderQuotes[type][randomNumberFromRange(0, placeholderQuotes[type].length - 1)]
    return q.replace('$', names[type][randomNumberFromRange(0, names[type].length - 1)])
  }
}

function randomNumberFromRange (min, max) {
  // eslint-disable-next-line
  return Math.floor(Math.random()*(max-min+1)+min)
}

module.exports = appRouter
