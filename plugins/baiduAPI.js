const AipSpeechClient = require('baidu-aip-sdk').speech;
const fs = require('fs');

let APP_ID=null;
let API_KEY=null;
let SECRET_KEY=null;

let Speakers=[
    {
        name:"度小美",
        value:0
    },
    {
        name:"度小宇",
        value:1
    },
    {
        name:"度逍遥",
        value:3
    },
    {
        name:"度丫丫",
        value:4
    },
    {
        name:"度小娇",
        value:5
    }
];

let SpeedRange={
    min:0,
    mid:5,
    max:15
}

// let APP_ID = config.baidu.appID;
// let API_KEY = config.baidu.appKey;
// let SECRET_KEY = config.baidu.secretKey;