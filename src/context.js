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
        heading: "Search Results",
        query: action.query,
        error: null,
        loading: false
      };
    case "SEARCH_START":
      return { ...state, loading: true, error: null };
    case "SEARCH_ERROR":
      return {
        ...state,
        track_list: [],
        loading: false,
        error: "Something went wrong while fetching tracks. Please try again later."
      };
    default:
      return state;
  }
};

export class Provider extends Component {
  state = {
    track_list: [],
    heading: "Featured Tracks",
    query: "",
    loading: true,
    error: null,
    dispatch: action => this.setState(state => reducer(state, action))
  };
  componentDidMount() {
    axios
      .get(
        `https://lrclib.net/api/search?q=adele`
      )
      .then(res => {
        this.setState({
          track_list: res.data.slice(0, 10),
          loading: false
        });
      })
      .catch(error => {
        console.log(error);
        this.state.dispatch({ type: "SEARCH_ERROR" });
      });
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
