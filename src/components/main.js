const Vue = require('vue/dist/vue.common')

const screenLanguages = require('./screens/languages')
const screenSettings = require('./screens/settings')
const screenMain = require('./screens/main')

module.exports = Vue.component('App', {
  components: {
    'screen-languages': screenLanguages,
    'screen-settings': screenSettings,
    'screen-main': screenMain
  },
  template: `
    <div class="main">
      <div class="loading" v-if="loading">
        Loading...
      </div>

      <div class="error" v-if="error">
        Something went wrong
      </div>

      <div class="quiz" v-if="!loading">
        <transition name="slide-up">
          <component v-bind:is="currentScreen"
                     @navigate="toScreen" keep-alive>
          </component>
        </transition>
      </div>
    </div>
  `,
  computed: {
    quiz () {
      return this.$store.getters.quiz
    },
    error () {
      return this.$store.getters.error
    },
    loading () {
      return this.$store.getters.loading
    },
    blured () {
      return this.currentScreen !== ''
    }
  },
  data () {
    return {
      currentScreen: 'screen-main',
    }
  },
  methods: {
    selectAlphabet () {
      console.log('ok')
    },
    toScreen (name) {
      this.currentScreen = 'screen-' + name
    }
  },
  mounted () {
    this.$store.dispatch('readAlphabetsFile')
  }
})
