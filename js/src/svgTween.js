/*
  svgTween.js v1.0.0
  Licensed under the MIT license.
  http://www.opensource.org/licenses/mit-license.php

  Copyright 2015, Smashing Magazine
  http://www.smashingmagazine.com/
  http://www.hellomichael.com/
*/

;( function( window ) {
  'use strict';

  var svgTween = function (options) {
    var self = this;
    self.options = extend({}, self.options);
    extend(self.options, options);
    self.init();
  };

  svgTween.prototype = {
    constructor: svgTween,

    options: {
      element: null,
      type: null,
      keyframes: null,
      duration: null,
      originX: null,
      originY: null
    },

    init: function () {
      var self = this;

      self.setOrigin(self.options.element, self.options.type, self.options.keyframes);
      self.resetTween(self.options.element, self.options.type, self.options.keyframes, self.options.originX, self.options.originY);
      self.playTween(self.options.element, self.options.type, self.options.keyframes, self.options.originX, self.options.originY, self.options.duration, 0);
    },

    /*
      Recursively loop through keyframes to create pauses or tweens

      @param {Object} element
      @param {String} type - "scale", "rotate", "translate"
      @param {Array}  keyframes
      @param {String} originX - "left", "right", "center"
      @param {String} originY - "top", "bottom", "center"
      @param {Int}    durationStep 
      @param {Int}    index
    */
    playTween: function(element, type, keyframes, originX, originY, durationStep, index) {
      var self = this;
      
      // Set keyframes we're transitioning to
      var transform, translateX, translateY, rotationAngle, scaleX, scaleY;
      
      if (type === 'translate') {
        translateX = keyframes[index].x;
        translateY = keyframes[index].y;
        transform = 'T' + translateX + ' ' + translateY;
      }

      else if (type === 'rotate') {
        rotationAngle = keyframes[index].angle;
        transform = 'R' + rotationAngle + ' ' + originX + ' ' + originY;
      }

      else if (type === 'scale') {
        scaleX = keyframes[index].x;
        scaleY = keyframes[index].y;
        transform = 'S' + scaleX + ' ' + scaleY + ' ' + originX + ' ' + originY;
      }

      // Set easing parameter
      var easing = mina[keyframes[index].easing];

      // Set duration as an initial pause or the difference of steps in between keyframes
      var duration = index ? ((keyframes[index].step - keyframes[(index-1)].step) * durationStep) : (keyframes[index].step * durationStep);

      // Pause tweens if keyframes are undefined
      // if ((index === 0 && keyframes[index].step !== 0) || index === 0) {
      if (index === 0) {
        setTimeout(function() {
          if (index !== (keyframes.length - 1)) {
            self.playTween(element, type, keyframes, originX, originY, durationStep, (index + 1));
          }
        }, duration);
      }

      // Or animate tweens if keyframes exist
      else {
        element.select('.' + type).animate({
          transform: transform
        }, duration, easing, function() {
          if (index !== (keyframes.length - 1)) {
            self.playTween(element, type, keyframes, originX, originY, durationStep, (index + 1));
          }
        });
      }
    },

    /*
      Resets the illustration to the first keyframe

      @param {Object} element
      @param {String} type - "scale", "rotate", "translate"
      @param {Array}  keyframes
      @param {String} originX - "left", "right", "center"
      @param {String} originY - "top", "bottom", "center"
    */
    resetTween: function (element, type, keyframes, originX, originY) {
      var self = this;

      // Stop any previous animations
      element.select('.translate').stop();
      element.select('.rotate').stop();
      element.select('.scale').stop();

      // Transform to first keyframe
      if (type === 'translate') {
        var translateX = keyframes[0].x;
        var translateY = keyframes[0].y;
        element.select('.translate').transform('T' + translateX + ',' + translateY);
      }

      else if (type === 'rotate') {
        var rotationAngle = keyframes[0].angle;
        element.select('.rotate').transform('R' + rotationAngle + ',' + originX + ',' + originY);
      }

      else if (type === 'scale') {
        var scaleX = keyframes[0].x;
        var scaleY = keyframes[0].y;
        element.select('.scale').transform('S' + scaleX + ',' + scaleY + ',' + originX + ',' + originY);
      }
    },

    /*
      Translates the origin from string to pixel values

      @param {Object}     element
      @param {String}     type - "scale", "rotate", "translate"
      @param {Array}      keyframes
    */
    setOrigin: function (element, type, keyframes) {
      var self = this;

      // Set bbox to specific transform element (.translate, .scale, .rotate)
      var bBox = element.select('.' + type).getBBox();

      // Set origin as specified or default to center
      self.options.originX = keyframes[0].cx ? self.getOriginX(bBox, keyframes[0].cx) : self.getOriginX(bBox, 'center');
      self.options.originY = keyframes[0].cy ? self.getOriginY(bBox, keyframes[0].cy) : self.getOriginY(bBox, 'center');
    },

    /*
      Translates the horizontal origin from a string to pixel value

      @param {Object}     Snap bBox
      @param {String}     "left", "right", "center"
      @return {Object}    pixel value
    */
    getOriginX: function (bBox, direction) {
      if (direction === 'left') {
        return bBox.x;
      }

      else if (direction === 'center') {
        return bBox.cx;
      }

      else if (direction === 'right') {
        return bBox.x2;
      }
    },

    /*
      Translates the vertical origin from a string to pixel value

      @param {Object}     Snap bBox
      @param {String}     "top", "bottom", "center"
      @return {Object}    pixel value
    */
    getOriginY: function (bBox, direction) {
      if (direction === 'top') {
        return bBox.y;
      }

      else if (direction === 'center') {
        return bBox.cy;
      }

      else if (direction === 'bottom') {
        return bBox.y2;
      }
    }
  };

  /*
    Merges two objects together
    @param {Object} a 
    @param {Object} b
    @return {Object} sum
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
  window.svgTween = svgTween;
})(window);