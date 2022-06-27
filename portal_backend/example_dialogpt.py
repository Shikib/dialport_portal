import tornado.ioloop
import tornado.web
import json
import torch

from transformers import AutoModelForCausalLM, AutoTokenizer

histories = {}

# Load DialoGPT from HuggingFace
tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-large")
model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-large")

def reply(history):
  # Process utterances in the dialog history
  processed_history = [] 
  for utt in history:
    processed_history.append(utt.strip() + " " + tokenizer.eos_token)
  processed_history = " ".join(processed_history)

  # Encode utterance IDs using the model-specific tokenizer
  ids = tokenizer.encode(processed_history, return_tensors='pt')

  # Generate response with DialoGPT
  chat_history_ids = model.generate(ids, max_length=1000, pad_token_id=tokenizer.eos_token_id)

  # Decode the generate response into natural language
  return tokenizer.decode(chat_history_ids[:, ids.shape[-1]:][0], skip_special_tokens=True)

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
  app.listen(8890)
  tornado.ioloop.IOLoop.current().start()


