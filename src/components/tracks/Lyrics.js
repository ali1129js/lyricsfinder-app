/**
 * @Author: Ali
 * @Date:   2018-12-27T10:19:23+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-12-28T15:27:10+01:00
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
      .get(`https://lrclib.net/api/get/${this.props.match.params.id}`)
      .then(res => {
        this.setState({
          track: res.data,
          lyrics: {
            lyrics_body: res.data.instrumental
              ? "(Instrumental)"
              : res.data.plainLyrics || "No lyrics found."
          }
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
              {track.trackName} by{" "}
              <span className="text-secondary"> {track.artistName}</span>
            </h5>
            <div className="card-body">
              <p className="card-text" style={{ whiteSpace: "pre-line" }}>
                {lyrics.lyrics_body}
              </p>
            </div>
          </div>
          <ul className="list-group mt-3">
            <li className="list-group-item">
              <strong> Album Name </strong>: {track.albumName}
            </li>
            <li className="list-group-item">
              <strong> Duration </strong>: {Math.round(track.duration)}s
            </li>
          </ul>
        </Fragment>
      );
    }
  }
}
export default Lyrics;
