module.exports = {
  template: `
    <div class="screen">
      <div class="header">
        <div class="header__button" @click="navigateTo('main')">
          <i class="icon">arrow_back</i>
        </div>
        <div class="header__title">
          Languages
        </div>
      </div>
      <div v-for="language in languages">
        <div v-for="alphabet in language.alphabets" @click="selectAlphabet(language, alphabet)">
          {{ language.name }} - {{ alphabet.name }} / {{ alphabet.progress }}
        </div>
      </div>
    </div>
  `,
  computed: {
    opening () {
      return this.$store.getters.opening
    },
    languages () {
      return this.$store.getters.languages
    }
  },
  methods: {
    navigateTo (name) {
      this.$emit('navigate', name)
    },
    async selectAlphabet (language, alphabet) {
      if (alphabet.progress) {
        // prevent multiple downloads
        return
      }

      if (alphabet.downloaded) {
        await this.$store.dispatch('selectAlphabet', { language, alphabet })
        await this.$store.dispatch('rememberSelectedAlphabet', { alphabet })

        this.$store.dispatch('quizStart')

        this.$emit('select')
      } else {
        await this.$store.dispatch('downloadAlphabet', { language, alphabet })
      }
    }
  }
}
