/**
 * @Author: Ali
 * @Date:   2018-12-26T12:52:10+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-12-26T15:13:18+01:00
 */

import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Navbar from './components/layout/Navbar';
import Index from './components/layout/Index';
import { Provider } from './context'

import './App.css'

class App extends Component {
  render() {
    return (
      <Provider>
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
      </Provider>
    )
  }
}

export default App
