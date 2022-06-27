import tornado.ioloop
import tornado.web

import datetime
import json
import random
import requests

uid_to_system = {}

def log_state(uid, text):
  state = {
    "userID": uid,
    "text": text,
    "webTimeStamp": datetime.datetime.now().strftime("%Y-%m-%dT%H-%M-%S.000"),
  }
  data_url = "http://schema.lti.cs.cmu.edu:8000/data"
  requests.post(data_url, data=json.dumps(state))

class MainHandler(tornado.web.RequestHandler):
  def set_default_headers(self):
    self.set_header("Access-Control-Allow-Origin", "*")
    self.set_header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
    self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

  def options(self):
    pass

  def post(self):
    body = json.loads(self.request.body.decode())
    if body["text"] == "SSTTAARRTT":
      # Random choose system
      systems = [e.strip() for e in open("systems.txt").readlines()]
      system = random.choice(systems)
      print(system)
      
      # Make request
      requests.post(system, data = json.dumps(body))

      # Record userID to system mapping
      uid = body["userID"]
      uid_to_system[uid] = system
    else:
      uid = body["userID"]
      system = uid_to_system[uid]

      # Make request
      res = requests.post(system, data=json.dumps(body)).json()

      # Log
      log_state(uid, "User sent: " + body["text"])
      log_state(uid, "User received: " + json.loads(res['body'])['utterance'])

      # Send response to client
      self.write(json.dumps(res))

def make_app():
  return tornado.web.Application([
    (r"/", MainHandler),
  ])

if __name__ == "__main__":
  app = make_app()
  app.listen(8888)
  tornado.ioloop.IOLoop.current().start()
