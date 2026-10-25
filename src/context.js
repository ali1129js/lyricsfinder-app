/**
 * @Author: Ali
 * @Date:   2018-12-26T14:51:02+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-12-28T17:26:04+01:00
 */
import React, { Component } from "react";
import axios from "axios";

const Context = React.createContext();
const reducer = (state, action) => {
  switch (action.type) {
    case "SEARCH_TRACKS":
      return {
        ...state,
        track_list: action.payload,
        heading: "Search Results"
      };
    default:
      return state;
  }
};

export class Provider extends Component {
  state = {
    track_list: [],
    heading: "Featured Tracks",
    dispatch: action => this.setState(state => reducer(state, action))
  };
  componentDidMount() {
    axios
      .get(
        `https://lrclib.net/api/search?q=adele`
      )
      .then(res => {
        this.setState({
          track_list: res.data.slice(0, 10)
        });
      })
      .catch(error => console.log(error));
  }
  render() {
    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    );
  }
}
export const Consumer = Context.Consumer;
