import * as d3 from "d3";
import { createProps } from "../features/createProps";
import { createSVGElem, wrap } from "../features/usefulMethods";

import "./style.css";

var qlik = window.require("qlik");

export default function paint($element, layout) {
  // console.log("Layout:", layout);

  /* MANIPULATE DATA */
  var hc = layout.qHyperCube,
    mat = hc.qDataPages[0].qMatrix,
    subgroups = [],
    groups = [],
    colors = [],
    vals = [];

  hc.qMeasureInfo.forEach((meas) => {
    subgroups.push(meas.qFallbackTitle);
  });

  mat.forEach((el) => {
    groups.push(el[0].qText);
  });

  var data = mat.map((el, i) => {
    var temp = {},
      sumPos = 0,
      sumNeg = 0,
      totals = 0;
    temp["Dim"] = el[0].qText;
    for (const subgroup in subgroups) {
      let sg = parseInt(subgroup);
      temp[subgroups[sg]] = el[sg + 1].qNum;

      if (el[sg + 1].qNum > 0) sumPos += el[sg + 1].qNum;
      else sumNeg += el[sg + 1].qNum;

      temp["moreInfo" + sg] = el[sg + 1].qAttrExps.qValues[1].qText;

      if (el[sg + 1].qNum != "NaN") temp["total"] = totals += el[sg + 1].qNum;
    }

    if (el[i + 1] != undefined) {
      // temp["color"] = el[i + 1].qAttrExps.qValues[0].qText;
      colors.push(el[i + 1].qAttrExps.qValues[0].qText);
    }

    vals.push(sumPos, sumNeg);
    return temp;
  });

<<<<<<< HEAD
  // console.log("subgroups", subgroups);
  // console.log("groups", groups);
  // console.log("vals", vals);
  // console.log("Data", data);
=======
  console.log("subgroups", subgroups);
  console.log("groups", groups);
  console.log("vals", vals);
  console.log("colors", colors);
  
  data.sort((a, b) => (a.total > b.total ? 1 : b.total > a.total ? -1 : 0));
  colors.forEach((color, i) => (data[i]["color"] = color));
  
  console.log("Data", data);
>>>>>>> abbd7c3087a93f3bb625a4fd3bfc711dad41eddd

  /* MANAGE PROPS */
  const allProps = createProps(layout);
  // console.log("allProps", allProps);

  // Initial stuffs
  const elementId = "BCT_" + layout.qInfo.qId,
    containerWidth = $element.width(),
    containerHeight = $element.height();

  console.log("elementId", elementId);

  var margin = {
      top: 10,
      right: 10,
      bottom: 15,
      left: 35,
    },
    width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.top - margin.bottom;

  // Create the SVG
  var svg = createSVGElem(elementId, width, height, margin);

  /* SCALES AND X/Y AXES */
  // Set ranges
  var x = d3
    .scaleBand()
    .range([margin.left, width - margin.right])
    .padding(0.2);
  var y = d3
    .scaleLinear()
    .rangeRound([height - margin.bottom, margin.top])
    .nice();

  // Scale the range of the data in the domains

  // x.domain(
  //   data.map(function (d) {
  //     return d.Dim;
  //   })
  // );

  if (allProps.sorting == "no") x.domain(groups);
  else if (allProps.sorting == "desc")
    x.domain(data.map((d) => d.Dim).reverse());
  else x.domain(data.map((d) => d.Dim));

  y.domain([d3.min(vals), d3.max(vals)]).nice();

  /* AXIS */
  var xAxis = svg
    .append("g")
    .attr("class", "x_axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("#" + elementId + " .tick text")
    .call(wrap, x.bandwidth());
  svg.append("g").attr("class", "y_axis").call(d3.axisLeft(y));

  const stackedData = d3
    .stack()
    .keys(subgroups)
    .offset(d3.stackOffsetDiverging)(data);
  // console.log("stackedData", stackedData);

  /* TOOLTIP */
  if ($("BCT-Tooltip " + layout.qInfo.qId).length)
    $("BCT-Tooltip " + layout.qInfo.qId).remove();
  var tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "BCT-Tooltip " + layout.qInfo.qId)
    .style("opacity", 0)
    .style("position", "absolute")
    .style("z-index", 10);

  /* BARS */
  svg
    .append("g")
    .attr("class", "rects")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .join("g")
    .attr("fill", (d, i) => d[i].data.color)
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data((d) => d)
    .join("rect")
    .attr("x", (d) => x(d.data.Dim))
    .attr("y", (d) => y(d[1]))
    .attr("height", (d) => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    // .attr("rx", "3")
    .on("mouseover", function (e, d) {
      tooltip.transition().duration(100).style("opacity", 1);
      let temp = "";
      temp += "<h1>" + allProps.tooltipTitle + "</h1>";
      for (const key in d.data) {
        const regex = /moreInfo/g;
        if (key != "Dim" && key != "color" && key != "total") {
          if (!key.match(regex))
            temp += "<p>" + key + ": " + d.data[key] + "</p>";
          else temp += "<p>" + d.data[key] + "</p>";
        }
      }
      tooltip
        .html(temp)
        .style("left", e.pageX + 20 + "px")
        .style("top", e.pageY - 28 + "px");
    })
    .on("mouseout", function (e, d) {
      tooltip.transition().duration(100).style("opacity", 0);
    });

  /* TOTALS */
  var totals = svg
    .append("g")
    .attr("class", "totals")
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("text-anchor", "middle")
    .attr("x", (d) => x(d.Dim) + x.bandwidth() / 2)
    .attr("y", (d) => {
      let sum = 0;
      for (const key in d)
        if (typeof d[key] == "number" && d[key] > 0 && key != "total") {
          sum += d[key];
        }
      return y(sum) - 5;
    })
    .text((d) => d.total);

<<<<<<< HEAD
  // console.log("End BCT");
=======
  /* LEGEND */
  if (allProps.legend) {
    function rescale(legendWidth) {
      // Adjust right side
      x.range([margin.left, width - margin.right - legendWidth]);
      svg
        .select("#" + elementId + " g.x_axis")
        // .transition()
        // .duration(1000)
        .call(d3.axisBottom(x))
        .selectAll(".tick text")
        .call(wrap, x.bandwidth());

      svg
        .selectAll("#" + elementId + " g.rects > g > rect")
        .attr("width", x.bandwidth())
        .attr("x", (d) => x(d.data.Dim));

      totals.attr("x", (d) => x(d.Dim) + x.bandwidth() / 2);

      d3.selectAll("#" + elementId + " .legend > circle").attr(
        "cx",
        width - legendWidth
      );

      d3.selectAll("#" + elementId + " .legend > text").attr(
        "x",
        width - legendWidth + 8
      );
    }

    var legend = svg.append("g").attr("class", "legend");
    // Add one dot in the legend for each name.
    legend
      .selectAll("mydots")
      .data(colors)
      .enter()
      .append("circle")
      .attr("cx", width - 40)
      .attr("cy", (d, i) => 0 + i * 20) // 100 is where the first dot appears. 20 is the distance between dots
      .attr("r", 7)
      .style("fill", (d) => d);

    // Add one dot in the legend for each name.
    legend
      .selectAll("mylabels")
      .data(subgroups)
      .enter()
      .append("text")
      .attr("x", width - 32)
      .attr("y", (d, i) => 0 + i * 20) // 102 is where the first dot appears. 20 is the distance between dots
      .style("fill", (d) => "black")
      .text((d) => d)
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");

    var legendWidth = document
      .querySelector("#" + elementId + " .legend")
      .getBoundingClientRect().width;

    rescale(legendWidth);
  }

  // debugger;
  // // Update margins
  // let updMargin = $(".x_axis")[0].getBoundingClientRect().height;
  // d3.select(".BCT").attr(
  //   "transform",
  //   "translate(" + margin.left + "," + updMargin + ")"
  // );

  console.log("End BCT");
>>>>>>> abbd7c3087a93f3bb625a4fd3bfc711dad41eddd
}
