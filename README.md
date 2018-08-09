# Raffler

And the winner is...

## Description

Click or tap the button and a cavalcade of pre-loaded names will begin to cycle more and more slowly as it finally comes to a stop, and a single choice is made. That name will then be added to a results list below the *Raffler*, and will not be chosen again if re-run (until a reset, naturally).

### Local Development

To develop locally, first `git clone` the project, change into that directory, install nodejs dependencies, and then run a local http server.

```shell
[~/Code]         $ git clone git@github.com:michaelchadwick/raffler.git
[~/Code]         $ cd raffler
[~/Code/raffler] $ npm install
[~/Code/raffler] $ npm run serve
```

Check out [http://localhost:3000](http://localhost:3000) for your running instance!

### Tech Specs

*Raffler* uses [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) to keep data and options stateful, even in the event of a browser reload or crash.

*Raffler's* initial data set comes from `/assets/json/raffler_data.json` (filename can be changed in `/assets/js/app/init.js`), and it is structured as follows:

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

You can optionally add additional items on the fly (this functionality is hidden by default, however) by using the admin menu (`?admin=1` in querystring). The admin menu will also allow you to stop and start a raffler in-process, re-initialize all data, as well as toggle special effects.

### User Options

There are three options that can be changed via flag and an additional config file.

* `userDataFile` - json file of Raffler items
* `userLogoFile` - logo for your thingy
* `userLogoLink` - click logo and go somewhere

Here's how you make Raffler use your stuff

* `/assets/js/app/init.js` - change the line `Raffler.userOptionsMerge = false` to `true`
* `/assets/js/app/raffler_user_options_disabled.json` - remove the `_disabled` part and fill in the appropriate values

```json
{
  "userDataFile": "/assets/json/floobidy-hoo.json",
  "userLogoFile": "/assets/images/jamma-mamma.png",
  "userLogoLink": "http://ohmanwhat.omg"
}
```

#### Third-Party Help

* [Javascript Standard Style Guide](https://github.com/standard/standard)
* [JS File Saving](https://github.com/eligrey/FileSaver.js)
* [CSV to JSON](https://github.com/Keyang/node-csvtojson)
* [Gulp](https://gulpjs.com)

#### Attribution

* Countdown sound &copy; [Comedy Central/The Daily Show](https://cc.com)
* Victory sound &copy; [320655__rhodesmas__level-up-01.mp3](http://freesound.org/people/shinephoenixstormcrow/sounds/337049/)
