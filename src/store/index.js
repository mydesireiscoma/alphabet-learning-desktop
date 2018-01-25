const Vue = require('vue/dist/vue.common')
const Vuex = require('vuex')

const alphabets = require('./modules/alphabets')

Vue.use(Vuex)

module.exports = new Vuex.Store({
  modules: {
    alphabets
  },
  strict: true
})
