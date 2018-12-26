/**
 * @Author: Ali
 * @Date:   2018-12-26T14:51:02+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-12-26T15:16:27+01:00
 */
import React , { Component } from 'react'

const Context = React.createContext()

export class Provider extends Component {
  state = {
    track_list:[
      { track: {name:'abc'}}
    ],
    heading: 'Top 10 Tracks'
  }
  render(){
    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    )
  }
}
export const Consumer = Context.Consumer
