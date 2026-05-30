Get started

Install dependencies

npm install expo

restart typescript server

intitally ts.config might say extension not found restart typescript server and it should be fine.
if installing in windows 10 and the github repo clone goes to one drive.
1. please move git hub repo folder into c drive outside of one drive.
2. Remove android folder completely
3. run this command:  npx expo prebuild --clean    

if it isn't working initially:

run

npx expo start --clear

npx react-native start --reset-cache

especially if you are rebuilding it again.

Start the app

npx expo run:android
