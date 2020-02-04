const _version_ = "0.0.1a";

const { app, BrowserWindow, Menu } = require('electron');
app.commandLine.appendSwitch("--disable-http-cache");
const { ipcMain } = require('electron');
const shell = require("electron").shell;
const { dialog } = require('electron');
const fs = require("fs");
// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win, helpdoc = null;

let MenuTemplate = [{
  label: '程序',
  submenu: [
    {
      label: '退出程序',
      role: 'quitapp',
      click: function () {
        app.quit();
      }
    }]
}, {
  label: '工具',
  role: 'tools',
  submenu: [{
    label: '刷新页面',
    role: "reload"
  }, {
    label: '强制刷新',
    role: 'forcereload'
  }, {
    label: '打开调试窗口',
    role: "toggledevtools"
  }]
}];

function createWindow() {
  // 创建浏览器窗口。
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 1000,
    minHeight: 700,
    useContentSize: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    }
  });

  let winMenu = Menu.buildFromTemplate(MenuTemplate);
  //Menu.setApplicationMenu(winMenu);

  // 加载index.html文件
  win.loadFile('index.html');
  // 打开开发者工具
  //win.webContents.openDevTools()

  // 当 window 将要关闭，这个事件会被触发。
  win.on('close', (e) => {
    e.preventDefault();
    win.webContents.send('will-quit');
  });

}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow()
  }
})

ipcMain.on('quit-app', (e) => {
  console.log('quit');
  win.destroy();
  app.quit();
});

ipcMain.on('opendoc', () => {
  if(helpdoc!=null){
    helpdoc.show();
  }else{
    helpdoc = new BrowserWindow({
      width: 1000,
      height: 700,
      minWidth: 1000,
      minHeight: 700,
      useContentSize: true,
      show:false,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false
      }
    });
    helpdoc.on('close',()=>{
      helpdoc=null;
    });
    helpdoc.loadFile('./DOCs/guide.html');
    helpdoc.show();
  }

  
})
// 在这个文件中，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。