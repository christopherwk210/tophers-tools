# [CSS Color Overlay](https://topheranselmo.com/tools/color-overlay)

Generates CSS filters that emulate pixel perfect color overlays. This is basically Photoshop's "Color Overlay" blending option but for the web. Incredibly useful.

The code for this feature was lovingly borrowed from [https://codepen.io/sosuke/pen/Pjoqqp?editors=1010](https://codepen.io/sosuke/pen/Pjoqqp?editors=1010), created by Barrett Sonntag. All the credit goes to them! I just wanted to make a more usable interface that also accounted for sources that aren't colored black by default (by adding `brightness(0) saturate(100%)` as per the note in the original codepen).