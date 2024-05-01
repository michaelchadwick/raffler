# Raffler

And the winner is...

## Description

*Raffler* is a web app designed to help make a decision. Add your items, start the machine, and then click or tap the button to watch the countdown of your cavalcade of choices. Cycling slowly ramps down to a complete stop, and a single item is selected.

### Contributing

To develop locally, a few simple steps need to be taken.

* clone the project to your local computer
`$ git clone git@github.com:michaelchadwick/raffler.git`
* change into the new directory
`$ cd raffler`
* run a local http server
`$ php -S 127.0.0.1:3000` or `$ python3 -m http.server 3000` or `$ ruby -run -e httpd . -p 3000`

Finally, check out [http://localhost:3000](http://localhost:3000) in a browser for your running instance!

To stop the local instance, issue a `Ctrl-C` at the command line where it's running.

### Tech Specs

*Raffler* uses [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) to keep data and options stateful, even in the event of a browser reload or crash.

*Raffler* has no items to raffle by default, so click on the settings menu icon (gear in top-right) and add some to the Available Items section.

### Server Options

In order to change some of *Raffler*'s options, do the following:

  1. Copy and rename the `/config/raffler_config.json.dist` file to `/config/raffler_config.json`.
  2. Update the contents of `/config/raffler_config.json` to use your values
  3. Use the following URL to enable: `https://example.domain/?local_config=1`

```json
{
  "dataFilePath": "/config/raffler_data.json",
  "logoFilePath": "/assets/images/my-logo.png",
  "logoFileLink": "http://ohmanwhat.omg"
}
```

The options that can be changed are as follows:

* `dataFilePath` - json file of Raffler items that will automatically be added upon load
* `logoFilePath` - logo for your thingy that appears next to the Raffler title
* `logoFileLink` - somewhere to go to if you click the logo

An example file has been included as `/config/raffler_data.json.dist`:

```json
[
  "Bavmorda, Nockmaar",
  "Elora Danan, Tir Asleen",
  "Madmartigan, Crossroads",
  "Sorsha, Nockmaar",
  "Willow Ufgood, Newlyn",
  "Fin Raziel, Tir Asleen",
  "Meegosh, Newlyn",
  "Burglekutt, Newlyn",
  "General Kael, Nockmaar"
]

The settings menu will also allow you to toggle special effects and other debug stuff like stopping and starting a raffler in-process, re-initializing all data, and seeing which items have been chosen.

#### Third-Party Help

* [JS File Saving](https://github.com/eligrey/FileSaver.js) for exporting results to text
