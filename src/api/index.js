const fs = require('fs')
const path = require('path')
const request = require('request')
const electron = require('electron').remote.app
const decompress = require('decompress')

const API_URI = 'http://alphabet-learning-files.herokuapp.com'
const APP_DATA_DIR = electron.getPath('userData')
const APP_SAVE_DIR = path.join(APP_DATA_DIR, 'save')

const APP_LANGUAGES = `${APP_DATA_DIR}/languages.json`;

const alphabetApi = {
  loadLanguages () {
    return this.readFile(APP_LANGUAGES).then((data) => {
      return JSON.parse(data)
    })
  },

  downloadLanguages () {
    return new Promise((resolve, reject) => {
      request(API_URI, { json: true }, (error, response, body) => {
        if (!error) {
          this.saveFile(
            path.join(APP_DATA_DIR, 'languages.json'),
            body
          ).then(() => {
            resolve(body)
          }).catch((error) => {
            reject('err', error)
          })
        } else {
          reject(error)
        }
      });
    })
  },

  saveState(snapshotData) {
    if (!fs.existsSync(APP_SAVE_DIR)){
      fs.mkdirSync(APP_SAVE_DIR)
    }

    fs.writeFileSync(
      path.join(APP_SAVE_DIR, `save.json`),
      JSON.stringify(snapshotData)
    )
  },

  loadState() {
    return this.readFile(
      path.join(APP_SAVE_DIR, `save.json`)
    ).then((data) => {
      return JSON.parse(data)
    })
  },

  loadAlphabet(language, alphabet) {
    return this.readFile(
      path.join(APP_DATA_DIR, `/languages/${language}/${alphabet}/index.json`)
    ).then((data) => {
      return JSON.parse(data)
    })
  },

  loadPronouncation(language, alphabet, letter) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(
        `${APP_DATA_DIR}/languages/${language}/${alphabet}/sounds/${letter}.wav`
      )

      audio.oncanplay = () => {
        resolve(audio)
      }

      audio.onerror = (error) => {
        reject(error)
      }
    })
  },

  // OLD CODE BELOW
  downloadAlphabet (language, alphabet, callback) {
    const remote = `${API_URI}/language?language=${language}&alphabet=${alphabet}`;
    const target = `${APP_DATA_DIR}/languages/${language}/${alphabet}`
    const local = `${APP_DATA_DIR}/${language}_${alphabet}.zip`;

    return new Promise((resolve, reject) => {
      return this.downloadFile(local, remote, (progress) => {
        callback(progress)
      }).then(() => {
        return decompress(local, target).then((files) => {
          fs.unlink(local, (error) => {
            return error ? reject(error) : this.readAlphabetFile(language, alphabet)
          });
        });
      });
    })
  },

  saveFile(path, data) {
    return new Promise((resolve, reject) => {
      const content = JSON.stringify(data);

      fs.writeFile(path, content, (error) => {
        return error ? reject(error) : resolve(data)
      })
    })
  },

  readFile(path) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, 'utf-8', (error, content) => {
        return error ? reject(error) : resolve(content)
      })
    })
  },

  removeFile (path) {
    return new Promise((resolve, reject) => {
      fs.unlink(local, (error) => {
        return error ? reject(error) : resolve(path)
      })
    })
  },

  downloadFile (path, uri, callback){
    return new Promise((resolve, reject) => {
      let bytesReceived = 0
      let bytesTotal = 0
      let method = 'GET'

      const writeStream = fs.createWriteStream(path)
      const req = request({ method, uri })

      req.pipe(writeStream)

      req.on('response', (data) => {
        bytesTotal = parseInt(data.headers['content-length'])
      })

      req.on('data', (chunk) => {
        bytesReceived += parseInt(chunk.length)

        if (isNaN(bytesTotal)) {
          resolve(true)
        } else {
          callback(parseFloat(bytesReceived / bytesTotal * 100).toFixed(2))
        }
      })

      req.on('end', resolve)
    })
  }
}

module.exports = alphabetApi
