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
     * Draw a word cloud with one method call.
     * At the minimum, the data must include "text" and "score" attribute.
     */
    wc.draw_word_cloud = function(wordData, containerElem, width, height, clickHandler) {

        /**
         * Normalize to all-positive scores.
         */
        var normalizeScores = function(wordData) {
            // get min, max, range
            var scores = _.map(wordData, function(element) {
                var data = element["data"];
                var score = data["score"];
                return score;
            });

            var min_score = _.min(scores);
            var max_score = _.max(scores);
            var range = Math.abs(max_score - min_score);

            // compute new scores
            _.each(wordData, function(element) {
                var normalizedScore = (element["data"]["score"] - min_score) / range;
                element["score"] = normalizedScore;
            });
        };

        // if clinical pivot detected, normalize scores
        var pivotType;
        try {
            pivotType = wordData[0]["data"]["datatype_1"];
        } catch(e) {
            console.log("error", e);
        } finally {
            if (!_.isUndefined(pivotType) && pivotType === "clinical") {
                // normalize scores for clinical pivots
                // (ANOVA correlator scores are not bounded on the right side)
                normalizeScores(wordData);
            }
        }

        /**
         * convert a score to a size
         */
        var scoreToSize = function(score, minimumSize) {
            minimumSize = ( _.isUndefined(minimumSize)) ? 10 : minimumSize;
            var size = (Math.abs(score) * 30);
            return _.max([minimumSize, size]);
        };

        // opacity mapper
        var opacityMapper = d3.scale.linear();
        opacityMapper.domain([-1, 0, 1]).range([1, 0, 1]);

        /**
         * word cloud layout engine
         */
        var cloudLayout = d3.layout.cloud().size([width, height]);
        cloudLayout.words(wordData);
        cloudLayout.padding(3);
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
            // center of the SVG canvas is (0,0).
            var width = cloudLayout.size()[0];
            var height = cloudLayout.size()[1];

            // empty out the container element
            utils.removeChildElems(containerElem);

            var svgElem = d3.select(containerElem).append("svg").attr("width", width).attr("height", height);
            var groupElem = svgElem.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
            groupElem.classed({
                "unselectable" : true,
                "pointer" : true
            });

            // entering words
            var textElems = groupElem.selectAll("text").data(layoutWordsObj).enter().append("text").text(function(d) {
                return d.text;
            });

            // style
            textElems.style("font-size", function(d) {
                return 1;
            }).style("font-family", "Impact").style("fill", function(d, i) {
                if (d.score > 0) {
                    return "red";
                } else {
                    return "blue";
                }
            }).style("fill-opacity", 0).style("cursor", "pointer");

            // position
            textElems.attr("text-anchor", "middle").attr("transform", function(d) {
                var s = "translate(" + [0, 0] + ")rotate(" + _.random(-180, 180) + ")";
                return s;
            });

            // events
            // textElems.on("click", clickHandler);
            textElems.on("click", function(d) {
                var clickedData = d;
                textElems.transition().duration(1500).style("font-size", function(d) {
                    if (clickedData !== d) {
                        var size = 10;
                        return size + "px";
                    } else {
                        return "80px";
                    }
                }).attr("transform", function(d) {
                    if (clickedData === d) {
                        var s = "translate(" + [0, 0] + ")";
                        return s;
                    } else {
                        var s = "translate(" + [d.x, d.y] + ")";
                        return s;
                    }
                }).style("fill-opacity", function(d) {
                    if (clickedData !== d) {
                        return 0;
                    } else {
                        return 1;
                    }
                });
                console.log("clicked", d.text);
            });

            textElems.on("mouseover", function(d) {
                var wordElem = d3.select(this);
                utils.pullElemToFront(wordElem.node());
                wordElem.transition().duration(500).style("font-size", function(d) {
                    var size = scoreToSize(d.score) + 10;
                    return size + "px";
                });
            });

            textElems.on("mouseout", function(d) {
                var wordElem = d3.select(this);
                wordElem.transition().duration(1500).style("font-size", function(d) {
                    var size = scoreToSize(d.score);
                    return size + "px";
                });
            });

            // tooltips
            textElems.append("title").text(function(d, i) {
                var score;
                if (!_.isUndefined(d["data"])) {
                    score = d["data"]["score"];
                } else {
                    score = d["score"];
                }
                var s = "score: " + score.toPrecision(3);
                return s;
            });

            // existing and entering words
            textElems.transition().duration(1500).style("font-size", function(d) {
                var size = scoreToSize(d.score);
                return size + "px";
            }).attr("transform", function(d) {
                var s = "translate(" + [d.x, d.y] + ")rotate(" + 0 + ")";
                return s;
            }).style("fill-opacity", function(d) {
                var value = opacityMapper(d.score);
                return value;
            });
        };
    };

})(word_clouder);
