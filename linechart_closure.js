function lineChart() {
  var ht, xSl, ySl, zip;
  //We can also set default values for them
  /*ht = height;
  xSl = xScale;
  ySl = yScale;
  zip = zip[6]*/

  var dotSelected = function (d) {
    d3.select(this).attr("r", 8);
  };

  var dotRestored = function (d) {
    d3.select(this).attr("r", 3);
  };

  function chart(selection) {
    // check point: console.log(selection);
    selection.each(function (data) {
      d3.select(this).append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", d3.line()
          .x(d => xSl(d.month) + xSl.bandwidth() + 5)
          .y(d => ySl(d[zip])));

      d3.select(this).selectAll('circle')
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("id", d => d.month)
        .attr("cx", d => xSl(d.month) + xSl.bandwidth() + 5)
        .attr("cy", d => ySl(d[zip]))
        .attr("r", 3)
        .on("mouseover", dotSelected)
        .on("mouseout", dotRestored)
        .append("title")
        .text(d => d.month + ': ' + d[zip]);
    });
  }

  chart.setHeight = function (h) {
    ht = h;
    return chart;
  };

  chart.setScale = function (xS, yS) {
    xSl = xS;
    ySl = yS;
    return chart;
  };

  chart.setZip = function (zip_code) {
    zip = zip_code;
    return chart;
  };

  chart.update = function (view) {
    var dots = view.selectAll("circle");
    dots.transition(1000)
      .attr("cy", d => ySl(d[zip]));
    dots.select("title")
      .text(d => d.month + ': ' + d[zip]);
    var line = view.selectAll(".line");
    line.transition(1000)
      .attr("d", d3.line()
        .x(d => xSl(d.month) + xSl.bandwidth() + 5)
        .y(d => ySl(d[zip]))
      );
  };

  return chart;
}