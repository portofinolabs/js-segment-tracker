Segment Event Tracker
=====================

Description
-----------

This script is designed for automatically tracking events on your website and sending them to Segment. It monitors click events on elements with a `data-track-event` attribute and also automatically sends a "Page Viewed" event upon URL changes or page loads.

Installation
------------

1. Include the Segment script on your page.
2. Add this tracking script to your webpage.

Usage
-----

Attach the `data-track-event` attribute to any DOM element you wish to track. The value of this attribute will be used as the event name in Segment.

For example:

```sh
<button data-track-event="Button Clicked">Click Me</button>
```

If you want to pass additional data with the event, you can add attributes that start with `data-event-`.

For instance:

```sh
<button data-track-event="Button Clicked" data-event-color="red">Click Me</button>
```

In this example, when the user clicks on the button, a "Button Clicked" event with an additional `color` field having the value "red" will be sent.

Error Handling
--------------

If the `analytics` object from Segment is not available, the script will log a warning to the console. Ensure the Segment script is loaded and accessible on your page prior to this script.

License
-------

MIT License
