import React from "react";

const NumberInput = require("grommet/components/NumberInput");
const Select = require("grommet/components/Select");
const CheckBox = require("grommet/components/CheckBox");
const Button = require("grommet/components/Button");
const Label = require("grommet/components/Label");

export default class TreeInitForm extends React.Component {
  constructor(props) {
    super(props);
    this.options = [{ "label": "Gini", "value": "gini" }, { "label": "Entropy", "value": "entropy" }];
    this.state = {
      criterion: { label: "Gini", value: "gini" },
      maxDepth: 20,
      minSamplesSplit: 2,
      minSamplesLeaf: 1,
      randomState: true
    };
  }

  _initializeTree = (e) => {
    e.preventDefault();
    const { criterion, maxDepth, minSamplesSplit, minSamplesLeaf, randomState } = this.state;
    const payload = {
      criterion: criterion.value,
      max_depth: maxDepth,
      min_samples_split: minSamplesSplit,
      min_samples_leaf: minSamplesLeaf,
      random_state: randomState
    };

    fetch("http://localhost:5000/decision-trees", {
      mode: "cors",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "parameters": payload })
    })
      .then(response => {
        console.log(`_initializeTree -> ${response.status}: ${response.statusText}`);
        return response.json();
      })
      .then(json => {
        this.props.initParameters(payload);
        this.props.initMLResults(json["ml_results"]);
        this.props.showInitializedApp();
      })
      .catch(error => console.log(error));
  };

  _setCriterion = (e) => this.setState({ criterion: e.option });

  _setMaxDepth = (e) => this.setState({ maxDepth: e.target.value });

  _setMinSamplesSplit = (e) => this.setState({ minSamplesSplit: e.target.value });

  _setMinSamplesLeaf = (e) => this.setState({ minSamplesLeaf: e.target.value });

  _toggleRandomState = (e) => this.setState({ randomState: e.target.checked });


  render() {
    return (
      <form className='file-load-form' onSubmit={this._initializeTree}>
        <Label>Selection Criterion</Label>
        <Select options={this.options} value={this.state.criterion.label}
                placeHolder={"Gini"} name='selectionCriterion' onChange={this._setCriterion}/>

        <Label>Max Depth</Label>
        <NumberInput defaultValue={20} min={1} name='maxDepth' onChange={this._setMaxDepth}/>

        <Label>Min Samples to Split On</Label>
        <NumberInput defaultValue={2} min={2} name='minSamplesSplit' onChange={this._setMinSamplesSplit}/>

        <Label>Min Samples Required in Leaf Nodes</Label>
        <NumberInput defaultValue={1} min={1} name='minSamplesLeaf' onChange={this._setMinSamplesLeaf}/>

        <CheckBox defaultChecked={true} label='Random State' name='randomState' toggle={true}
                  onChange={this._toggleRandomState}/>

        <Button label='Initialize Tree' type='submit'/>
      </form>
    );
  }
};
