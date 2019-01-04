/**
 * @Author: Ali
 * @Date:   2018-12-26T12:52:10+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2019-01-04T22:34:57+01:00
 */

import React, { Component } from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Index from "./components/layout/Index";
import Lyrics from "./components/tracks/Lyrics";

import { Provider } from "./context";

import "./App.css";

class App extends Component {
  render() {
    return (
      <Provider>
        <Router>
          <React.Fragment>
            <Navbar />
            <div className="container">
              <Switch>
                <Route exact path="/" component={Index} />
                <Route exact path="/lyrics/track/:id" component={Lyrics} />
              </Switch>
            </div>
          </React.Fragment>
        </Router>
      </Provider>
    );
  }
}

export default App;
