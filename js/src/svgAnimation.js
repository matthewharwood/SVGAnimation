/*
  svgAnimation.js v1.0.0
  Licensed under the MIT license.
  http://www.opensource.org/licenses/mit-license.php

  Copyright 2015, Smashing Magazine
  http://www.smashingmagazine.com/
  http://www.hellomichael.com/
*/

;( function( window ) {
  'use strict';

  var svgAnimation = function (options) {
    var self = this;
    self.options = extend({}, self.options);
    extend(self.options, options);
    self.init();
  };

  svgAnimation.prototype = {
    constructor: svgAnimation,

    options: {
      data:                 null,
      canvas:               null,
      svg:                  null,
      duration:             null,
      steps:                null,
      animations:           [], 
      tweens:               []
    },

    init: function() {
      var self = this;

      self.loadJSON(self.options.data, function () {
        console.log("JSON loaded");

        self.loadSVG(self.options.canvas, self.options.svg, self.options.animations, self.options.duration, self.options.steps, function () {
          console.log("SVG loaded");
          console.log(self.options);
        });
      });
    },

    /*
      Get JSON data and populate options
      @param {Object}   data
      @param {Function} callback 
    */
    loadJSON: function(data, callback) {
      var self = this;

      // XML request
      var xobj = new XMLHttpRequest();
      xobj.open('GET', data, true);

      xobj.onreadystatechange = function() {
        // Success
        if (xobj.readyState === 4 && xobj.status === 200) {
          var json = JSON.parse(xobj.responseText);

          // Add animation data to 
          extend(self.options, json);

          if (callback && typeof(callback) === "function") {
            callback();
          }
        }
      };

      xobj.send(null);
    },

    /*
      Loads the SVG into the DOM and creates tweens ready for playback

      @param {Object}   canvas
      @param {String}   svg
      @param {Array}    animations
      @param {Int}      duration 
      @param {Int}      steps
      @param {Function} callback 
    */

    loadSVG: function(canvas, svg, animations, duration, steps, callback) {
      var self = this;
      duration /= steps;

      Snap.load(svg, function(svg) {
        // Placed SVG into the DOM
        canvas.append(svg);

        // Create tweens for each animation
        animations.forEach(function(animation) {
          var element = canvas.select(animation.id);
          
          // Create scale, rotate, and transform groups around an SVG node
          self.createTransformGroup(element);

          // Create tween based on keyframes
          if (animation.keyframes.translateKeyframes) {
            self.options.tweens.push(new svgTween({
              element: element,
              type: 'translate',
              keyframes: animation.keyframes.translateKeyframes,
              duration: duration
            }));
          }

          if (animation.keyframes.rotateKeyframes) {
            self.options.tweens.push(new svgTween({
              element: element,
              type: 'rotate',
              keyframes: animation.keyframes.rotateKeyframes,
              duration: duration
            }));
          }

          if (animation.keyframes.scaleKeyframes) {
            self.options.tweens.push(new svgTween({
              element: element,
              type: 'scale',
              keyframes: animation.keyframes.scaleKeyframes,
              duration: duration
            }));
          }
        });

        if (callback && typeof(callback) === "function") {
          callback();
        }
      });
    },

    /*
      Create scale, rotate, and transform groups around an SVG DOM node
      @param {object} Snap element
    */
    createTransformGroup: function(element) {
      if (element.node) {
        var $translateGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        var $rotateGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        var $scaleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        $scaleGroup.setAttribute('class', 'scale');
        $rotateGroup.setAttribute('class', 'rotate');
        $translateGroup.setAttribute('class', 'translate');

        // Clone original child nodes into scale group
        for (var i = 0; i < element.node.childNodes.length; i++) {
          $scaleGroup.appendChild(element.node.childNodes[i].cloneNode()); 
        }

        // Empty original node
        while (element.node.hasChildNodes()) {
          element.node.removeChild(element.node.lastChild);
        }

        // Replace with new transform groups
        element.node.appendChild($translateGroup).appendChild($rotateGroup).appendChild($scaleGroup);
      }
    }
  };

  /*
    Merges two objects together
    @param  {Object}  a 
    @param  {Object}  b
    @return {Object}  sum
    //http://stackoverflow.com/questions/11197247/javascript-equivalent-of-jquerys-extend-method
  */
  function extend(a, b) {
    for (var key in b) { 
      if (b.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }

    return a;
  }

  // Add to namespace
  window.svgAnimation = svgAnimation;
})(window);