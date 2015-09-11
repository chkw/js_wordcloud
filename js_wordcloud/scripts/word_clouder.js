/**
 * chrisw@soe.ucsc.edu
 * SEPT 2015
 * word_clouder.js
 *
 * Draw word clouds using D3js.
 *
 * Requires:
 * 1) D3js
 * 2) d3-cloud from https://github.com/jasondavies/d3-cloud
 * 3) underscore.js
 * 4) utils.js
 *
 */

// expose word_clouder namespace
word_clouder = ( typeof word_clouder === "undefined") ? {} : word_clouder;
(function(wc) {"use strict";

    /**
     *Draw a word cloud with one method call.
     */
    wc.draw_word_cloud = function(wordData, containerElem, width, height, clickHandler) {

        /**
         * convert a score to a size
         */
        var scoreToSize = function(score) {
            var size = (Math.abs(score) * 30);
            return size;
        };

        /**
         * color mapper
         */
        // var fill = d3.scale.category20();
        var colorMapper = utils.centeredRgbaColorMapper(false, 0, -1, 1);

        /**
         * word cloud layout engine
         */
        var cloudLayout = d3.layout.cloud().size([width, height]);
        cloudLayout.words(wordData);
        cloudLayout.rotate(function(d, i) {
            return 0;
        });
        cloudLayout.fontSize(function(d) {
            return scoreToSize(d.score);
        });
        cloudLayout.on("end", draw);
        cloudLayout.start();

        /**
         * Render the layout
         * d3 transitions adapted from https://gist.github.com/jwhitfieldseed/9697914
         * @param {Object} layoutWordsObj d3.layout.cloud.words object
         */
        function draw(layoutWordsObj) {
            // console.log("layoutWordsObj", layoutWordsObj);
            var svgElem = d3.select(containerElem).append("svg").attr("width", cloudLayout.size()[0]).attr("height", cloudLayout.size()[1]);
            var groupElem = svgElem.append("g").attr("transform", "translate(" + cloudLayout.size()[0] / 2 + "," + cloudLayout.size()[1] / 2 + ")");
            groupElem.classed({
                "unselectable" : true,
                "pointer" : true
            });

            // entering words
            var textElems = groupElem.selectAll("text").data(layoutWordsObj).enter().append("text").style("font-size", function(d) {
                return 1;
            }).style("font-family", "Impact").style("fill", function(d, i) {
                return colorMapper(d.score);
            }).style("fill-opacity", 0).attr("text-anchor", "middle").attr("transform", function(d) {
                var s = "translate(" + [d.x, d.y] + ")rotate(" + _.random(-180, 180) + ")";
                return s;
            }).text(function(d) {
                return d.text;
            });

            // events
            textElems.on("click", clickHandler);
            textElems.on("mouseover", function(d) {
                d3.select(this).transition().duration(500).style("font-size", function(d) {
                    var size = scoreToSize(d.score) + 10;
                    return size + "px";
                });
            });
            textElems.on("mouseout", function(d) {
                d3.select(this).transition().duration(1500).style("font-size", function(d) {
                    var size = scoreToSize(d.score);
                    return size + "px";
                });
            });

            textElems.append("title").text(function(d, i) {
                var s = "score: " + d.score.toPrecision(3);
                return s;
            });

            // existing and entering words
            textElems.transition().duration(1500).style("font-size", function(d) {
                var size = scoreToSize(d.score);
                return size + "px";
            }).attr("transform", function(d) {
                var s = "translate(" + [d.x, d.y] + ")rotate(" + 0 + ")";
                return s;
            }).style("fill-opacity", 1);
        };
    };

})(word_clouder);
