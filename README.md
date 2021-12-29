# Athena Framework - DoorController v3 - Development Branch

# Setup (Vue-Page)
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

Join my plugin discord -> https://discord.gg/Pk6gQ2agbQ
