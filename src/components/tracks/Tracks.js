/**
 * @Author: Ali
 * @Date:   2018-12-26T14:42:43+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-12-27T09:46:48+01:00
 */
import React, { Component } from 'react'
import { Consumer } from '../../context'
import Spinner from '../layout/Spinner'
import Track from './Track'
class Tracks extends Component {
  render(){
    return (
      <Consumer>
        {value => {
          const { track_list, heading} = value
          console.log(value)
          if(track_list === undefined || track_list.length === 0){
            return <Spinner />
          } else {
            return (
              <React.Fragment>
                <h3 className="text-center mb-4"> {heading} </h3>
                <div className="row">
                  {track_list.map(item => (
                    <Track key={item.track.track_id} track={item.track}/>
                  ))}
                </div>
              </React.Fragment>
            )
          }
        }}
      </Consumer>
    )
  }
}
export default Tracks
