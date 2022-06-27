import tornado.ioloop
import tornado.web
import json

histories = {}

def reply(history):
  return ' '.join(history[-1].split()[::-1])

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
      histories[body["userID"]] = []
    else:
      histories[body["userID"]].append(body["text"])
      response = reply(histories[body["userID"]])
      histories[body["userID"]].append(response)
      self.write(json.dumps({"body": json.dumps({"utterance": response})}))

def make_app():
  return tornado.web.Application([
    (r"/", MainHandler),
  ])

if __name__ == "__main__":
  app = make_app()
  app.listen(8891)
  tornado.ioloop.IOLoop.current().start()
