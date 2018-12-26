/**
 * @Author: Ali
 * @Date:   2018-12-26T14:42:43+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-12-26T15:15:17+01:00
 */
import React, { Component } from 'react'
import { Consumer } from '../../context'
class Tracks extends Component {
  render(){
    return (
      <Consumer>
        {value => {
          console.log(value)
          return <h1> Tracks </h1>
        }}
      </Consumer>
    )
  }
}
export default Tracks
