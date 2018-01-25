const fs = require('fs')
const Vue = require('vue/dist/vue.common');
const request = require('request')
const decompress = require('decompress');
const electron = require('electron').remote.app
const AlphabetLearning = require('./alphabet-learning/dist')

const API_URI = 'http://alphabet-learning-files.herokuapp.com'
const APP_PATH_DATA = electron.getPath('userData')
const APP_PATH_TEMP = electron.getPath('temp')
const APP_PATH_LANG = `${APP_PATH_DATA}/languages.json`;

const store = require('./store')
const App = require('./components/main')

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})

// allow to create quiz instance without passing the alphabet
// use promises everywhere
//
// divide app to components

// new Vue({
//   el: '#quiz',
//   data () {
//     return {
//       quiz: null,
//       screen: 'main',
//       languages: [],
//       alphabet: {},
//       stateLanguagesAreLoading: false
//     }
//   },
//   mounted () {
//     this.loadLanguages()
//   },
//   methods: {
//     switchScreen (screenName) {
//       this.screen = screenName;
//     },

//     selectAlphabet (language, alphabet) {
//       if (alphabet.downloaded) {
//         this.loadAlphabet(language.name, alphabet.name)
//       } else {
//         this.$set(alphabet, 'progress', 'Connecting...')
//         this.$set(alphabet, 'downloaded', false)

//         this.downloadAlphabet(language.name, alphabet.name, (progress) => {
//           this.$set(alphabet, 'progress', progress + '%')
//         }).then(() => {
//           delete alphabet.progress
//           this.$set(alphabet, 'downloaded', true)
//         })
//       }
//     },

//     loadAlphabet(lang, abc) {
//       fs.readFile(`${APP_PATH_DATA}/languages/${lang}/${abc}/index.json`, 'utf-8', (err, contents) => {
//         if (!err) {
//           this.alphabet = Object.assign({}, JSON.parse(contents));
//           this.quiz = new AlphabetLearning(this.alphabet)
//           this.quiz.start()
//         } else {
//           console.error('failed to load alphabet json', err)
//         }
//       });
//     },

//     loadLanguages () {
//       fs.readFile(APP_PATH_LANG, 'utf-8', (err, contents) => {
//         if (!err) {
//           this.languages = JSON.parse(contents);
//           this.stateLanguagesAreLoading = false;
//         } else {
//           this.downloadLanguages();
//         }
//       });
//     },

//     downloadLanguages () {
//       this.stateLanguagesAreLoading = true;
//       request(API_URI, { json: true }, (err, res, body) => {
//         this.stateLanguagesAreLoading = false;
//         this.saveLanguages(body);
//       });
//     },

//     saveLanguages (data) {
//       fs.writeFile(APP_PATH_LANG, JSON.stringify(data), (err) => {
//         if (!err) {
//           this.languages = data;
//         } else {
//           // show message what something went wrong
//         }
//       });
//     },

    // downloadAlphabet (lang, alph, cb) {
    //   const remote = `${API_URI}/language?language=${lang}&alphabet=${alph}`;
    //   const local = `${APP_PATH_DATA}/${lang}_${alph}.zip`;

    //   return this.downloadFile(local, remote, (a) => {
    //     cb(a)
    //   }).then(() => {
    //     this.languages
    //       .find((language) => language.name === lang)
    //       .alphabets
    //       .find((alphabet) => alphabet.name === alph)
    //       .downloaded = true;

    //     this.saveLanguages(this.languages);

    //     return decompress(local, `${APP_PATH_DATA}/languages/${lang}/${alph}`).then(files => {
    //       fs.unlink(local, (err) => {
    //         if (err) {
    //           console.log("failed to delete local image:"+err);
    //         }
    //       });
    //     });
    //   });
//     },

  //   downloadFile (savePath, downloadUri, callback){
  //     return new Promise((resolve, reject) => {
  //       var received_bytes = 0;
  //       var total_bytes = 0;

  //       var out = fs.createWriteStream(savePath);

  //       var req = request({
  //           method: 'GET',
  //           uri: downloadUri
  //       });

  //       req.pipe(out);

  //       req.on('response', (data) => {
  //         total_bytes = parseInt(data.headers['content-length']);
  //       });

  //       req.on('data', (chunk) => {
  //         received_bytes += parseInt(chunk.length);

  //         if (isNaN(total_bytes)) {
  //           setTimeout(() => {
  //             resolve();
  //           }, 1000)
  //         } else {
  //           callback(Math.floor(received_bytes / total_bytes * 100));
  //         }
  //       });

  //       req.on('end', () => {
  //         resolve();
  //       });
  //     });
  //   }
  // }
// })
