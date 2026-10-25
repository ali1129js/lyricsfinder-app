/**
 * @Author: Ali
 * @Date:   2018-12-27T09:40:55+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-12-27T10:15:45+01:00
 */
import React from "react";
import { Link } from "react-router-dom";
const Track = props => {
  const { track } = props;
  return (
    <div className="col-md-6">
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5> {track.artistName} </h5>
          <p className="card-text">
            <strong>
              <i className="fas fa-play" />
              Track
            </strong>
            : {track.trackName}
            <br />
            <strong>
              <i className="fas fa-compact-disc" />
              Album
            </strong>
            : {track.albumName}
          </p>
          <Link
            to={`lyrics/track/${track.id}`}
            className="btn btn-dark btn-block"
          >
            <i className="fas fa-chevron-right"> View Lyrics</i>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Track;
