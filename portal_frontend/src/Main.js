import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Upload from './Upload';
import App from './App';
import Leaderboard from './Leaderboard';


export default function Main() {
  return (
    <Router>
        <Switch>
          <Route path="/submit">
            <Upload />
          </Route>
          <Route path="/results">
            <Leaderboard />
          </Route>
          <Route path="/">
            <App />
          </Route>
        </Switch>
    </Router>
  );
}
