const NodeSummary = function () {
    const newNodeSummary = {

        //TODO: Change this signature to object
        renderNodeSummary: function(data_in, updateInteractionParameters, retrainTree, leaf=false) {

            resetNodeSummary();

            const updateArray = [];

            const div = d3.select("#node-summary").append("div").attr("id", "summary");

            div.append("h3").append("text").text("Node Summary");

            div.append("p").append("text").text("Depth: " + data_in.node_depth);

            if (!leaf) {
                div.append("p").append("text").text(data_in.split[0] + " >= " + data_in.split[1]);
            }

            div.append("p").append("text").text(data_in.impurity[0] + " = " + data_in.impurity[1]);

            if (!leaf) {
                div.append("p").append("text").text("Impurity decrease: " + round(data_in.weighted_impurity_decrease, 5) + " (" + data_in.percentage_impurity_decrease + "%)");
            }

            div.append("p").append("text").text("Number of samples: " + data_in.n_node_samples);

            div.append("p").append("text").text("[" + getSampleDistributionText(data_in.node_class_counts) + "]");

            // If not first node, draw trim button
            if (data_in.node_depth > 0) {
                const svg_height = 50;
                const svg_width = 150;
                const button_height = svg_height - 10;
                const button_width = svg_width - 10;

                const svg = div
                    .append("svg")
                    .attr("id", "trim-button")
                    .attr("width", svg_width)
                    .attr("height", svg_height)
                    // Center svg in div
                    .style("margin", "0 auto").attr("display", "block");

                    svg.append("g")
                    .append("rect")
                    .attr("x", (svg_width - button_width) / 2)
                    .attr("y", (svg_height - button_height) / 2)
                    .attr("width", button_width)
                    .attr("height", button_height)
                    .style("fill", "rgb(255, 179, 179")
                    .attr("rx", 10)
                    .attr("ry", 10).on("click", function () {
                        showTrimOptions(data_in, leaf);
                    });

                    svg.append("text")
                    .attr("x", svg_width / 2)
                    .attr("y", svg_height / 2)
                    .attr("dy", ".35em")
                    .attr("text-anchor", "middle")
                    // Ensure clicking on rectangle and text appear as single event to user
                    .text("Trim node options").on("click", function () {
                        showTrimOptions(data_in, leaf);
                    });
            }

            function showTrimOptions(data_in, leaf_status_in) {

                toggleRetrainButton();

                d3.select("#trim-options").remove();
                d3.select("#trim-options-table").remove();
                d3.select("#retrain-button").remove();

                // console.log(data_in);

                const label = ["Why do you want to trim this node?"];

                const node_options = ["Not enough samples to split", "I want to limit the tree to this depth", "This node doesn't improve the tree enough"];
                const leaf_options = ["Not enough samples in leaf", "I want to limit the tree to this depth"];

                const div = d3.select("#node-summary").append("div").attr("id", "trim-options");

                const table = d3.select("#trim-options").append("table").attr("id", "trim-options-table").attr("align", "center");
                const thead = table.append("thead");
                const tbody = table.append("tbody");

                thead.append("tr").selectAll("th").data(label).enter().append("th").text(function (d) {
                    return d;
                });

                let rows;

                if (!leaf_status_in) {
                    rows = tbody.selectAll("tr").data(node_options).enter().append("tr").text(function (d) {
                        return d;
                    });
                } else {
                    rows = tbody.selectAll("tr").data(leaf_options).enter().append("tr").text(function (d) {
                        return d;
                    });
                }

                drawRetrainButton();

                rows.on("click", function (d) {
                    console.log(d);
                    d3.selectAll("tr").style("background-color", "transparent");
                    d3.select(this).style("background-color", "rgb(255, 179, 179)");
                    adjustUpdateArray(data_in, d);
                    toggleRetrainButton();
                })
            }

            function drawRetrainButton () {
                const thisTable = document.getElementById("trim-options-table");
                const retrainSVGWidth = thisTable.offsetWidth;
                const retrainSVGHeight = 60;
                const retrainButtonWidth = retrainSVGWidth - 10;
                const retrainButtonHeight = retrainSVGHeight - 10;

                const retrainButton = d3.select("#trim-options")
                    .append("svg")
                    .attr("id", "retrain-button")
                    .attr("width", retrainSVGWidth)
                    .attr("height", retrainSVGHeight)
                    // Center svg in div
                    .style("margin", "0 auto")
                    .attr("display", "none");

                retrainButton.append("g")
                    .append("rect")
                    .attr("x", (retrainSVGWidth - retrainButtonWidth) / 2)
                    .attr("y", (retrainSVGHeight - retrainButtonHeight) / 2)
                    .attr("width", retrainButtonWidth)
                    .attr("height", retrainButtonHeight)
                    .style("fill", "lightgreen")
                    .attr("rx", 10)
                    .attr("ry", 10)
                    .on("click", function () {
                        updateInteractionParameters(updateArray[0], updateArray[1]);
                        retrainTree();
                        resetNodeSummary();
                    });

                retrainButton.append("text")
                    .attr("x", retrainSVGWidth / 2)
                    .attr("y", retrainSVGHeight / 2)
                    .attr("dy", ".35em")
                    .attr("text-anchor", "middle")
                    // Ensure clicking on rectangle and text appear as single event to user
                    .text("Re-train tree").on("click", function () {
                        updateInteractionParameters(updateArray[0], updateArray[1]);
                        retrainTree();
                        resetNodeSummary();
                    });
            }

            function adjustUpdateArray (data_in, option_selected) {

                if (option_selected === "Not enough samples to split") {
                    const nNodeSamples = data_in.n_node_samples;
                    updateArray.splice(0, updateArray.length, "min_samples_split", nNodeSamples + 1);
                    // update_array.push("min_samples_split", n_node_samples);
                    console.log(updateArray);
                } else if (option_selected === "I want to limit the tree to this depth") {
                    const nodeDepth = data_in.node_depth;
                    // update_array.push("max_depth", node_depth);
                    updateArray.splice(0, updateArray.length, "max_depth", nodeDepth);
                    console.log(updateArray);
                } else if (option_selected === "This node doesn't improve the tree enough") {
                    const impurityDecrease = data_in.weighted_impurity_decrease;
                    updateArray.splice(0, updateArray.length, "min_impurity_decrease", impurityDecrease);
                    console.log(updateArray)
                } else if (option_selected === "Not enough samples in leaf") {
                    const nNodeSamples = data_in.n_node_samples;
                    updateArray.splice(0, updateArray.length, "min_samples_leaf", nNodeSamples + 1);
                    console.log(updateArray);
                }
            }

            function toggleRetrainButton () {
                if (updateArray.length > 0) {
                    d3.select("#retrain-button").attr("display", "block");
                } else {
                    d3.select("#retrain-button").attr("display", "none");
                }
            }

            function resetNodeSummary () {
                // d3.select("#node-hr").remove();
                d3.select("#summary").remove();
                d3.select("#trim-button").remove();
                d3.select("#trim-options-table").remove();
                d3.select("#retrain-button").remove();
            }

            function getSampleDistributionText (array_in) {
                const accumulator = [];
                array_in.forEach(function (cv) {
                    accumulator.push(cv[0].toString() + ": " + cv[1].toString())
                });
                return accumulator.join(", ");
            }

        }
    };
    return newNodeSummary;
};
