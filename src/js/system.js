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

        $('#default-speaker x-menuitem').removeAttr("toggled");
        document.getElementById("default-speaker").value = config.default.speaker;
        $('#default-speaker x-menuitem[value=\'' + config.default.speaker + '\']').attr("toggled", "true");
        document.getElementById("default-speed").value = config.default.speed;
        document.getElementById("default-tune").value = config.default.tune;
        document.getElementById("default-volume").value = config.default.volum;
    }

}

function SaveSettings() {
    config.baidu.appID = document.getElementById("baidu-app-id").value;
    config.baidu.appKey = document.getElementById("baidu-app-key").value;
    config.baidu.secretKey = document.getElementById("baidu-secret-key").value;
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
                isFileChanged = false;
                ChangeState();
            }
        })
    }
}

function SaveAsProjrct() {
    console.log('SaveProject');
    if (isFileExist == true) {
        SaveProject();

        let path = dialog.showSaveDialogSync({
            title: '另存为',
            filters: [{
                name: 'Kyouko files',
                extensions: ["kproject"]
            }],
            buttonLabel: "保存"
        });
        if (typeof path == 'string') {
            document.getElementById("waiting-bar").showModal();
            require('fs').writeFile(path, JSON.stringify(currentProject), (err) => {
                document.getElementById("waiting-bar").close();
                if (err) {
                    console.log(err);
                    document.getElementById("sys-notification").innerHTML = "保存失败";
                    document.getElementById("sys-notification").opened = true;
                } else {
                    currentPath = path;
                    document.title = path;
                    isFileExist = true;
                    RefreshList();
                    document.getElementById("sys-notification").innerHTML = "保存成功";
                    document.getElementById("sys-notification").opened = true;
                    isFileChanged = false;
                    ChangeState();
                }
            });
        }
    } else {
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
            }

        });

    } else {
        document.getElementById("sys-notification").innerHTML = "未曾打开项目";
        document.getElementById("sys-notification").opened = true;
    }

}

function OpenProject() {
    console.log('open project');
    let path = dialog.showOpenDialogSync({
        title: "选择打开的项目",
        filters: [{
            name: "Kyouko files",
            extensions: ["kproject"]
        }],
        buttonLabel: "打开"
    });
    console.log('will open ' + path[0]);
    console.log(typeof path[0]);
    if (typeof path[0] == 'string') {
        console.log('opening')
        document.getElementById("waiting-bar").showModal();
        require('fs').readFile(path[0], { encoding: 'utf-8' }, (err, data) => {
            document.getElementById("waiting-bar").close();
            if (err) {
                console.log(err);
                document.getElementById("sys-notification").innerHTML = "打开项目失败";
                document.getElementById("sys-notification").opened = true;
            } else {
                currentProject = JSON.parse(data.toString());
                currentPath = path[0];
                isFileExist = true;
                document.title = path[0];
                let project = JSON.parse(data.toString());
                TextListData = project.currentLine;
                RefreshList();
                SetEditItem(DefaultItem, -1);
                document.getElementById("sys-notification").innerHTML = "打开成功";
                document.getElementById("sys-notification").opened = true;
                isFileChanged = false;
                ChangeState();
            }
        })
    }
}

function GenerateWhatToSay() {
    return {
        text: e_content.value,
        per: e_speaker.value,
        speed: e_speed.value,
        vol: e_volum.value,
        pit: e_tune.value
    }
}

function SystemNotice(content) {
    document.getElementById("sys-notification").innerHTML = content;
    document.getElementById("sys-notification").opened = true;
}

function ChangeState() {
    if (isFileExist) {
        if (isFileChanged == true) {
            document.title = currentPath + '(已修改)'
        } else {
            document.title = currentPath
        }
    }

}

function ExportAudio() {
    let path = dialog.showSaveDialogSync({
        title: '导出到',
        filters: [{
            name: '音频文件',
            extensions: ["mp3"]
        }],
        buttonLabel: "导出"
    });
    if (typeof path == 'string') {

        let toSay = GenerateWhatToSay();
        if (isOnline == true) {

            if (fs.existsSync(path)) {
                fs.unlinkSync(path);
            }

            let APP_ID = config.baidu.appID;
            let API_KEY = config.baidu.appKey;
            let SECRET_KEY = config.baidu.secretKey;
            
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
                    fs.writeFile(path, result.data,(err)=>{
                        document.getElementById("waiting-bar").close();
                        if(err){
                            SystemNotice('导出失败')
                        }else{
                            SystemNotice('导出成功')
                        }
                    });
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

    }
}