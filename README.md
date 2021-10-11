# Athena Framework - Doorlock System
 
![image](https://user-images.githubusercontent.com/82890183/136729801-b86dc411-56e7-4d90-b8fb-a308143823b4.png)

### Features
* Add Doors Ingame
* Remove Doors Ingame
* Bind to factions
* Database over hardcoded JSON-List files.
* Interface has options to expand it with keys, player binding and whatever you want.

### SETUP

- Drop the client-plugins files into client-plugins.
- Drop the plugins files into plugins.

imports.ts (Clientside)
```typescript 
import './AthenaDoorlock/main';
import './AthenaDoorlock/wheelmenu';
```
imports.ts (Serverside)
```typescript
'./AthenaDoorlock/main',
'./AthenaDoorlock/interface',
```

### HOW TO USE
* Press NUM8 Ingame to open the doormenu (no admin check right now, everyone can use it actually, maybe ill add it next few days.)
* Put in a name in the input menu, name of the prop (gets hashed automatically) and maybe some faction id. (0 means everyone can use the door-interaction.)
* Doors can be removed in the wheelmenu of NUM8 as well.

### KNOWN ISSUES
* Sometimes native call of taskEnterVehicle fails. Hopefully its fixed, but i am not sure. If this happen to you let me know, you need to unload the plugin and restart your whole GTA client. So i keep branch at Development for now. If you find something else, let me know.

### OTHER
* Its hard to test stuff when you are alone but it should be synced for everyone.
* If you want to support this plugin, feel free to open a PR or Issue.
* Also let me know if you miss something (Athena Forum, or Issue here) 
* Can also report bugs here or in athena-forums.

https://forum.athenaframework.com/
