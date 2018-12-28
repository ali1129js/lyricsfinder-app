/**
 * @Author: Ali
 * @Date:   2018-12-27T10:19:23+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-12-28T12:47:34+01:00
 */
import React, { Component, Fragment } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Spinner from "../layout/Spinner";
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
    console.log(track);
    if (
      track === undefined ||
      lyrics === undefined ||
      Object.keys(track).length === 0 ||
      Object.keys(lyrics).length === 0
    ) {
      return <Spinner />;
    } else {
      return (
        <Fragment>
          <Link to="/" className="btn btn-dark btn-sm mb-4">
            Go Back
          </Link>
          <div className="card">
            <h5 className="card-header">
              {track.track_name} by{" "}
              <span className="text-secondary"> {track.artist_name}</span>
            </h5>
            <div className="card-body">
              <p className="card-text"> {lyrics.lyrics_body}</p>
            </div>
          </div>
          <ul className="list-group mt-3">
            <li className="list-group-item">
              <strong> Album Name </strong>: {track.album_name}
            </li>

            <li className="list-group-item">
              <strong> Explicit Words </strong>:{" "}
              {track.explicit === 0 ? "No" : "Yes"}
            </li>
          </ul>
        </Fragment>
      );
    }
  }
}
export default Lyrics;
