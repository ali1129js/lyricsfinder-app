/**
 * @Author: Ali
 * @Date:   2018-12-26T12:52:10+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-12-26T14:49:35+01:00
 */

import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Navbar from './components/layout/Navbar';
import Index from './components/layout/Index';


import './App.css'

class App extends Component {
  render() {
    return (
      <Router>
        <React.Fragment>
        <Navbar />
        <div className="container">
          <Switch>
            <Route exact path='/' component={Index}/>
         </Switch>
       </div>
        </React.Fragment>
      </Router>
    )
  }
}

export default App
