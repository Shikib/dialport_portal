import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import {Modal, Toast, ButtonToolbar, Button, Form, Container, Row, Col} from 'react-bootstrap';

let AES = require("crypto-js/aes");
let moment = require("moment");


function App() {
   let userID = Date.now();
   let backendUrl = "http://schema.lti.cs.cmu.edu:8888/"
   let dataBackendUrl = "http://schema.lti.cs.cmu.edu:8000/data";

   let expState = Math.floor(Math.random() * 4);

   const getProfile = () => {
     const Http = new XMLHttpRequest();
     const url='https://api.ipstack.com/check?access_key=e03f2c31729b256754cd656b9cd2ee97';
     Http.open("GET", url);
     Http.send();
     
     Http.onreadystatechange = () => {
       if(Http.readyState === XMLHttpRequest.DONE && Http.status === 200) {
         let data = JSON.parse(Http.responseText);
         data['ip'] = AES.encrypt(data['ip'], 'dialrc').toString();
         userProfile = JSON.stringify(data, null, 2);

         return userProfile;
       }
     }
   }

   let userProfile = getProfile();
   function refreshPage() {
     userID = Date.now();
     init(userID, userProfile); 
     let utt = "Welcome to DialPort. You will be matched with a random conversational AI! Feel free to chat about anything. Please provide feedback to help assess and improve these systems.";
     document.getElementById("OutputMessage").innerHTML = utt;
     document.getElementsByClassName("DialogHolder")[0].style.fontSize = "30px";
     document.getElementById("History").innerHTML = "";

     document.getElementById("NewToast").style.visibility = "visible";
     setTimeout(function(){ 
       document.getElementById("NewToast").style.visibility = "hidden";
     }, 1000);

   }

   const init = (userID, userProfile) => {
    document.title = "DialPort";
     let state = {
       'userID': userID,
       'text': 'SSTTAARRTT',
       'userProfile': userProfile,
       'asr_test': 'typing',
       'webTimeStamp': moment().utcOffset(-4).format("YYYY-MM-DDTHH-mm-ss.SSS")
     };
     console.log(state);
     getResponse(state);
   }

   const getResponse = (state) => {
     const xhr = new XMLHttpRequest();
     xhr.open("POST", backendUrl, true);
     xhr.setRequestHeader("Content-type", "application/json");
     xhr.onreadystatechange = function () {
       if (xhr.readyState === 4 && xhr.status === 200) {
         console.log(xhr.responseText);
         try {
           let json = JSON.parse(xhr.responseText);
           console.log(json);
           processResponse(json);
         } catch {
         }
       }
     }
     xhr.send(JSON.stringify(state));
     logStateText("User sent: " + state['text']); 
   };

   const logState = (state) => {
     const xhr = new XMLHttpRequest();
     xhr.open("POST", dataBackendUrl, true);
     xhr.setRequestHeader("Content-type", "application/json");
     xhr.onreadystatechange = function () {
       if (xhr.readyState === 4 && xhr.status === 200) {
         console.log(xhr.responseText);
       }
     }
     xhr.send(JSON.stringify(state));
     console.log(JSON.stringify(state));
   };

   const logStateText = (text) => {
    let state = {
      "userID": userID,
      "text": text,
      "webTimeStamp": moment().utcOffset(-4).format("YYYY-MM-DDTHH-mm-ss.SSS"),
      "expState": expState
    };
    logState(state);
   }

   const processResponse = (state) => {
     let utts = state['body'].split('\n');
     console.log(utts);
     let utt = "";
     utts.forEach(function(e) {
       utt += JSON.parse(e)['utterance'].trim() + " ";
     });
     utt = utt.trim();

     if(utt.startsWith("My name is Skylar")) {
       utt = "Welcome to DialPort. You will be matched with a random conversational AI! Feel free to chat about anything. Please provide feedback to help assess and improve these systems.";
     }
                

     document.getElementById("OutputMessage").innerHTML = utt;
     //logStateText("User received: " + utt); 
     
     var isChrome = !!window.chrome;

     if(isChrome && !utt.startsWith("My name is Skylar")) {
       //ttsSpeak(utt);
     }

     // Hack to make it fit on screen
     if(utt.length > 300) {
       document.getElementsByClassName("DialogHolder")[0].style.fontSize = "30px"
     } else if(utt.length > 100) {
       document.getElementsByClassName("DialogHolder")[0].style.fontSize = "40px"
     } else {
       document.getElementsByClassName("DialogHolder")[0].style.fontSize = ""
     }

     window.scrollTo(0,document.body.scrollHeight);
   };

   init(userID, userProfile);

   const normalizeUtt = arg => {
     // replace name to normal spelling to ensure correct pronunciation
     var new_arg = arg.replace("Jasmin", "Jasmine");
     // replace ... (recommend nothing) to empty
     new_arg = new_arg.replace("...", "");
     new_arg = new_arg.replace("blank", ".blank");
     new_arg = new_arg.replace(/Ave([.,\s])/g, "Avenue$1");
     new_arg = new_arg.replace(/St([.,\s])/g, "Street$1");
     new_arg = new_arg.replace("@#@", "");
     return new_arg
   }


   const ttsSpeak = arg => {
    let max_tts_lens = 100;
    arg = arg.replace('"','')
    console.log(arg);
    if (!arg) {
      return;
    }
    var is_last = arg.indexOf("@#@") > -1;
    var new_arg = normalizeUtt(arg);
    if (new_arg.split(" ").length > max_tts_lens) {
      console.log("Cut super long utterance to 25 words");
      new_arg = new_arg.split(" ").slice(0, max_tts_lens).join(" ");
    }

    var speechReq = new XMLHttpRequest();
    speechReq.open("POST", "https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=AIzaSyBduyo2FJsQ81VhikzZNSXljUI3EY6_tlc");
    speechReq.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    var speechReqBody = "{" +
      '"input": {"text":"' + new_arg + '"},' +
      "'voice': {'languageCode':'en-US','name':'en-US-Wavenet-D'}," +
      "'audioConfig': {'audioEncoding':'LINEAR16', 'pitch': '-2.0', 'speakingRate': '0.9'}" +
      "}";
    speechReq.send(speechReqBody);
    speechReq.responseType = "json";

    speechReq.onload = function (event) {
      var timeSystemSpeech = window.setInterval(function () {
        // Wait for earlier sentences to be recorded before
        // the current one to preserve order.
        if (speechReq.response) {
          var obj = speechReq.response;
          var speech = new Audio("data:audio/wav;base64," + obj["audioContent"]);
          speech.onended = function (event) {
            console.log("TTS finished speaking");
            console.log("Is last flag: " + is_last);
            if (is_last) {
              // pause a little bit for the first one
            }
          };
          console.log("TTS started speaking");
          speech.play();
          // Send audio (base64 string or blob) to Audio Server
          window.clearInterval(timeSystemSpeech);
        }
      }, 50);
    };
  };

  const handleSubmit = event => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    let input = document.getElementById("InputMessage").value

    let state = {
      "userID": userID,
      "text": input,
      "asrConf": 1.0,
      "finalPauseMs": 0,
      "webTimeStamp": moment().utcOffset(-4).format("YYYY-MM-DDTHH-mm-ss.SSS")
    };

    getResponse(state);
    document.getElementById("InputMessage").value = "";
    document.getElementById("InputMessage").placeholder = "Type your message";
    document.getElementsByClassName("DialogHolder")[0].style.fontSize = ""

    var oldUtt = document.getElementById("OutputMessage").innerHTML;
    var history = document.getElementById("History");

    var e = document.createElement('p');
    e.setAttribute("class", "MessageHistory");
    e.innerHTML = "<span class='System'><em>System:</em></span> " + oldUtt;
    history.appendChild(e);

    var e = document.createElement('p');
    e.setAttribute("class", "MessageHistory");
    e.innerHTML = "<span class='User'><em>User:</em></span> " + input;
    history.appendChild(e);

    document.getElementById("OutputMessage").innerHTML = "<em>I'm thinking...</em>";
    window.scrollTo(0,document.body.scrollHeight);
  };

  const toggleShowLiked = () => {
    document.getElementById("LikedToast").style.visibility = "visible";
    setTimeout(function(){ 
      document.getElementById("LikedToast").style.visibility = "hidden";
    }, 1000);
    logStateText("User liked");
  };

  const toggleShowDisliked = () => {
    document.getElementById("DislikedToast").style.visibility = "visible";
    setTimeout(function(){ 
      document.getElementById("DislikedToast").style.visibility = "hidden";
    }, 1000);
    logStateText("User Disliked");
  };

  const modalFinished = () => {
    document.getElementsByClassName("modal")[2].remove();
    document.getElementsByClassName("modal-backdrop")[2].remove();
    document.getElementsByClassName("modal-open")[0].style.overflow = "visible";
    logStateText("User consented");
  };

  const correctionFinished = () => {
    document.getElementsByClassName("modal")[1].style.visibility = "hidden";
    document.getElementsByClassName("modal-backdrop")[1].style.visibility = "hidden";
  };

  const correctionOpen = () => {
    document.getElementsByClassName("modal")[1].style.visibility = "";
    document.getElementsByClassName("modal-backdrop")[1].style.visibility = "";
    document.getElementById("InputCorrection").value = document.getElementById("OutputMessage").innerHTML;
  };

  const correctionSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    let feedback_text = document.getElementById("InputCorrection").value;
    document.getElementById("InputCorrection").value = "";
    document.getElementsByClassName("modal")[1].style.visibility = "hidden";
    document.getElementsByClassName("modal-backdrop")[1].style.visibility = "hidden";
    logStateText("User correction: " + feedback_text);
  };

  const feedbackFinished = () => {
    document.getElementsByClassName("modal")[0].style.visibility = "hidden";
    document.getElementsByClassName("modal-backdrop")[0].style.visibility = "hidden";
  };

  const feedbackOpen = () => {
    document.getElementsByClassName("modal")[0].style.visibility = "";
    document.getElementsByClassName("modal-backdrop")[0].style.visibility = "";
  };

  const feedbackSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    let feedback_text = document.getElementById("InputFeedback").value;
    let feedback = {
      "userID": userID,
      "feedback": feedback_text,
      "webTimeStamp": moment().utcOffset(-4).format("YYYY-MM-DDTHH-mm-ss.SSS")
    };
    document.getElementById("InputFeedback").value = "";
    document.getElementsByClassName("modal")[0].style.visibility = "hidden";
    document.getElementsByClassName("modal-backdrop")[0].style.visibility = "hidden";
    logStateText("User feedback: " + feedback_text);
  };

  const setExpState = (exp) => {
    if(exp == 0) {
      // Ratings only
      document.getElementById("feedback-b").remove();
      document.getElementById("correct-b").remove();
    } else if (exp == 1) {
      // Feedback only
      document.getElementById("like-b").remove();
      document.getElementById("dislike-b").remove();
      document.getElementById("correct-b").remove();
    } else if (exp == 2) {
      // Correct only
      document.getElementById("like-b").remove();
      document.getElementById("dislike-b").remove();
      document.getElementById("feedback-b").remove();
    } else {
      //All 
      //document.getElementById("feedback-b").remove();
    }
  }

  window.onload = function WindowLoad(event) {
    setExpState(3);
    feedbackFinished();
    correctionFinished();
    window.scrollTo(0,document.body.scrollHeight);
  }



  return (

    <div className="App">
      <Modal size="lg" backdrop={true} className="feedbackmodal" show={true} onHide={feedbackFinished}>
        <Modal.Header closeButton>
          <Modal.Title>Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please provide your feedback in the space below. Any helpful comments are greatly appreciated.</p>
          <Form onSubmit={feedbackSubmit}>
            <Form.Control className='InputFeedback' id="InputFeedback" autoComplete="off" placeholder="Enter your feedback..." />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={feedbackFinished}>
            Close
          </Button>
          <Button variant="primary" onClick={feedbackSubmit}>
            Submit Feedback
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal size="lg" backdrop={true} className="correctmodal" show={true} onHide={correctionFinished}>
        <Modal.Header closeButton>
          <Modal.Title>Improve Response</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please submit the improved response in the space below. Please submit exactly how the system should have responsed. The actual response has been prefilled.</p>
          <Form onSubmit={correctionSubmit}>
            <Form.Control className='InputCorrection' id="InputCorrection" autoComplete="off" placeholder=""/>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={correctionFinished}>
            Close
          </Button>
          <Button variant="primary" onClick={correctionSubmit}>
            Submit Improvement
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal id="ConsentModal" backdrop="static" show={true} size="lg">
        <Modal.Header>
          <Modal.Title>AGREEMENT</Modal.Title>
        </Modal.Header>


        <Modal.Body>
          <p>
          You are invited to participate in a research study conducted by the DialPort project, consisting of Principal Investigator Dr. Maxine Eskenazi of Carnegie Mellon University and Co-Principal Investigator Dr. David Traum of the University of Southern California, because you are at least 18 years of age, can speak or type into the DialPort portal and are using a Chrome browser with your computer. This study is funded by the National Science Foundation. 
          </p>
          <p><u>PURPOSE OF THE STUDY</u></p>
          <p>
          Your interaction with the information and/or game applications will generate anonymous text and/or speech data that will be shared with the spoken dialogue research community for research on spoken dialogue systems.
          </p>
          <p><u>STUDY PROCEDURES</u></p>
          <p>If you volunteer to participate in this study, you will interact with one or more information and/or game applications using either speech or text input.  Currently, you may request information about Carnegie Mellon University’s bus routes, play a word-guessing game that will provide you clues to enable you to guess a series of words correctly, ask about the weather and/or request information about restaurants in Cambridge, U.K.   You may interact with these applications as long as you like, and terminate whenever you like by saying “goodbye.”
          </p>
          <p><u>POTENTIAL RISKS AND DISCOMFORTS</u></p>
          <p>There is no risk in participating in this study other than that associated with the use of a computer. 
          </p>
          <p><u>POTENTIAL BENEFITS TO PARTICIPANTS AND/OR TO SOCIETY</u></p>
          <p>You may benefit from participating by getting some information or by playing a game.    Data collected from your interaction may help advance knowledge in the field of spoken dialogue.
          </p>
          <p><u>PAYMENT/COMPENSATION FOR PARTICIPATION</u></p>
          <p>You will not be compensated for your participation.
          </p>
          <p><u>CONFIDENTIALITY</u></p>
          <p>Only information provided by you through voluntary interaction with our system will be used. 
          The text and audio data collected will be stored on secure servers within the participating institutions indefinitely and used for research purposes.  No personal identifiers will be assigned to these files.  This anonymous data may be accessed by members of the research team, members of the research community, the National Science Foundation, Carnegie Mellon University’s Institutional Review Board and the University of Southern California’s Human Subjects Protection Programs (HSPP). 
          
          The results of this research may be made public, shared with participating sites and quoted in professional journals and meetings, but results from this study will only be reported as a group such that no individual respondents can be identified. No identifiable information will be collected or included in any presentations or publications.
          </p>
          <p><u>PARTICIPATION AND WITHDRAWAL</u></p>
          <p>Your participation is voluntary. Your decision not to participate will not involve any penalty or loss of benefits to which you are otherwise entitled. You may withdraw your consent at any time and discontinue participation without penalty. You are not waiving any legal claims, rights or remedies because of your participation in this research study. 
          </p>
          <p><u>ALTERNATIVES TO PARTICIPATION</u></p>
          <p>Your alternative is to not participate. You may terminate your interaction with any of the applications at any time.
          </p>
          <p><u>INVESTIGATOR’S CONTACT INFORMATION</u></p>
          <p>If you have any questions or concerns about the research, please feel free to contact 
          
          Dr. Maxine Eskenazi, Principal Investigator <a href="dialport-contact@lists.andrew.cmu.edu">dialport-contact@lists.andrew.cmu.edu</a> Language Technologies Institute
          Carnegie Mellon University
          6413 Gates Hillman Complex
          5000 Forbes Ave., Pittsburgh, PA 15213
          (412)268-6591
          
          Dr. David Traum, Co-Principal Investigator <a href="traum@ict.usc.edu">traum@ict.usc.edu</a>  USC Institute for Creative Technologies
          12015 Waterfront Dr., Playa Vista, CA 90094
          (310)574-5700.
          </p>
          <p><u>RIGHTS OF RESEARCH PARTICIPANT – IRB CONTACT INFORMATION</u></p>
          <p>If you have questions, concerns, or complaints about your rights as a research participant or the research in general and are unable to contact the research team, or if you want to talk to someone independent of the research team, please contact either the Office of Research Integrity and Compliance at Carnegie Mellon University, email: <a href="irb-review@andrew.cmu">irb-review@andrew.cmu.edu</a>; Phone (412) 268-1901 or (412)268-5460; or, the University Park Institutional Review Board (UPIRB), 3720 South Flower Street #301, Los Angeles, CA&nbsp; 90089-0702, (213) 821-5272 or upirb@usc.edu
              </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={modalFinished}>
            Agree
          </Button>
        </Modal.Footer>
      </Modal>
      <header className="App-header">
        <Container className="AppContainer" fluid={true}>
          <Row className="justify-content-md-center">
            <Col id="dialog" className="DialogHolder" style={{fontSize: "30px"}}>
              <Toast id="LikedToast" className="Toast" show={true} style={{position: 'absolute', bottom: "27%", left: "40%"}}>
                <Toast.Body className="ToastBody">Response liked.</Toast.Body>
              </Toast>

              <Toast id="DislikedToast" className="Toast" show={true} style={{position: 'absolute', bottom: "27%", left: "40%"}}>
                <Toast.Body className="ToastBody">Response disliked.</Toast.Body>
              </Toast>

              <Toast id="NewToast" className="Toast" show={true} style={{position: 'absolute', bottom: "27%", left: "40%"}}>
                <Toast.Body className="ToastBody">Talking to a new system.</Toast.Body>
              </Toast>

              <div className="History" id="History">
              </div>

              <p className='OutputMessage' id="OutputMessage">Welcome to DialPort. You will be matched with a random conversational AI! Feel free to chat about anything. Please provide feedback to help assess and improve these systems.</p>

              <ButtonToolbar className="Buttons">
                <Button id="like-b" onClick={toggleShowLiked} size="sm" className="Button Like">Like</Button>
                <Button id="dislike-b" onClick={toggleShowDisliked} size="sm" className="Button Dislike">Dislike</Button>
                <Button id="feedback-b" onClick={feedbackOpen} size="sm" className="Button Neutral">Feedback?</Button>
                <Button id="correct-b" onClick={correctionOpen} size="sm" className="Button Neutral Wide">Improve Response?</Button>
                <Button id="end-b" onClick={refreshPage} size="sm" className="Button Dislike Wide2">End Conversation</Button>
              </ButtonToolbar>

              <Form onSubmit={handleSubmit}>
                <Form.Control className='InputMessage' id="InputMessage" autoComplete="off" placeholder="Say hello" />
              </Form>
            </Col>
            <Col xs lg="4" className="InstructionHolder">
              <div className="Instructions">
                <h1> <strong> What is DialPort? </strong> </h1>
                <p>DialPort is a collection of the best conversational systems. You will be randomly matched with one of these systems.</p>
                <h1> <strong> What can I do? </strong> </h1>
                <p>You can talk about anything you want! Please provide feedback, to help researchers improve their systems. If you'd like to try a new system, press <em>End Conversation.</em></p>
              </div>
            </Col>
          </Row>
        </Container>
      </header>
    </div>
  );
}

export default App;
