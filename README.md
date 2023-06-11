<div align="center">
    <img src="https://i.imgur.com/LEomQzi.png"style="width:200px;height:200px;">
  <h2>ThirdEye</h2>
  <p>ThirdEye is a tool that enables two-way chat between Discord and Minecraft, along with logs for anticheats. It has integration with Paradox anticheat but is also compatible with other anticheats or no anticheat at all. It supports both BDS and Realms, and the configuration is done in the config.json file. To use ThirdEye, Node.js needs to be installed on the host machine.</p>
  <p>ThirdEye requires Node.js. It can run on various devices, such as a Raspberry Pi, an old Windows PC or Mac, or an old PC running a Linux distro like Ubuntu.</p>
</div>

<div align="center">
  <hr>
  <div align="center">
    <h2>Main features</h2>
    <p>• Two-way chat between Discord and Minecraft</p>
    <p>• Full support for Paradox, allowing you to run all commands via Discord as you would in the game</p>
    <p>• Support for other anticheats that use chat commands</p>
    <p>• Player join messages, including the device they are connecting with</p>
    <p>• Player leave messages</p>
    <p>• Device blacklist/whitelist</p>
    <p>• Support for BDS and Realms</p>
  </div>
</div>

<div align="center">
  <hr>
  <div align="center">
    <h2>Installing ThirdEye</h2>
    <p>This has been broken down into three parts:</p>
    <p>1. Creating the bot application</p>
    <p>2. Configuring the client script</p>
    <p>3. Installing Node.js 18.16.0 LTS</p>
  </div>
</div>

 <div>
  <h2>Creating the bot application</h2>
  <p>1. Head over to the Discord Developer Portal: <a href="https://discord.com/developers/applications" target="_blank">https://discord.com/developers/applications</a></p>
  <p>2. Click on "Create a new application"</p>
  <img src="https://i.imgur.com/VV9JapE.png">
  <p>3. Give the bot a name (e.g., ThirdEye), check the checkbox, and click the "Create" button</p>
  <img src="https://i.imgur.com/LzsyYeY.png" style="width:400px;height:400px;">
  <p>4. Click on "Bot" in the left-hand menu, scroll down until you see "<b>Message Content Intent</b>", and make sure it's enabled using the toggle switch (as seen in the image). Under bot permissions, enable "Administrator". Then press "Save Changes"</p>
  <img src="https://i.imgur.com/p5i2Dh8.png" style="width:1200px;height:400px;">
  <p>5. Next, head over to "OAuth" and click on "URL Generator" as we now need to invite the bot to the Discord server</p>
  <img src="https://i.imgur.com/Vs7YsK0.png" style="width:350px;height:150px;">
  <p>6. In the list of options, select "Bot" and "Administrator" (as seen in the image below)</p>
  <img src="https://i.imgur.com/tt2MlzI.png" style="width:900px;height:600px;">
  <p>Finally, copy the URL and paste it into your web browser to invite your bot to the Discord server. This URL is located at the bottom of the page</p>
  <img src="https://i.imgur.com/uwu9rLh.png" style="width:900px;height:100px;">
  <p>At this point, you should have the bot as a member in your Discord server. Once this has been completed, proceed to the next step</p>
  <p>7. The next step is to configure the script to communicate with your bot on Discord. For this, we need to go to the bot page in the Discord Developer Portal. Click on your application and then click on "Bot" from the left-hand menu</p>
  <img src="https://i.imgur.com/qeBb5nY.png" style="width:900px;height:300px;">
  <p>Click on the button called "Reset Token". This should provide you with a new token. Copy this token and paste it into the "config.json" file within the ThirdEye folder</p>
  <img src="https://i.imgur.com/54jAjMQ.png" style="width:400px;height:100px;">
  <p>At this point, the bot is now configured. The next part is to configure the client script</p>
</div>

<div align="center">
  <h2>Configuring the script.</h2>
  <p>Now you should have the Discord application set up and joined to your Discord server. We can go ahead and get the rest of the client script configured.</p>
  <br>
  <p>1. In the release folder, open up the config.json file and make sure you have the bot token in the correct place.</p>
  <p>2. You will need a Microsoft account with an Xbox Live profile. Make sure this has been done. Click <a href="https://login.live.com/oauth20_authorize.srf?client_id=1f907974-e22b-4810-a9de-d9647380c97e&scope=xboxlive.signin+openid+profile+offline_access&redirect_uri=https%3a%2f%2fwww.xbox.com%2fauth%2fmsa%3faction%3dloggedIn%26locale_hint%3den-GB&response_type=code&state=eyJpZCI6ImFhZmY0YWRhLTE0ODgtNGI5My04OWRkLTI2MWEzZjg1Zjg3NCIsIm1ldGEiOnsiaW50ZXJhY3Rpb25UeXBlIjoicmVkaXJlY3QifX0%3d%7chttps%253A%252F%252Fwww.xbox.com%252Fen-GB%252Flive&response_mode=fragment&nonce=766d06f1-3088-428b-a8d7-af260cca36d6&prompt=login&code_challenge=WvWuAJ9TJ-6boeIJTqqY8XG70UTr8B2mnXcX3qb7L9g&code_challenge_method=S256&x-client-SKU=msal.js.browser&x-client-Ver=2.32.2&uaid=6da647a314e84871bb685b8c2895d841&msproxy=1&issuer=mso&tenant=consumers&ui_locales=en-GB&client_info=1&epct=PAQABAAEAAAD--DLA3VO7QrddgJg7Wevr3QDocvJE1pB2_4MH_W2BJKeVKWI3Cj14b8l4kZ6doMjQ_jtL8JVMdO1YFrliiJr1phKCxAnwG_SDXI26gktT8dM3Da_DCo9c-CrBupVr9CrkonVRVxn09lr37TDL5zqAZYI_eJv15fs5mny-7-EIJ3T2ro6LFRox7vD3jWyw0f6tfOJnldr3kXvclbLLYME3nMgKjIRcpw0gtBmmhoFDGSAA&jshs=0#">here</a> to go to the login page. Once your account has been created and is ready to go, put the email address in as seen in the image below.</p>
    <p>If you are having issues with creating a new Microsoft Account please see the video <a href="https://streamable.com/8ju9kr">here<a/></p>
  <img src="https://i.imgur.com/GaybEXw.png" style="width:400px;height:50px;">
  <p>3. Now, if you're running a realm, set "isRealm" to true and enter the invite code. If you have a hosted Bedrock Dedicated Server, keep this set to false and follow step 4.</p>
  <img src="https://i.imgur.com/jsRDLKl.png" style="width:400px;height:100px;">
  <p>4. For BDS servers, you need to enter the IP address and port number so the script can connect. For example:</p>
  <img src="https://i.imgur.com/znIGYEl.png" style="width:400px;height:100px;">
  <p>5. "Guild" is the ID of the Discord server. You can find this by right-clicking on the server in Discord and clicking on "Copy ID". Paste this into the "guild" field in the config file.</p>
  <img src="https://i.imgur.com/tD7lMZk.png" style="width:200px;height:200px;">
  <p>6. "Channel" is the main channel to be used with the chat relay between Discord and Minecraft. Simply grab the ID by right-clicking on the channel in Discord and clicking on "Copy ID". Paste this into the file under "channel" as you have done before.</p>
  <img src="https://i.imgur.com/Ozvja0y.png" style="width:500px;height:100px;">
  <p>7. Next, set up a second channel for logging the anticheat. While this is focused on Paradox, it will have basic support for others. As the project is open source, you can fork the repository and add anything that is required. To log the anticheat to a separate channel, set "ParadoxEnabled" to true.</p>
  <img src="https://i.imgur.com/1GHzZuM.png" style="width:500px;height:100px;">
  <p>8. "CmdPrefix" is designed for Paradox, as you can change the command prefix in-game. The default is set to "!", which will allow you to run commands like "!ban Pete9xi was spamming chat". This can be changed to use with other anti-cheats that support chat commands in-game.</p>
  <p>9. The "on join player message" is handled via a packet that will grab the relevant information. This will include the player's name as well as the device they are connecting with. In the event that a server fails to broadcast this as a backup, you can enable "useSystemPlayerJoinMessage". This will use the yellow message in-game when a player joins and will send this back to Discord.</p>
  <img src="https://i.imgur.com/rkr5OcE.png" style="width:500px;height:50px;">
  <p>10. Embeds: the script is designed to send embeds back to Discord. If enabled, you can set the name as well as the color via the settings below. To enable them, make sure you have "useEmbed" set to true. An example can be seen below. The color values are Red, Green, Blue (RGB). For example, Red = 255,0,0.</p>
  <img src="https://i.imgur.com/rQmtOs5.png" style="width:500px;height:200px;">
  <img src="https://i.imgur.com/ATbW5EB.png" style="width:500px;height:100px;">
  <p>12. "Admins" control who can run commands via Discord. When you send a command like "!version", it will check to make sure the user ID is on the list in config.json. If so, it will allow the command to be sent to the server/realm. If not, it will be blocked. Right-click your username and click on "Copy ID". You can add multiple accounts. See the example below. <strong>Leave "authType" set to false at all times; this means it will authenticate with Microsoft only. </strong></p>
  <img src="https://i.imgur.com/p6BInuc.png" style="width:500px;height:200px;">
</div>

  </div>
  <div align="center">
  <h2>Installing Node.js</h2>
    <p>ThirdEye can be run on any device that supports Node.js. This can be a Linux machine, Windows PC, or even a Raspberry Pi.</p>
    <br>
    <p>1. Head over to the Node.js website and download the latest LTS release. Once this has downloaded, run the installer and follow the instructions.</p>
   <p>2. If you are running this on Windows, included in the release folder is a batch file to install the required Node.js modules. Just run the file, and the modules will be installed. If you are running this on another OS, the npm commands are `npm i bedrock-protocol` and `npm i discord.js`.</p>
   <p>3. For Windows, there is an included batch file to start the script. If you are using another OS, you will need to launch the script. For example, `node start.js`.</p>
  <img src="https://i.imgur.com/gKMX8wR.png" style="width:700px;height:100px;">
  <p><strong>Note: You will need to grant the client account server OP status, as well as Paradox OP. This is so messages from Discord can be broadcasted to chat and the Paradox logs can be sent back. Also, make sure cheat notifications are enabled by running `!notify`.</strong></p>
  <img src="https://i.imgur.com/bgzeDra.png" style="width:700px;height:300px;">
</div>

<hr>
<div align="center">
  <h2>Get Support</h2>
  Head over to the <a href="https://discord.gg/WY34YxmQ">discord server</a> for support or post an issue on github.
  
  <p></p>
  
</div>

<div align="center">
  <h2>Credits</h2>
  <p> Graphics created by Kvr#7119</p>
</div>




