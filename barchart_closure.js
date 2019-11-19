// the chart closure 
function barChart() {
    /*-- In this example, the local variables are defined as follows, almost allt 
    because I tried to avoid the things inside closure to be changed by 
    the things outside the closure directly. I prefer to use the "getters & setters" 
    to access/modify the things inside the closure.

    Anyway, the closure often appears in the online resourses of d3.js. Konwing how it works will
    help you to understand and take use of these online sourses. 

    Please feel free to let me know if you have questions about closure.
    --*/
    var ht, xSl, ySl, zip;
    //We can also set default values for them
    /*ht = height;
    xSl = xScale;
    ySl = yScale;
    attr = attributes[6]*/
    var barSelected = function(d) {
        d3.select(this).style("stroke", "red").style("stroke-width", "3");
    };

    var barRestored = function(d) {
        d3.select(this).style("stroke", "red").style("stroke-width", "0");
    };

    function chart(selection) {
        // check point: console.log(selection);
        selection.each(function (data) {
            d3.select(this).selectAll('rect')
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("id", d => d.crime.split(" ")[0])
                .attr("x", function (d) {
                    return xSl(d.crime)+xSl.bandwidth()/2;
                })
                .attr("y", function (d) {
                    return ySl(d[zip]);
                })
                .attr("width", xSl.bandwidth()*3/4)
                .attr("height", function (d) {
                    return ht - ySl(d[zip]);
                })
                .on("mouseover", barSelected)
                .on("mouseout", barRestored)
                .append("title")
                  .text(d => d[zip]);
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
        var rects = view.selectAll("rect");
        rects.transition(1000)
            .attr("y", function (d) {
                return ySl(d[zip]);
            })
            .attr("height", function (d) {
                return ht - ySl(d[zip]);
            });
        rects.select("title")
            .text(d => d[zip]);
    };

    return chart;
}
