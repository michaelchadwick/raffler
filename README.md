# Raffler

And the winner is...

## Description

Click or tap the button and a cavalcade of pre-loaded items will begin to cycle more and more slowly as it finally comes to a stop, and a single choice is made. That item will then be added to a results list below the *Raffler*, and will not be chosen again if re-run (until a reset, naturally).

### Contributing

To develop locally, a few simple steps need to be taken.

* clone the project to your local computer
`$ git clone git@github.com:michaelchadwick/raffler.git`
* change into the new directory
`$ cd raffler`
* build sass files ([Dart Sass](https://sass-lang.com))
`$ sass assets/scss:assets/css` or `sass -w assets/scss:assets/css` (for continuous dev)
* run a local http server
`$ php -S 127.0.0.1:3000` or `$ python3 -m http.server 3000` or `$ ruby -run -e httpd . -p 3000`

Finally, check out [http://localhost:3000](http://localhost:3000) in a browser for your running instance!

To stop the local instance, issue a `Ctrl-C` at the command line where it's running.

### Tech Specs

*Raffler* uses [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) to keep data and options stateful, even in the event of a browser reload or crash.

*Raffler's* data set comes from `assets/json/raffler_data.json`, and it is structured as follows:

```json
[
  {
    "name": "Bavmorda",
    "affl": "Nockmaar"
  },
  {
    "name": "Elora Danan",
    "affl": "Tir Asleen"
  },
  {
    "name": "Madmartigan",
    "affl": "Crossroads"
  },
  {
    "name": "Sorsha",
    "affl": "Nockmaar"
  },
  {
    "name": "Willow Ufgood",
    "affl": "Newlyn"
  }
]
```

Override this data with your own names and affiliations in order to successfully raffle off your items. Optionally, you can add additional user items on the fly (this functionality is hidden by default, however) by using the settings menu (gear icon). The settings menu will also allow you to stop and start a raffler in-process, re-initialize all data, as well as toggle special effects.

### User Options

There are four options that can be changed via an additional override file.

* `dataFilePath` - json file of Raffler items
* `logoFilePath` - logo for your thingy
* `logoFileLink` - click logo and go somewhere
* `talkifyKey` - API key for your [Talkify](https://manage.talkify.net) account (note: you must get a Talkify API key in order to have Raffler honor the "SOUND: NAME" option, which reads items as they are picked)

Simply copy `config/raffler_settings.user.dist` to `config/raffler_settings.user.json` and fill in your specific information.

```json
{
  "dataFilePath": "./assets/json/floobidy-hoo.json",
  "logoFileLink": "http://ohmanwhat.omg",
  "logoFilePath": "./assets/images/jamma-mamma.png",
  "talkifyKey": "123456ABCDEF"
}
```

#### Third-Party Help

* [Javascript Standard Style Guide](https://github.com/standard/standard)
* [JS File Saving](https://github.com/eligrey/FileSaver.js)
* [CSV to JSON](https://github.com/Keyang/node-csvtojson)
* [Talkify](https://talkify.net)
