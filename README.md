# Raffler

Click or tap the button and a cavalcade of pre-loaded names will begin to cycle animatedly on your screen. After a rousing "beep-boop" chorus concludes, one name, and one 
name only, will be selected and highlighted. That name will then be put on The List and will not be chosen again if the Raffler is re-run (until a reset, naturally).

Raffler uses localStorage to keep everything stateful, even in the event of a browser reload or crash.

Initial items that Raffler will choose from go in /json/raffler_items_initial.json. You can add additional items on the fly by using the admin menu (?admin=1 in 
querystring). The admin menu will also allow you to reset available and chosen items back to their initial values, as well as toggle sound and visual effects.
