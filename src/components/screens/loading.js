module.exports =  {
  template: `
    <div class="screen">
      Loading...
    </div>
  `,
  async created () {
    // Check, if user already have downloaded langugages
    await this.$store.dispatch('loadLanguages')

    // If no, we have to download it
    if (!this.$store.getters.languages) {
      await this.$store.dispatch('downloadLanguages')
    }

    // Then, we have to load saved app state, if exists
    await this.$store.dispatch('loadState')

    if (!this.$store.getters.quiz) {
      // If user have not saved state, we force him to select the language
      this.$emit('navigate', 'languages')
    } else {
      // If user have saved state, we just let him to continue
      this.$emit('navigate', 'main')
    }
  }
}
