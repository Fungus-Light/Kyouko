const { ipcRenderer } = require('electron');
const AipSpeechClient = require('baidu-aip-sdk').speech;
const fs = require('fs');
const path = require('path');
const Async = require('async')
const { dialog } = require('electron').remote

let config = {
    version: '0.1.0a',
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
                SystemNotice('保存失败')
            } else {
                console.log('save-ok')
                SystemNotice('已经保存')
                isFileChanged = false;
                ChangeState();
                document.getElementById("quit-warning").close();
                ipcRenderer.send('quit-app');
            }

        });

    } else {
        document.getElementById("sys-notification").innerHTML = "未曾打开项目";
        document.getElementById("sys-notification").opened = true;
    }

});

$("#try-listen").click((e) => {
    
    let toSay = GenerateWhatToSay();
    console.log(toSay)

    let tempPath = "";
    let tempDir="";
    if (__dirname.includes('asar')) {//ES6大法好
        tempPath = path.join(process.cwd(),new Date().getTime().toString()+'test.mp3');
        tempDir=process.cwd();
    } else {
        tempPath = path.join(__dirname, 'temp',new Date().getTime().toString()+ "test.mp3");
        tempDir=path.join(__dirname, 'temp')
    }

    files=fs.readdirSync(tempDir);
    console.log(files);
    for(let i=0;i<files.length;i++){
        if(files[i].includes('.mp3')){
            fs.unlinkSync(path.join(tempDir,files[i]));
        }
    }
    
    console.log(tempPath)
    if (isOnline == true) {
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
                $("#test-player").remove();
                document.getElementById("waiting-bar").close();
                let player=document.createElement('audio');
                player.src=tempPath;
                player.setAttribute('controls',true);
                player.id="test-player"
                $("#player-bar")[0].appendChild(player)
                player.load();
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

$("#export-audio").click(() => {
    ExportAudio()
});

$("#import-text").click(() => {
    let path = dialog.showOpenDialogSync({
        title: "选择导入的文本",
        filters: [{
            name: "纯文本",
            extensions: ["txt"]
        }],
        buttonLabel: "导入"
    });
    console.log(path)
    if (path) {
        if (typeof path[0] == 'string') {
            console.log('opening')
            document.getElementById("waiting-bar").showModal();
            require('fs').readFile(path[0], { encoding: 'utf-8' }, (err, data) => {
                document.getElementById("waiting-bar").close();
                if (err) {
                    console.log(err);
                    document.getElementById("sys-notification").innerHTML = "导入文件失败";
                    document.getElementById("sys-notification").opened = true;
                } else {
                    let t_array = data.split('\n');
                    console.log(t_array)
                    for (let i = 0; i < t_array.length; i++) {
                        console.log(t_array[i]);
                        let _id = TextListData.length;
                        console.log(_id);
                        let t_item = new DataItem(_id, '序号' + _id.toString(), "新增段落", t_array[i], config.default.speaker, config.default.speed, config.default.tune, config.default.volum);
                        console.log(t_item)
                        TextListData.push(t_item);

                    }
                    console.log(TextListData)
                    RefreshList();
                    document.getElementById("sys-notification").innerHTML = "导入成功";
                    document.getElementById("sys-notification").opened = true;
                    isFileChanged = true;
                    ChangeState();
                }
            })
        }
    }

});

$("#ex-all").click((e) => {

    let APP_ID = config.baidu.appID;
    let API_KEY = config.baidu.appKey;
    let SECRET_KEY = config.baidu.secretKey;
    e.preventDefault()
    SaveEditItem();
    DisableEditor();
    SaveProject();
    if (isOnline == true) {
        
        let path = dialog.showOpenDialog({
            properties: ['openDirectory'],
            title: '选择输出文件夹',
            buttonLabel: '确认导出'
        }, (path) => {
            let realDiction = path[0];
            console.log(realDiction);
            if (realDiction) {
                document.getElementById("export-all-bar").showModal();
                let l = TextListData.length;
                let client = new AipSpeechClient(APP_ID, API_KEY, SECRET_KEY);
                let p = new Promise(function (resolve, reject) { resolve() })
                let successCount = 0;
                let failCount = 0;

                Async.eachSeries(TextListData, function (item, callback) {
                    setTimeout(function () {

                        //这个函数告诉eachSeries函数，这个异步操作状态，是成功了，还是失败了，传(false)null表示这个异步成功完成，true(1)执行失败，还未执行的不再执行
                        callback(null);
                        console.log(item);
                        client.text2audio(item.content,{
                            spd:item.speed,
                            pit:item.tune,
                            vol:item.volum,
                            per:item.speaker
                        }).then(function(result){
                            if(result.data){
                                let path=require('path').join(realDiction,item.id+'_'+item.title+'.mp3')
                                console.log(path)
                                
                                //console.log(file)
                                fs.writeFileSync(path,result.data);
                            }else{
                                throw "网络错误"
                            }
                        },function(err){
                            throw err;
                        });

                    }, 1000);

                }, function (err) {

                    console.log(err);
                    if(err){
                        
                        SystemNotice('发生错误,输出终止');
                    }else{
                        document.getElementById("export-all-bar").close();
                        require('electron').shell.showItemInFolder(realDiction)
                        SystemNotice('全部输出成功')
                    }
                    
                });

            }

        });
    } else {
        SystemNotice('当前离线，检查网络连接')
    }
});

$("#ex-txt").click(()=>{
    let content='';
    for(let i=0;i<TextListData.length;i++){
        content+=TextListData[i].content+'\n';
    }
    $("#ex-txt-value")[0].value=content;
    $('#export-txt-bar')[0].showModal();
});

$("#ex-txt-confirm").click(()=>{
    let path=dialog.showSaveDialogSync({
        title:'导出到纯文本',
        filters: [{
            name: "纯文本",
            extensions: ["txt"]
        }],
        buttonLabel:'导出'
    });
    console.log(path);
    fs.writeFile(path,$("#ex-txt-value")[0].value,(err)=>{
        $('#export-txt-bar')[0].close();
        if(err){
            console.log(err);
            
            SystemNotice('导出失败')
        }else{
            require('electron').shell.showItemInFolder(path)
            SystemNotice('导出成功')
        }
    })

})

//'will=quit'
ipcRenderer.on('will-quit', () => {
    if (isFileExist == true) {
        document.getElementById("quit-warning").showModal();
    } else {
        ipcRenderer.send('quit-app');
    }

});

// let autoSave = setInterval(function () {
//     if (isFileExist == true) {
//         SaveEditItem();
//         DisableEditor();
//         currentProject.currentLine = TextListData;
//         let text = JSON.stringify(currentProject);
//         document.getElementById("waiting-bar").showModal();
//         console.log(currentPath);
//         require('fs').writeFile(currentPath, text, (err) => {
//             document.getElementById("waiting-bar").close();
//             if (err) {
//                 console.log(err);
//                 SystemNotice('自动保存失败')
//             } else {
//                 console.log('save-ok')
//                 SystemNotice('自动保存成功');
//                 isFileChanged = true;
//                 ChangeState();
//             }

//         });

//     } else {

//     }
// }, 60000 * 5);