const { ipcRenderer } = require('electron');
const AipSpeechClient = require('baidu-aip-sdk').speech;
const fs = require('fs');
const path = require('path');

const { dialog } = require('electron').remote

let config = {
    version: '0.0.1',
    currentFile: '',
    default: {
        speaker: null,
        speed: null,
        tune: null,
        volum: null
    },
    baidu: {
        appID: "",
        appKey: "",
        secretKey: ""
    }
};

let currentPath = "";
let currentProject = null;

let isFileExist = false;
let isFileChanged = false;

//bind shortcut
document.onkeyup = (event) => {
    if (event.ctrlKey && event.keyCode == 78) {
        //NewProject();
        if (isFileExist == true) {
            document.getElementById("continue-group").setAttribute('param', 'newproject');
            document.getElementById("FileExist-warning").showModal();
        } else {
            NewProject();
        }

    }
    else if (event.ctrlKey && event.keyCode == 83 && (!event.shiftKey)) {
        SaveProject();
    }
    else if (event.ctrlKey && event.keyCode == 79) {
        if (isFileExist == true) {
            document.getElementById("continue-group").setAttribute('param', 'openproject');
            document.getElementById("FileExist-warning").showModal();
        } else {
            OpenProject();
        }
    }
    else if (event.ctrlKey && event.shiftKey && event.keyCode == 83) {
        SaveAsProjrct();
    }
}

//----------------------------------------------------------------------
LoadSettings();
InitDefaultLine();
SetEditItem(TextListData[0], TextListData[0].id);
//----------------------------------------------------------------------

$("#e-edit-btn").click(() => {
    EnableEditor();
});

$("#e-diaedit-btn").click(() => {
    DisableEditor();
});


$('#newItemBtn').click((e) => {
    e.preventDefault();
    document.getElementById("newItemwin").showModal();
    document.getElementById('new-title').focus();
    //document.getElementById('new-title').setAttribute('');
});

$("#save-settings").click(() => {
    SaveSettings();
});

$("#newTextItem").click(() => {
    let _id = TextListData.length;
    let _title = document.getElementById('new-title').value;
    let _des = document.getElementById('new-description').value;
    let _content = document.getElementById('new-content').value;
    let newItem = new DataItem(_id, _title, _des, _content, config.default.speaker, config.default.speed, config.default.tune, config.default.volum);
    TextListData.push(newItem);
    SetEditItem(newItem, _id);
    console.log(TextListData);
    AddTextItem(_id, _title, _des, _content);
    listRenderer.appendChild(document.createElement("hr"));
    $('#new-title').attr('value', '');
    $('#new-description').attr('value', '');
    $('#new-content').attr('value', '');
    document.getElementById("newItemwin").close();
    isFileChanged = true;
    ChangeState();
});

$("#refresh-it-btn").click(() => {
    SaveEditItem();
    DisableEditor();
    RefreshList();
    if (TextListData.length > 0) {
        SetEditItem(TextListData[0], TextListData[0].id);
    } else {
        SetEditItem(DefaultItem, -1);
    }
});

$("#quit-app").click((e) => {
    e.preventDefault();
    document.getElementById("quit-warning").showModal();
});

$("#force-quit").click((e) => {
    document.getElementById("quit-warning").close();
    ipcRenderer.send('quit-app');
});

$("#save-quit").click(() => {
    SaveProject();
    document.getElementById("quit-warning").close();
    ipcRenderer.send('quit-app');
});

$("#try-listen").click((e) => {

    let toSay = GenerateWhatToSay();
    console.log(toSay)

    let tempPath = "";
    if (__dirname.includes('asar')) {//ES6大法好
        tempPath = path.join(process.cwd(), 'temp', 'test.mp3');
    } else {
        tempPath = path.join(__dirname, 'temp', "test.mp3");
    }

    if (isOnline == true) {

        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }

        let APP_ID = config.baidu.appID;
        let API_KEY = config.baidu.appKey;
        let SECRET_KEY = config.baidu.secretKey;
        e.preventDefault();
        document.getElementById("waiting-bar").showModal();
        let client = new AipSpeechClient(APP_ID, API_KEY, SECRET_KEY);
        client.text2audio(toSay.text, {
            spd: toSay.speed,
            pit: toSay.pit,
            vol: toSay.vol,
            per: toSay.per
        }).then(function (result) {
            if (result.data) {
                console.log(result);
                fs.writeFileSync(tempPath, result.data);
                document.getElementById("waiting-bar").close();
                $("#test-player").attr('src', tempPath);
                document.getElementById("test-player").load();
                document.getElementById("listen-bar").showModal();
            } else {
                // 服务发生错误
                console.log(result);
                document.getElementById("waiting-bar").close();
                SystemNotice("服务发生错误")
            }
        }, function (err) {
            // 发生网络错误
            console.log(err);
            document.getElementById("waiting-bar").close();
            SystemNotice("发生请求错误")
        });

    } else {
        SystemNotice("当前离线，检查网络连接")
    }

});

$("#open-project").click(() => {
    if (isFileExist == true) {
        document.getElementById("continue-group").setAttribute('param', 'openproject');
        document.getElementById("FileExist-warning").showModal();
    } else {
        OpenProject();
    }
});

$("#SaveProject").click(() => {
    SaveProject();
});

$("#SaveAsProject").click(() => {
    SaveAsProjrct();
});

$("#continue-save").click(() => {
    let param = $("#continue-group").attr('param');
    console.log(param);
    if (param == "newproject") {
        SaveProject();
        NewProject();
    } else if (param == 'openproject') {
        SaveProject();
        OpenProject();
    }
    $("#continue-group").attr('param', -1);
    document.getElementById("FileExist-warning").close();
});

$("#continue-nosave").click(() => {
    let param = $("#continue-group").attr('param');

    if (param == "newproject") {
        NewProject();
    } else if (param == 'openproject') {
        OpenProject();
    }

    $("#continue-group").attr('param', -1);
    document.getElementById("FileExist-warning").close();
});

$("#new-project").click(() => {
    //NewProject();
    if (isFileExist == true) {
        document.getElementById("continue-group").setAttribute('param', 'newproject');
        document.getElementById("FileExist-warning").showModal();
    } else {
        NewProject();
    }

});

$('#view-code').click(() => {
    require('electron').shell.openExternal('https://github.com/Fungus-Light/Kyouko');
});

$("#view-electron").click(() => {
    require('electron').shell.openExternal('https://electronjs.org/');
});

$(".help-doc").click(() => {
    ipcRenderer.send('opendoc');
});

$("#fork-me").click(() => {
    require('electron').shell.openExternal('https://github.com/Fungus-Light');
});

$("#export-audio").click(()=>{
    ExportAudio()
})

//'will=quit'
ipcRenderer.on('will-quit', () => {
    document.getElementById("quit-warning").showModal();
});

let autoSave = setInterval(function () {
    if (isFileExist == true) {
        SaveEditItem();
        DisableEditor();
        currentProject.currentLine = TextListData;
        let text = JSON.stringify(currentProject);
        document.getElementById("waiting-bar").showModal();
        console.log(currentPath);
        require('fs').writeFile(currentPath, text, (err) => {
            document.getElementById("waiting-bar").close();
            if (err) {
                console.log(err);
                SystemNotice('自动保存失败')
            } else {
                console.log('save-ok')
                SystemNotice('自动保存成功');
                isFileChanged = true;
                ChangeState();
            }

        });

    } else {

    }
}, 60000 * 5);