const { ipcRenderer } = require('electron');
const AipSpeechClient = require('baidu-aip-sdk').speech;
const fs = require('fs');
const path = require('path');

const { dialog } = require('electron').remote

let config = {
    version: '0.0.1',
    currentFile: '',
    default: {
        platform: null,
        speaker: null,
        speed: null,
        tune: null,
        volum:null
    },
    baidu: {
        appID: "",
        appKey: "",
        secretKey: ""
    },
    youdao: {
        appID: "",
        secretKey: ""
    },
    Google: false
};

let isGoolgeOn = false;

let currentPath = "";
let currentProject = null;

let isFileExist = false;
let isFileChanged = false;

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
    else if (event.ctrlKey && event.keyCode == 83&&(!event.shiftKey)) {
        SaveProject();
    }
    else if(event.ctrlKey&&event.keyCode==79){
        if(isFileExist==true){
            document.getElementById("continue-group").setAttribute('param', 'openproject');
            document.getElementById("FileExist-warning").showModal();
        }else{
            OpenProject();
        }
    }
    else if(event.ctrlKey&&event.shiftKey&&event.keyCode==83){
        SaveAsProjrct();
    }
}

//----------------------------------------------------------------------
LoadSettings();
InitDefaultLine();
//SetEditItem(DefaultItem, -1);
SetEditItem(TextListData[0], TextListData[0].id);
//----------------------------------------------------------------------

$("#e-edit-btn").click(() => {
    EnableEditor();
});

$("#e-diaedit-btn").click(() => {
    DisableEditor();
});

function LoadSettings() {
    console.log(process.execPath);
    console.log(__dirname);
    let configPath = "";
    if (__dirname.includes('asar')) {//ES6大法好
        configPath = path.join(process.cwd(), 'config.json');
    } else {
        configPath = path.join(__dirname, "config.json");
    }
    if (require('fs').existsSync(configPath)) {
        let _config = require("fs").readFileSync(configPath, {
            encoding: 'utf-8'
        });
        console.log(_config);
        config = JSON.parse(_config);
        $("#version-info")[0].innerText = "当前版本为：" + config.version;
        console.log(config);
        document.getElementById("baidu-app-id").value = config.baidu.appID;
        document.getElementById("baidu-app-key").value = config.baidu.appKey;
        document.getElementById("baidu-secret-key").value = config.baidu.secretKey;
        document.getElementById("youdao-app-key").value = config.youdao.appID;
        document.getElementById("youdao-secret-key").value = config.youdao.secretKey;
        if (config.Google) {
            document.getElementById("isGoogleOn").setAttribute("toggled", config.Google);
        }
        isGoolgeOn = config.Google;
        console.log(document.getElementById("default-platform").value);
        document.getElementById("default-platform").value = config.default.platform;
        $('#default-platform x-menuitem').removeAttr("toggled");
        $('#default-platform x-menuitem[value=\'' + config.default.platform + '\']').attr("toggled", "true");
        $('#default-speaker x-menuitem').removeAttr("toggled");
        document.getElementById("default-speaker").value = config.default.speaker;
        $('#default-speaker x-menuitem[value=\'' + config.default.speaker + '\']').attr("toggled", "true");
        document.getElementById("default-speed").value = config.default.speed;
        document.getElementById("default-tune").value = config.default.tune;
        document.getElementById("default-volume").value = config.default.volum;
        LoadContent();
    }

}

function SaveSettings() {
    config.baidu.appID = document.getElementById("baidu-app-id").value;
    config.baidu.appKey = document.getElementById("baidu-app-key").value;
    config.baidu.secretKey = document.getElementById("baidu-secret-key").value;
    config.youdao.appID = document.getElementById("youdao-app-key").value;
    config.youdao.secretKey = document.getElementById("youdao-secret-key").value;
    config.Google = isGoolgeOn;
    config.default.platform = document.getElementById("default-platform").value;
    config.default.speaker = document.getElementById("default-speaker").value;
    config.default.speed = document.getElementById("default-speed").value;
    config.default.tune = document.getElementById("default-tune").value;
    config.default.volum = document.getElementById("default-volume").value;
    console.log(config);

    let configPath = "";
    if (__dirname.includes('asar')) {//ES6大法好
        configPath = path.join(process.cwd(), 'config.json');
    } else {
        configPath = path.join(__dirname, "config.json");
    }

    let _config = JSON.stringify(config);
    require("fs").writeFile(configPath, _config, (err) => {
        if (err) {
            //alert("保存失败,查看控制台");
            let notification = document.getElementById('notification');
            notification.innerHTML = "保存失败,查看控制台";
            notification.opened = true;
            console.log(err);
        } else {
            //alert("保存成功");
            let notification = document.getElementById('notification');
            notification.innerHTML = "保存成功";
            notification.opened = true;
        }
    })
}

$('#newItemBtn').click((e) => {
    e.preventDefault();
    document.getElementById("newItemwin").showModal();
    document.getElementById('new-title').focus();
    //document.getElementById('new-title').setAttribute('');
});

$("#save-settings").click(() => {
    SaveSettings();
});

$("#isGoogleOn").click(() => {
    isGoolgeOn = !isGoolgeOn;
});

$("#newTextItem").click(() => {
    let _id = TextListData.length;
    let _title = document.getElementById('new-title').value;
    let _des = document.getElementById('new-description').value;
    let _content = document.getElementById('new-content').value;
    let newItem = new DataItem(_id, _title, _des, _content, config.default.platform, config.default.speaker, config.default.speed, config.default.tune, config.default.volum);
    TextListData.push(newItem);
    SetEditItem(newItem, _id);
    console.log(TextListData);
    AddTextItem(_id, _title, _des, _content);
    listRenderer.appendChild(document.createElement("hr"));
    $('#new-title').attr('value', '');
    $('#new-description').attr('value', '');
    $('#new-content').attr('value', '');
    document.getElementById("newItemwin").close();
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

$("#save-quit").click(()=>{
    SaveProject();
    document.getElementById("quit-warning").close();
    ipcRenderer.send('quit-app');
});

$("#try-listen").click((e) => {

    if (isOnline == true) {

        if (fs.existsSync('./test/test.mp3')) {
            fs.unlinkSync('./test/test.mp3');
        }

        let APP_ID = config.baidu.appID;
        let API_KEY = config.baidu.appKey;
        let SECRET_KEY = config.baidu.secretKey;
        e.preventDefault();
        document.getElementById("waiting-bar").showModal();
        let client = new AipSpeechClient(APP_ID, API_KEY, SECRET_KEY);
        client.text2audio('我是你哥哥,我和你都是你妈的儿子,你吼辣么大声干什么。你妈死了').then(function (result) {
            if (result.data) {
                console.log(result);
                fs.writeFileSync('./test/test.mp3', result.data);
                document.getElementById("waiting-bar").close();
                $("#test-player").attr('src', './test/test.mp3');
                document.getElementById("test-player").load();
                document.getElementById("listen-bar").showModal();
            } else {
                // 服务发生错误
                console.log(result);
            }
        }, function (err) {
            // 发生网络错误
            console.log(err);
        });

    } else {
        document.getElementById("sys-notification").innerHTML = "当前离线，请检查网络连接";
        document.getElementById("sys-notification").opened = true;
    }

});

function NewProject() {
    let path = dialog.showSaveDialogSync({
        title: "选择新文件位置",
        filters: [{
            name: "Kyouko files",
            extensions: ["kproject"]
        }],
        buttonLabel: "创建新文件",

    });
    console.log(path);
    console.log(typeof path)
    if (typeof path == "string") {
        document.getElementById("waiting-bar").showModal();
        let newProject = new KProject(config.version, path, []);
        let newProjectText = JSON.stringify(newProject);
        require('fs').writeFile(path, newProjectText, (err) => {
            document.getElementById("waiting-bar").close();
            if (err) {
                console.log(err);
                document.getElementById("sys-notification").innerHTML = "创建新项目失败，无法写入文件";
                document.getElementById("sys-notification").opened = true;
            } else {
                CleanTextArray();
                RefreshList();
                SetEditItem(DefaultItem);
                currentPath = path;
                currentProject = newProject;
                document.title = path;
                isFileExist = true;
                document.getElementById("sys-notification").innerHTML = "创建成功";
                document.getElementById("sys-notification").opened = true;

            }
        })
    }
}

function SaveAsProjrct(){
    console.log('SaveProject');
    if (isFileExist == true){
        SaveProject();
        
        let path=dialog.showSaveDialogSync({
            title:'另存为',
            filters:[{
                name:'Kyouko files',
                extensions: ["kproject"]
            }],
            buttonLabel:"保存"
        });
        if(typeof path=='string'){
            document.getElementById("waiting-bar").showModal();
            require('fs').writeFile(path,JSON.stringify(currentProject),(err)=>{
                document.getElementById("waiting-bar").close();
                if(err){
                    console.log(err);
                    document.getElementById("sys-notification").innerHTML = "保存失败";
                    document.getElementById("sys-notification").opened = true;
                }else{
                    currentPath=path;
                    document.title=path;
                    isFileExist=true;
                    RefreshList();
                    document.getElementById("sys-notification").innerHTML = "保存成功";
                    document.getElementById("sys-notification").opened = true;
                }
            });
        }
    }else{
        document.getElementById("sys-notification").innerHTML = "未曾打开项目";
        document.getElementById("sys-notification").opened = true;
    }
}

function SaveProject() {
    console.log('SaveProject');
    if (isFileExist == true) {
        SaveEditItem();
        console.log('s-e-i');
        DisableEditor();
        console.log('d-e');
        currentProject.currentLine = TextListData;
        let text = JSON.stringify(currentProject);
        //document.getElementById("waiting-bar").showModal();
        console.log(currentPath);
        require('fs').writeFile(currentPath, text, (err) => {
            //document.getElementById("waiting-bar").close();
            if (err) {
                console.log(err);
                document.getElementById("sys-notification").innerHTML = "保存项目失败";
                document.getElementById("sys-notification").opened = true;
            } else {
                console.log('save-ok')
                document.getElementById("sys-notification").innerHTML = "保存项目成功";
                document.getElementById("sys-notification").opened = true;
            }

        });
        //document.getElementById("waiting-bar").close();
    } else {
        document.getElementById("sys-notification").innerHTML = "未曾打开项目";
        document.getElementById("sys-notification").opened = true;
    }

}

function OpenProject(){
    console.log('open project');
    let path= dialog.showOpenDialogSync({
        title:"选择打开的项目",
        filters: [{
            name: "Kyouko files",
            extensions: ["kproject"]
        }],
        buttonLabel:"打开"
    });
    console.log('will open '+path[0]);
    console.log(typeof path[0]);
    if(typeof path[0]=='string'){
        console.log('opening')
        document.getElementById("waiting-bar").showModal();
        require('fs').readFile(path[0],{encoding:'utf-8'},(err,data)=>{
            document.getElementById("waiting-bar").close();
            if(err){
                console.log(err);
                document.getElementById("sys-notification").innerHTML = "打开项目失败";
                document.getElementById("sys-notification").opened = true;
            }else{
                currentProject=JSON.parse(data.toString());
                currentPath=path[0];
                isFileExist=true;
                document.title = path[0];
                let project=JSON.parse(data.toString());
                TextListData=project.currentLine;
                RefreshList();
                //SetEditItem(TextListData[0],TextListData[0].id);
                SetEditItem(DefaultItem,-1);
                document.getElementById("sys-notification").innerHTML = "打开成功";
                document.getElementById("sys-notification").opened = true;
            }
        })
    }
}

$("#open-project").click(()=>{
    if(isFileExist==true){
        document.getElementById("continue-group").setAttribute('param', 'openproject');
        document.getElementById("FileExist-warning").showModal();
    }else{
        OpenProject();
    }
});

$("#SaveProject").click(() => {
    SaveProject();
});

$("#SaveAsProject").click(()=>{
    SaveAsProjrct();
});

$("#continue-save").click(() => {
    let param = $("#continue-group").attr('param');
    console.log(param);
    if (param == "newproject") {
        SaveProject();
        NewProject();
    }else if(param=='openproject'){
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
    }else if(param=='openproject'){
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


$('#view-code').click(()=>{
    require('electron').shell.openExternal('https://github.com/Fungus-Light/Kyouko');
});

$("#view-electron").click(()=>{
    require('electron').shell.openExternal('https://electronjs.org/');
});

$(".help-doc").click(()=>{
    ipcRenderer.send('opendoc');
});

$("#fork-me").click(()=>{
    require('electron').shell.openExternal('https://github.com/Fungus-Light');
});

//'will=quit'
ipcRenderer.on('will-quit', () => {
    document.getElementById("quit-warning").showModal();
});



function LoadContent() {

}

