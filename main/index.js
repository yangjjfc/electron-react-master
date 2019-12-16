/*
 * @Author: yangjj
 * @Date: 2019-12-16 13:11:10
 * @LastEditors: yangjj
 * @LastEditTime: 2019-12-16 16:59:17
 * @Description: file content
 */
require('./menu');
import Updater from './update';
import getRenderUrl from './mainUrl';
import deviceid from './utils/deviceid.js';
import handleQuit from './event/quit';
import handleMessage from './event/message';
import onCrashed from './protect/crashed';
import createTray from './protect/tray';
import autoStart from './protect/autoStart';


const { app, BrowserWindow } = require('electron');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    transparent: true,
    // titleBarStyle: 'hidden',
    frame: false
  });
  mainWindow.loadURL(getRenderUrl()); //env/environment.html
  if (process.platform === 'win32') {
    mainWindow.on('close', (event) => {
      mainWindow.hide();
      mainWindow.setSkipTaskbar(true);
      event.preventDefault();
    });
  }
  global.mainId = mainWindow.id;
}

if (process.platform === 'win32') {
  const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
  if (shouldQuit) {
    app.quit()
  };
}

//生成或获取uuid
const devicePromise = deviceid.get(); 
app.on('ready', () => {
  devicePromise
    .then(() => Updater.init()) //更新检查
    .then(() => createWindow()) //打开窗口
    .then(() => handleMessage())//消息
    .then(() => onCrashed()) //崩溃重启
    .then(() => handleQuit()) //退出拦截
    .then(() => createTray())
    .then(() => { if (process.platform === 'win32') { autoStart() } })
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
});