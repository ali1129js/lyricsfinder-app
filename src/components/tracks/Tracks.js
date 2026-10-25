/**
 * @Author: Ali
 * @Date:   2018-12-26T14:42:43+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-12-27T16:56:05+01:00
 */
import React, { Component } from "react";
import { Consumer } from "../../context";
import Spinner from "../layout/Spinner";
import Track from "./Track";
class Tracks extends Component {
  render() {
    return (
      <Consumer>
        {value => {
          const { track_list, heading, loading, error, query } = value;
          if (loading) {
            return <Spinner />;
          } else if (error) {
            return <div className="alert alert-danger text-center">{error}</div>;
          } else if (track_list === undefined || track_list.length === 0) {
            return (
              <div className="alert alert-info text-center">
                No results found for "{query}". Try another song or artist.
              </div>
            );
          } else {
            return (
              <React.Fragment>
                <h3 className="text-center mb-4"> {heading} </h3>
                <div className="row">
                  {track_list.map(item => (
                    <Track key={item.id} track={item} />
                  ))}
                </div>
              </React.Fragment>
            );
          }
        }}
      </Consumer>
    );
  }
}
export default Tracks;
