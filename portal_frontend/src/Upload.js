import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Upload.css';

import {Modal, Toast, ButtonToolbar, Button, Form, Container, Row, Col} from 'react-bootstrap';

function Upload() {
  document.title = "Static Evaluation";
  return (
<div id="upload">
<p><h1>Static Evaluation Submission</h1></p>
<form enctype="multipart/form-data" action="http://dialog.speech.cs.cmu.edu:8000/upload" method="post">
Team/Model name: <input type="text" name="filename" /> <br/> <br/>
Model outputs: <input type="file" name="file1" /><br/><br/>
Did you use pre-trained models/additional data: <select id="extra" name="extra">   <option value="yes">Yes</option>
  <option value="no">No</option>
</select>

What are you submitting to?: <select id="test" name="test">   <option value="validation">Validation Set</option>
  <option value="test">Test Set</option>
</select>
<br />
<br />
<input type="submit" value="upload" />
</form>
</div>
  );
}

export default Upload;
