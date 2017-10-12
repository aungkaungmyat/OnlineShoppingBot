/*var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

// Server index page
app.get("/", function (req, res) {
  res.send("Deployed!");
});

// Facebook Webhook
// Used for verification
app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
    console.log("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Verification failed. The tokens do not match.");
    res.sendStatus(403);
  }
});

// All callbacks for Messenger will be POST-ed here
app.post("/webhook", function (req, res) {
    // Make sure this is a page subscription
    if (req.body.object == "page") {
      // Iterate over each entry
      // There may be multiple entries if batched
      req.body.entry.forEach(function(entry) {
        // Iterate over each messaging event
        entry.messaging.forEach(function(event) {
          if (event.postback) {
            processPostback(event);
          }
          if (event.message){
              processMessage(event);
          }
        });
      });
  
      res.sendStatus(200);
    }
  });
  
  function processPostback(event) {
    var senderId = event.sender.id;
    var payload = event.postback.payload;
  
    if (payload === "Greeting") {
      // Get user's first name from the User Profile API
      // and include it in the greeting
      request({
        url: "https://graph.facebook.com/v2.6/" + senderId,
        qs: {
          access_token: process.env.PAGE_ACCESS_TOKEN,
          fields: "first_name"
        },
        method: "GET"
      }, function(error, response, body) {
        var greeting = "";
        if (error) {
          console.log("Error getting user's name: " +  error);
        } else {
          var bodyObj = JSON.parse(body);
          name = bodyObj.first_name;
          greeting = "Hi " + name + ". ";
        }
        var message = greeting + "My name is SP Movie Bot. I can tell you various details regarding movies. What movie would you like to know about?";
        sendMessage(senderId, {text: message});
      });
    }
  }
  
  // sends message to user
  function sendMessage(recipientId, message) {
    request({
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
      method: "POST",
      json: {
        recipient: {id: recipientId},
        message: message,
      }
    }, function(error, response, body) {
      if (error) {
        console.log("Error's sending message: " + response.error);
      }
    });
  }


  // reply message to wait
  function processMessage(event){
    if (!event.message.is_echo) {
        var message = event.message;
        var senderId = event.sender.id;
    
        console.log("Received message from senderId: " + senderId);
        console.log("Message is: " + JSON.stringify(message));
    }
    else if (message.attachments) {
        sendMessage(senderId, {text: "Sorry, I don't understand your request."});
      }
  }*/

  'use strict'
  
  const express = require('express')
  const bodyParser = require('body-parser')
  const request = require('request')
  const app = express()
  
  app.set('port', (process.env.PORT || 5000))
  
  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({extended: false}))
  
  // parse application/json
  app.use(bodyParser.json())
  
  // index
  app.get('/', function (req, res) {
      res.send('hello world i am a secret bot')
  })
  
  // for facebook verification
  app.get('/webhook/', function (req, res) {
      if (req.query['hub.verify_token'] === process.env.VERIFICATION_TOKEN) {
          res.send(req.query['hub.challenge'])
      } else {
          res.send('Error, wrong token')
      }
  })
  
  // to post data
  app.post('/webhook/', function (req, res) {
      let messaging_events = req.body.entry[0].messaging
      for (let i = 0; i < messaging_events.length; i++) {
          let event = req.body.entry[0].messaging[i]
          let sender = event.sender.id
          if (event.message && event.message.text) {
              let text = event.message.text
              if (text === 'Generic'){ 
                  console.log("welcome to chatbot")
                  //sendGenericMessage(sender)
                  continue
              }
              sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
          }
          if (event.postback) {
              let text = JSON.stringify(event.postback)
              sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
              continue
          }
      }
      res.sendStatus(200)
  })
  
  
  // recommended to inject access tokens as environmental variables, e.g.
  // const token = process.env.FB_PAGE_ACCESS_TOKEN
  const token = "EAAHp9pDza0gBABa6b07ILhZCiIKTlYmVDVdzUgAY0NUPFEYRu8ZAesxgxpZBCt4ZC5P93ufOEPNpQLAjbbZAd2SrxMFg1pIV7dZCdsZB2IoGgHDOGwNPC9X1feXe5yUufzURSHGb9nH4lUUJWfrZCoBUeQVAuw7TyZAfDoU0bYkG9RwZDZD"
  
  function sendTextMessage(sender, text) {
      let messageData = { text:text }
      
      request({
          url: 'https://graph.facebook.com/v2.6/me/messages',
          qs: {access_token:token},
          method: 'POST',
          json: {
              recipient: {id:sender},
              message: messageData,
          }
      }, function(error, response, body) {
          if (error) {
              console.log('Error sending messages: ', error)
          } else if (response.body.error) {
              console.log('Error: ', response.body.error)
          }
      })
  }
  
  function sendGenericMessage(sender) {
      let messageData = {
          "attachment": {
              "type": "template",
              "payload": {
                  "template_type": "generic",
                  "elements": [{
                      "title": "First card",
                      "subtitle": "Element #1 of an hscroll",
                      "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                      "buttons": [{
                          "type": "web_url",
                          "url": "https://www.messenger.com",
                          "title": "web url"
                      }, {
                          "type": "postback",
                          "title": "Postback",
                          "payload": "Payload for first element in a generic bubble",
                      }],
                  }, {
                      "title": "Second card",
                      "subtitle": "Element #2 of an hscroll",
                      "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                      "buttons": [{
                          "type": "postback",
                          "title": "Postback",
                          "payload": "Payload for second element in a generic bubble",
                      }],
                  }]
              }
          }
      }
      request({
          url: 'https://graph.facebook.com/v2.6/me/messages',
          qs: {access_token:token},
          method: 'POST',
          json: {
              recipient: {id:sender},
              message: messageData,
          }
      }, function(error, response, body) {
          if (error) {
              console.log('Error sending messages: ', error)
          } else if (response.body.error) {
              console.log('Error: ', response.body.error)
          }
      })
  }
  
  // spin spin sugar
  app.listen(app.get('port'), function() {
      console.log('running on port', app.get('port'))
  })
  