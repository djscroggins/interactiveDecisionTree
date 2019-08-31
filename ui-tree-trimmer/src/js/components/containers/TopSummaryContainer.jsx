import React from "react";

import AccuracyReport from "../top-summary/AccuracyReport";
import ParameterTable from "../top-summary/ParameterTable";
import TreeSummary from "../top-summary/TreeSummary";

const Box = require("grommet/components/Box");

export default class TopSummaryContainer extends React.Component {
  render() {
    return (
      <div>
      <Box className='top-summary-container'
           direction='row'
           align='center'
           justify='around'>
        <AccuracyReport/>
        <ParameterTable/>
        <TreeSummary/>
      </Box>
      </div>
    );
  }
};