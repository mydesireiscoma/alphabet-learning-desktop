const types = require('../../store/types')

const modal = require('../modal')

module.exports = {
  components: {
    modal
  },
  template: /*html*/`
    <div class="screen">
      <div class="header">
        <div class="header__button" @click="navigateTo('main')">
          <i class="icon">arrow_back</i>
        </div>
        <div class="header__title">
          Languages
        </div>
      </div>

      <!-- Downloading language modal -->
      <modal v-if="downloading">
        <h3 slot="header">Downloading</h3>
        <div slot="body">
          <div class="downloading">
            <div class="downloading__bar" :style="{ width: progress + '%'}">
            </div>
            <div class="downloading__percentage">{{ progress }}%</div>
          </div>
        </div>
      </modal>

      <!-- Available alphabets list -->
      <div v-for="language in languages">
        <div class="languages" v-for="alphabet in language.alphabets">
          <div class="languages__item" @click="select(language, alphabet)">
            {{ language.name }} - {{ alphabet.name }}
          </div>
        </div>
      </div>
    </div>
  `,
  computed: {
    languages () {
      return this.$store.getters.languages
    }
  },
  data () {
    return {
      progress: 0,
      downloading: false
    }
  },
  methods: {
    navigateTo (name) {
      this.$emit('navigate', name)
    },

    chunkDownloaded (progress) {
      this.progress = progress
      this.downloading = this.progress < 100
    },

    async select (language, alphabet) {
      // Prevent multiple clicks
      if (this.downloading) {
        return
      }

      // We have to load alphabet file. if it exists of course
      await this.$store.dispatch('loadAlphabet', { language, alphabet })

      // So, if it not exists - we have to download it
      if (!this.$store.getters.alphabet) {
        await this.$store.dispatch('downloadAlphabet', {
          language,
          alphabet,
          callback: this.chunkDownloaded
        })
      }

      // Tell to user, what it will reset his current progres.
      // So, if he agree - continue
      // Go to main screen otherwise
      this.$store.commit(types.QUIZ_START)

      // Go to quiz page
      this.$emit('navigate', 'main')
    }
  }
}
