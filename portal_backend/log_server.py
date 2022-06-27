import random
import json
import os
import requests
import tornado.ioloop
import tornado.web

class MainHandler(tornado.web.RequestHandler):
  def set_default_headers(self):
    self.set_header("Access-Control-Allow-Origin", "*")
    self.set_header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
    self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

  def options(self):
    pass

  def post(self):
    print(str(self.request.body.decode()))
    open("log.txt", "a+").write(str(self.request.body.decode())+"\n")
    self.write("ok")

def make_app():
  return tornado.web.Application([
      (r"/data", MainHandler),
  ])
                                                                                
if __name__ == "__main__":
  app = make_app()
  app.listen(8000)
  tornado.ioloop.IOLoop.current().start()

