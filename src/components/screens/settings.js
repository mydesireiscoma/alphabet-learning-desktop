module.exports = {
  template: `
    <div class="screen">
      <div class="header">
        <div class="header__button" @click="navigateTo('main')">
          <i class="icon">arrow_back</i>
        </div>
        <div class="header__title">
          Settings
        </div>
      </div>
      Settings screen
    </div>
  `,
  computed: {},
  methods: {
    navigateTo (name) {
      this.$emit('navigate', name)
    }
  }
}
