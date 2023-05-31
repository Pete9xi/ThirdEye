# ThirdEye
ThirdEye, two way chat between discord and minecraft along with logs for anticheats. integration for paradox anticheat but is also compatible with other anticheats as well as not having one install at all.
Support for BDS as well as Realms all this is configured in the config.json file. This does require nodejs to be installed on the host machine.

ThirdEye requires NodeJS, Most devices support NodeJS for example you can run this on a raspberry pi, old windows pc or mac device, old pc running a linux distro such as ubuntu.
<div align="center">
<h2>Main features</h2>
  <p>. Two way chat between discord and minecraft </p>
<p>. Full support for Paradox allowing you to run all commands via discord as you would in game. </p>
  <p>. Support for other anti cheats providing they use chat commands. </p>
  <p>. Player join messages including the device they are connecting with.</p>
  <p>. Player leave messages.</p>
  <p> . Device blacklist/whitelist. </p> 
  <p>. Support for BDS as well as Realms
</div>

<div align="center">
<hr>
<div align="center">
  <h2>Installing ThirdEye</h2>
  <p>This has been broken down in to three parts.<br>
  1. Creating the bot application<br>
  2. Configuring the client script<br>
  3. Installing NodeJS 18.16.0 LTS<br>
  </p>
  <h2>Creating the bot application</h2>
  <p>1. Head over to the discord developer portal. https://discord.com/developers/applications</p>
  <p>2. Click on create a new application</p>
  <img src="https://i.imgur.com/VV9JapE.png">
  <p>3. Give the bot a name for example ThirdEye. click in the check box and then the create button</p>
  <img src="https://i.imgur.com/LzsyYeY.png" style="width:400px;height:400px;">
  <p>4. Click on Bot in the left hand menu scroll down till you see <b>Message Content Intent and make sure its enabled using the toggle switch as see in the image</b>, under bot permissions enabled administrator. Then press save changes.</p>
  <img src="https://i.imgur.com/p5i2Dh8.png"style="width:1200px;height:400px;">
  <p>5. Next head other to oath and click on URL Generator as we now need to invite the bot to the 
discord server 
</p>
  <img src="https://i.imgur.com/Vs7YsK0.png"style="width:350px;height:150px;">
  <p>6. In this list of options select bot and administrator as see in the image below</p>
   <img src="https://i.imgur.com/tt2MlzI.png"style="width:900px;height:600px;">
  <p>Finally, copy the URL and paste it into your web browser to invite your bot 
to the discord server. This is located at the bottom of the page</p>
  <img src="https://i.imgur.com/uwu9rLh.png"style="width:900px;height:100px;">
  <p>At this point you should have the bot as member in your discord server. Once this has been completed proceed to the next step.</p>
  <p>7. The next step is to configure the script to talk to your bot in discord for this we need to head over to the bot 
page in the discord developer portal click on your application and then click on Bot from the menu on the left hand side.<p/>
    <img src="https://i.imgur.com/qeBb5nY.png"style="width:900px;height:300px;">
  <p>Click on the button called Reset Token this should present you the new token this now needs to be entered in the config.json file within the ThirdEye folder.</p>
  <img src="https://i.imgur.com/54jAjMQ.png"style="width:400px;height:100px;">
  <p> At this point the bot is now configured, the next part is to configure the client script.</p>
  
</div>
  <div align="center">
  <h2>Configuring the script.</h2>
    <p>Now you should have the discord application setup and joined to your discord server we can go ahead and get the reast of the client script configured.</p>
    <br>
    <p>1.	In the release folder open up the config.json file and make sure you have the bot token in the correct place.</p>
    <p>2. You will need an microsoft account with an xbox live profile make sure this has been done click <a href="https://login.live.com/oauth20_authorize.srf?client_id=1f907974-e22b-4810-a9de-d9647380c97e&scope=xboxlive.signin+openid+profile+offline_access&redirect_uri=https%3a%2f%2fwww.xbox.com%2fauth%2fmsa%3faction%3dloggedIn%26locale_hint%3den-GB&response_type=code&state=eyJpZCI6ImFhZmY0YWRhLTE0ODgtNGI5My04OWRkLTI2MWEzZjg1Zjg3NCIsIm1ldGEiOnsiaW50ZXJhY3Rpb25UeXBlIjoicmVkaXJlY3QifX0%3d%7chttps%253A%252F%252Fwww.xbox.com%252Fen-GB%252Flive&response_mode=fragment&nonce=766d06f1-3088-428b-a8d7-af260cca36d6&prompt=login&code_challenge=WvWuAJ9TJ-6boeIJTqqY8XG70UTr8B2mnXcX3qb7L9g&code_challenge_method=S256&x-client-SKU=msal.js.browser&x-client-Ver=2.32.2&uaid=6da647a314e84871bb685b8c2895d841&msproxy=1&issuer=mso&tenant=consumers&ui_locales=en-GB&client_info=1&epct=PAQABAAEAAAD--DLA3VO7QrddgJg7Wevr3QDocvJE1pB2_4MH_W2BJKeVKWI3Cj14b8l4kZ6doMjQ_jtL8JVMdO1YFrliiJr1phKCxAnwG_SDXI26gktT8dM3Da_DCo9c-CrBupVr9CrkonVRVxn09lr37TDL5zqAZYI_eJv15fs5mny-7-EIJ3T2ro6LFRox7vD3jWyw0f6tfOJnldr3kXvclbLLYME3nMgKjIRcpw0gtBmmhoFDGSAA&jshs=0#">here</a> to go to the login page. Once your account has been created and is ready to go put the email address in as seen in the image below. </p>
     <img src="https://i.imgur.com/GaybEXw.png"style="width:400px;height:50px;">
    <p>3.	Now if you’re running a realm set isRealm to true and enter the invite code, if you have a hosted bedrock dedicated server keep this set to false and follow step 4</p>
     <img src="https://i.imgur.com/jsRDLKl.png"style="width:400px;height:100px;">
    <p>4. For BDS servers you need to enter the IP address and Port number so the script can connect for example</p>
    <img src="https://i.imgur.com/znIGYEl.png"style="width:400px;height:100px;">
    <p>5.	Guild this is the id of the discord server you can find this by right clicking on the server in discord and clicking on copy id. Paste this into the guild field in the config file</p>
    <img src="https://i.imgur.com/tD7lMZk.png"style="width:200px;height:200px;">
    <p>6. The channel is the main channel you to be used with the chat relay between Discord and Minecraft, simply grab the ID by right clicking on the channel in discord and click on copy ID paste this into the file under channel as you have done before</p>
    <img src="https://i.imgur.com/Ozvja0y.png"style="width:500px;height:100px;">
    <p>7.	Next is getting a second channel setup for logging the anticheat while this is focused on Paradox it will have basic support for others as the project is open source you can fork the repository and add anything that is required, to log to a different channel enabled paradoxLogs</p>
    <img src="https://i.imgur.com/1GHzZuM.png"style="width:500px;height:100px;">
    <p>8.	CmdPrefix this is designed for paradox as you can change the command prefix in game, the default is set this will allow you to run commands like `!ban Pete9xi was spamming chat`, This can be changed to use with other anti cheats that support chat commands in game.</p>
    <p>9.	The on join player message is handled via a packet that will grab the relevant information this will include the players name as well as the device they are connecting with, in the event that a server fails to broadcast this as a backup you can enabled useSystemPlayerJoinMessage this will use the yellow message in game when a player joins and will send this back to discord</p>
    <img src="https://i.imgur.com/rkr5OcE.png"style="width:500px;height:50px;">
    <p>10. Embeds, the script is designed to send embeds back to discord, if enabled you can set the name as well as the colour via the settings below to enable them make sure you have useEmbed set to true and example can be seen below, the colour values are Red,Green,Blue (RBG). For eample Red = 255,0,0 </p>
  <img src="https://i.imgur.com/rQmtOs5.png"style="width:500px;height:200px;">
  <img src="https://i.imgur.com/ATbW5EB.png"style="width:500px;height:100px;">  
  <p> 12.	Admins, this controls who can run commands via discord when you send a command like !version it will check to make sure the user id is on the list in config.json if so it will allow the command to be sent to the server/realm if not it will be blocked. Right click your username and click on copy id. You can add multiple accounts see the example below <strong>Leave authType set to false at all times this means it will authenticate via xbox live only.</strong> </p>
    <img src="https://i.imgur.com/p6BInuc.png"style="width:500px;height:200px;">
    
    
</div>
  </div>
  <div align="center">
  <h2>Installing NodeJS</h2>
    <p>ThirdEye can be ran on any device that supports nodejs this can be a linux machine or windows pc it has also been tested on using a raspberry pi.</p>
    <br>
    <p>1.	Head over to the nodejs website and download the latest LTS release once this has downloaded run the installer and follow the instructions </p>
   <p>2.	</p>
   <p>3.	If you are running this on windows inlcuded in the relase folder is a batch file to install the required nodejs modules, just run the file and the modules will be installed if you are running this on another OS the npm commands are `npm i bedrock-protocol` and `npm i discord.js`</p>
   <p>4.	For windows there is an included batch file to start the script, if you are using another os you will need to launch the script for example `node main.js` </p>
  <img src="https://i.imgur.com/gKMX8wR.png"style="width:700px;height:100px;">
  <p> <strong> Note you will need to grant the client account server op status as well as paradox op. This is so messages from discord can be broadcasted to chat and that the paradox logs can be sent back also make sure cheat notifications are enabled by running !notify</strong>.</p>
  <img src="https://i.imgur.com/bgzeDra.png"style="width:700px;height:300px;">
  
   
    
    
</div>
  
<hr>
<div align="center">
  <h2>Get Support</h2>
  Head over to the <a href="https://discord.gg/WY34YxmQ">discord server</a> for support or post an issue on github.
  
  <p></p>
  
</div>

<div align="center">
  <h2>Project Status</h2>
  
</div>




