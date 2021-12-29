# Athena Framework - DoorController v3 - Development Branch
<h4> Guys, it's finally in a very good state for now. So you can go ahead and test AthenaDoorController v3! ;)
<br><br>
<h4>It's just missing some stuff on vue/backend site, has a few bugs left, but i consider this good enough to make it available to everyone as the Development Branch. <br><br> If you find / want anything just let me know, i'll give my best to make it accessible as an OpenSource Project for anyone who's interested to learn a bit more about the AthenaFramework.<br><br>

# AthenaDoorController is looking for your help!
- So i've added somewhat example database json files.

- If you want to contribute to this plugin fork this repository and import the database files.

- Add new doors to the database and start a pull request, so we can have a full database list of all default doors. Please be careful about the namings i've made inside the example files.

# Features
- Build on the AthenaFramework
- Completly manage doors ingame
- Default Database Export Files with > 20 doors, 3 keys
- Full Database Integration. No Hardcoded .ts files.
- Configurable to your likings for example disableTextlabel, set range for all Labels, custom collection and more.

# Images (Not yet.)

# Setup (Vue3 / Athena Pages)
- Go to /src/src-webivews/pages and create a new Folder called "DoorController" in there.
- Copy the DoorController.vue file of the repos Webview folder inside of that folder.
- Please add the 2 lines there (Don't forget it.)
```typescript
import DoorController from './DoorController/DoorController.vue';

// Components ->    
DoorController: shallowRef(DoorController)
```
Imports Clientside ->
```typescript
import './AthenaDoorController/index';
import './AthenaDoorController/src/doors-vue';
import './AthenaDoorController/src/client-events-vue';
import './AthenaDoorController/src/client-functions';
import './AthenaDoorController/src/client-streamer';
```

Serverside -> 
```typescript
import './AthenaDoorController/index';
```
# Setup (Client-Plugins/Plugins Folder)
- Just import the stuff from AthenaDoorController_Client in a new folder here -> src/core/client-plugins/newFolderName

- Import the stuff from AthenaDoorController_Server in a new folder here -> src/core/plugins/newFolderName 

# Events (Scripting) - Not yet.
```typescript
// Clientside Events

// Serverside Events

// Vue To Client Events

// Client To Client Events

// Server To Server Events
```
Join my plugin discord -> https://discord.gg/Pk6gQ2agbQ
