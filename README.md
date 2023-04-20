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
* run a local http server
`$ php -S 127.0.0.1:3000` or `$ python3 -m http.server 3000` or `$ ruby -run -e httpd . -p 3000`

Finally, check out [http://localhost:3000](http://localhost:3000) in a browser for your running instance!

To stop the local instance, issue a `Ctrl-C` at the command line where it's running.

### Tech Specs

*Raffler* uses [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) to keep data and options stateful, even in the event of a browser reload or crash.

*Raffler's* test data set comes from `config/raffler_data.json`, and it is structured as follows:

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

### User Options

Change the values in the test data set, or add your own user data file, which can be done thusly:

  1. Copy and rename the `/config/raffler_config.user.dist` file to `/config/raffler_config.user.json`.
  2. Update the contents of `/config/raffler_config.user.json` to use your values
  3. Use the following URL to enable: `https://example.domain/?enable_user_config=1`

An example of said file:

```json
{
  "dataFilePath": "./config/floobidy-hoo.json",
  "logoFilePath": "./assets/images/jamma-mamma.png",
  "logoFileLink": "http://ohmanwhat.omg",
  "talkifyKey": "123456ABCDEF"
}
```

The options that can be changed are as follows:

* `dataFilePath` - json file of Raffler items
* `logoFilePath` - logo for your thingy
* `logoFileLink` - click logo and go somewhere
* `talkifyKey` - API key for your [Talkify](https://manage.talkify.net) account (note: you must get a Talkify API key in order to have Raffler honor the "SOUND: NAME" option, which reads items as they are picked)

Optionally, you can add additional user items on the fly (this functionality is hidden by default, however) by using the settings menu (gear icon). The settings menu will also allow you to toggle special effects and, if you're on local or use the `?enable_debug_settings=1` query string flag, other debug stuff like stopping and starting a raffler in-process, re-initializing all data, and seeing all the potential items to be chosen.

#### Third-Party Help

* [JS File Saving](https://github.com/eligrey/FileSaver.js) for exporting results to text
* [Talkify](https://talkify.net) for reading the choice after a countdown
    * [Talkify JS library](https://github.com/Hagsten/Talkify)
