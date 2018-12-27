/**
 * @Author: Ali
 * @Date:   2018-12-27T10:19:23+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-12-27T18:39:56+01:00
 */
import React, { Component } from "react";
import axios from "axios";
class Lyrics extends Component {
  state = {
    track: {},
    lyrics: {}
  };
  componentDidMount() {
    axios
      .get(
        `https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=${
          this.props.match.params.id
        }&apikey=${process.env.REACT_APP_API_KEY}`
      )
      .then(res => {
        this.setState({ lyrics: res.data.message.body.lyrics });
        return axios
          .get(
            `https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/track.get?track_id=${
              this.props.match.params.id
            }&apikey=${process.env.REACT_APP_API_KEY}`
          )
          .then(res => {
            this.setState({ track: res.data.message.body.track });
          });
      })
      .catch(error => console.log(error));
  }
  render() {
    const { track, lyrics } = this.state;
    return (
      <div>
        <h1> Lyrics </h1>
      </div>
    );
  }
}
export default Lyrics;
