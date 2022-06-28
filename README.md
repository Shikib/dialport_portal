# DialPort

## Overview

The DialPort Portal is a platform for interactive evaluation of dialog systems. The infrastructure provided in this repository facilitates simultaneous evaluation of multiple dialog systems through a web-based user interface. Concretely, this repository consists of two primary components the frontend (`dialport_frontend`) and the backend (`dialport_backend`). 

## Setup

The instructions described here are for a Linux-based OS. However, these instructions are likely to be appropriate for any system that has `npm` and `pip`.

### Frontend

To install the dependencies for the DialPort frontend. 

```
cd dialport_frontend
npm install
```

This has been tested with `nodejs v10.19.0` and `npm 6.14.4`, but is expected to work with newer (or slightly older) versions as well.

### Backend

The backend has been tested with Python 3.9.7, however it is expected to work with any version of Python. The only dependency that needs to be installed is Tornado (https://www.tornadoweb.org/en/stable/), which can be installed with `python -m pip install tornado`.

If you want to run the DialoGPT example, you also need to install Transformers (4.18.0) and PyTorch (1.11.0). We direct you to the PyTorch documentation (https://pytorch.org/get-started/locally/) for instructions pertaining to installation of PyTorch.

## Deployment

Once all of the dependencies are installed, there are four steps necessary for running the DialPort Portal. To run the Portal, it is necessary to have an internet-facing server (i.e., at least some ports should be query-able from the internet).

1. Run the logging server. This receives a log of all actions taken from both the frontend and backend, including all utterances sent by the user/system and all feedback, and writes them to a file.

```
cd dialport_backend
python log_server.py
```

Take note of the URL of the server and the port that the log server is running (e.g., `http://schema.lti.cs.cmu.edu:8000/`). This URL should be modified in the code in two places: (1) [the frontend](https://github.com/Shikib/dialport_portal/blob/95179894d77660f239a6b314443490a68b88c8e7/portal_frontend/src/App.js#L14) and (2) [the backend](https://github.com/Shikib/dialport_portal/blob/95179894d77660f239a6b314443490a68b88c8e7/portal_backend/backend.py#L17). 

2. Run the example dialog system

You may opt to use either the simple example which always responds by reversing the user utterance or the DialoGPT example. For the simple example:

```
cd dialport_backend
python example_simple.py
```

Take note of the URL for this process (e.g., `http://schema.lti.cs.cmu.edu:8890/`). The [systems.txt file](https://github.com/Shikib/dialport_portal/blob/main/portal_backend/systems.txt) consists of a list of system URLs that the DialPort portal should simultaneously evaluate. As such, in order to serve your example system, the aforementioned URL should be added to this file. URLs for all other systems (following a similar structure to the examples) can be added to this file as well.

3. Run the Portal backend.

```
cd dialport_backend
python backend.py
```

Take note of the URL for this process (e.g., `http://schema.lti.cs.cmu.edu:8888`). This URL should be modified [here](https://github.com/Shikib/dialport_portal/blob/95179894d77660f239a6b314443490a68b88c8e7/portal_frontend/src/App.js#L13).

4. Finally, run the DialPort frontend

```
cd dialport_frontend
npm start
```

This process will run on port 3000 and can be accessed by navigating to [server public ip address]:3000 in a browser.

## Logging

All user/system actions will be logged to `dialport_backend/log.txt`. Example log:

```
{"userID":1656426384341,"text":"User consented","webTimeStamp":"2022-06-28T10-26-26.188","expState":3}
{"userID":1656426384341,"text":"User sent: hey","webTimeStamp":"2022-06-28T10-26-27.306","expState":3}
{"userID": 1656426384341, "text": "User sent: hey", "webTimeStamp": "2022-06-28T10-26-27.000"}
{"userID": 1656426384341, "text": "User received: Hey, you.", "webTimeStamp": "2022-06-28T10-26-27.000"}
{"userID":1656426384341,"text":"User Disliked","webTimeStamp":"2022-06-28T10-32-00.001","expState":3}
{"userID":1656426384341,"text":"User correction: Hey, you!","webTimeStamp":"2022-06-28T10-32-04.005","expState":3}
```
