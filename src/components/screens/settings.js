module.exports = {
  template: /*html*/`
    <div class="screen">
      <div class="header">
        <div class="header__button" @click="navigateTo('main')">
          <i class="icon">arrow_back</i>
        </div>
        <div class="header__title">
          <!-- Not implemented yet -->
          <!-- @TODO: Volume control (increase volume, decrease, disable) -->
          <!-- @TODO: Reset progress -->
          <!-- @TODO: Remove downloaded languages -->
        </div>
      </div>
    </div>
  `,
  computed: {},
  methods: {
    navigateTo (name) {
      this.$emit('navigate', name)
    }
  }
}
