const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;

const Vue = require('vue/dist/vue.common')

const screenLanguages = require('./screens/languages')
const screenSettings = require('./screens/settings')
const screenLoading = require('./screens/loading')
const screenMain = require('./screens/main')

module.exports = Vue.component('App', {
  components: {
    'screen-languages': screenLanguages,
    'screen-settings': screenSettings,
    'screen-loading': screenLoading,
    'screen-main': screenMain
  },
  template: `
    <div class="main">
      <transition name="slide-up">
        <component v-bind:is="currentScreen" @quit="quit" @navigate="toScreen" keep-alive>
        </component>
      </transition>
    </div>
  `,
  data () {
    return {
      currentScreen: 'screen-loading',
    }
  },
  methods: {
    quit () {
      remote.getCurrentWindow().close()
    },

    toScreen (name) {
      this.currentScreen = 'screen-' + name
    }
  },
  mounted () {
  },
  async created () {
    // Listen to main proccess, he have to tell us when app is being closed
    // Because we need to save user progress
    ipcRenderer.on('before-quit', async () => {
      await this.$store.dispatch('saveState')
    });
  }
})
