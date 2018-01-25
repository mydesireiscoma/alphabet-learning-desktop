var { app, BrowserWindow, protocol } = require('electron')
var path = require('path')
var url = require('url')

let appWindow;

function createWindow () {
  BrowserWindow.addDevToolsExtension('/home/tobermory/.config/google-chrome/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/4.0.1_0')

  appWindow = new BrowserWindow({ width: 800, height: 600 })

  appWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'src/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  appWindow.webContents.openDevTools()

  appWindow.on('closed', () => {
    appWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})