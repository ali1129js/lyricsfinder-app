/**
 * @Author: Ali
 * @Date:   2018-12-26T14:42:43+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-12-27T09:26:34+01:00
 */
import React, { Component } from 'react'
import { Consumer } from '../../context'
import Spinner from '../layout/Spinner'
class Tracks extends Component {
  render(){
    return (
      <Consumer>
        {value => {
          const { track_list} = value
          console.log(value)
          if(track_list === undefined || track_list.length === 0){
            return <Spinner />
          } else {
            return <h1> Tracks loaded </h1>
          }
        }}
      </Consumer>
    )
  }
}
export default Tracks
