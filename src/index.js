const Vue = require('vue/dist/vue.common');

const App = require('./components/main')
const store = require('./store')

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})