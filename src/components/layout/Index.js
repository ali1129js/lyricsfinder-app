/**
 * @Author: Ali
 * @Date:   2018-12-26T14:30:03+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-12-28T15:38:58+01:00
 */
import React from "react";
import Tracks from "../tracks/Tracks";
import Search from "../tracks/Search";
const Index = () => {
  return (
    <React.Fragment>
      <Search />
      <Tracks />
    </React.Fragment>
  );
};
export default Index;
