const fs = require('fs')
const request = require('request')
const decompress = require('decompress')

const API_URI = 'http://alphabet-learning-files.herokuapp.com'
const APP_DATA = electron.getPath('userData')
const APP_TEMP = electron.getPath('temp')
const APP_LANGUAGES = `${APP_PATH_DATA}/languages.json`;

const alphabetApi = {
  getPronouncation (language, alphabet, letter) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(
        `${APP_DATA}/languages/japanese/katakana/sounds/${letter}.wav`
      )

      audio.oncanplay = () => {
        resolve(audio)
      }

      audio.onerror = (error) => {
        reject(error)
      }
    })
  },

  readAlphabetFile (language, alphabet) {
    return this.readFile(
      `${APP_PATH_DATA}/languages/${language}/${alphabet}/index.json`
    ).then((content) => {
      return JSON.parse(content)
    })
  },

  downloadAlphabet (language, alphabet, callback) {
    const remote = `${API_URI}/language?language=${language}&alphabet=${alphabet}`;
    const target = `${APP_PATH_DATA}/languages/${language}/${alphabet}`
    const local = `${APP_PATH_DATA}/${language}_${alphabet}.zip`;

    return new Promise((resolve, reject) => {
      return this.downloadFile(local, remote, (progress) => {
        callback(progress)
      }).then(() => {
        return decompress(local, target).then((files) => {
          fs.unlink(local, (error) => {
            return error ? reject(error) : resolve(true)
          });
        });
      });
    })
  },

  readAlphabetsFile () {
    return this.readFile(APP_LANGUAGES).then((content) => {
      return JSON.parse(content)
    })
  },

  saveAlphabetsFile (content) {
    return this.saveFile(APP_LANGUAGES, content)
  },

  downloadAlphabetsFile () {
    return new Promise((resolve, reject) => {
      request(API_URI, { json: true }, (error, response, body) => {
        return error ? reject(error) : resolve(body)
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
        setTimeout(() => {
          return error ? reject(error) : resolve(content)
        }, 1500)
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
          setTimeout(() => {
            resolve(true)
          }, 1500)
        } else {
          callback(parseFloat(bytesReceived / bytesTotal * 100).toFixed(2))
        }
      })

      req.on('end', resolve)
    })
  }
}

module.exports = alphabetApi
