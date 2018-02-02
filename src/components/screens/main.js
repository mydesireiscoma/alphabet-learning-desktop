const types = require("../../store/types");

module.exports = {
  template: /*html*/`
    <div class="screen blurable">
      <div class="header blurable">
        <div class="header__buttons">
          <div class="header__button" @click="quit">
            <i class="icon">exit_to_app</i>
          </div>
        </div>
        <div class="header__title">{{ message }}</div>
        <div class="header__buttons">
          <div class="header__button" @click="navigateTo('languages')">
            <i class="icon">translate</i>
          </div>
          <!-- Not implemented yet -->
          <!-- <div class="header__button" @click="navigateTo('settings')">
            <i class="icon">settings</i>
          </div> -->
        </div>
      </div>
      <div class="quiz" v-if="quiz">
        <div class="quiz__progress" :style="{ width: progress + '%' }"></div>
        <div class="quiz__question" :class="{ wrong: wrongAnswer }">
          {{ question.text }}
        </div>
        <div class="quiz__sentence" v-show="sentence">
          {{ sentence }}
        </div>
        <div class="quiz__options" v-if="options.length">
          <div class="quiz__option" v-for="option in options" @click="next($event, option.text)">
            {{ option.text }}
          </div>
        </div>
        <div class="quiz__options" v-else>
          <input class="quiz__input" type="text" @keydown.enter="next($event)" v-focus/>
        </div>
      </div>
      <div class="quiz__no_alphabet" v-else>
        <p>You need to select an alphabet</p>
        <button class="quiz__button" @click="navigateTo('languages')">
          Select
        </button>
      </div>
    </div>
  `,
  data () {
    return {
      delay: false,
      wrongAnswer: false
    }
  },
  computed: {
    quiz() {
      return this.$store.getters.quiz;
    },
    options () {
      return this.$store.getters.options
    },
    question() {
      return this.$store.getters.question
    },
    message() {
      return this.$store.getters.message
    },
    sentence() {
      return this.$store.getters.sentence
    },
    progress() {
      return this.$store.getters.progress
    },
    pronouncations() {
      return this.$store.getters.pronouncations
    }
  },
  directives: {
    // Autofocus input field on insertion. Actually, stole from official docs
    focus: {
      inserted (el) {
        el.focus()
      }
    }
  },
  methods: {
    /**
     * Quit from the app
     */
    quit () {
      this.$emit('quit')
    },

    /**
     * Redirect user to another page
     * @param { string } name
     */
    navigateTo (name) {
      this.$emit('navigate', name)
    },

    /**
     * Answer current quiz question
     * By the fact, it will not switch to next question if answer is not
     * correct
     * @param { string } answer Answer text
     */
    async next(e, answer) {
      await this.$store.dispatch('saveState')

      // Prevent multiple clicks
      if (this.delay) return
      this.delay = true

      // If there is no answer, we can take it from input directly
      // Actually, for handle answer from text input
      if (!answer) answer = e.target.value

      // Pronounce question
      await this.pronounce()

      // We have to check if answer is correct
      if (this.quiz.isCorrect(answer)) {
        e.target.classList.add('right')

        // This delay allows us to prevent playing multiple pronouncations
        // in the same time, multiple clicks and fast switches betweeen
        // questions. i.e. its makes the quiz proccess more comfortable
        setTimeout(async () => {
          this.$store.commit(types.QUIZ_NEXT, { answer })

          // Pronounce next question if its score not big enough
          if (!this.$store.getters.question.remembered) {
            await this.pronounce()
          }

          this.delay = false
          e.target.classList.remove('right')
        }, 700)
      } else {
        // Play animations what will inform user about answer is not right
        this.wrongAnswer = true
        e.target.classList.add('wrong')

        setTimeout(() => {
          this.wrongAnswer = false
          this.delay = false
          e.target.classList.remove('wrong')
        }, 500)
      }
    },

    /**
     * Load pronouncation sound and play it. Or trying to do it at least
     */
    async pronounce () {
      await this.$store.dispatch('loadPronouncation')

      if (this.$store.getters.pronouncation) {
        this.$store.getters.pronouncation.play()
      }
    }
  }
};
