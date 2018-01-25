const types = require("../../store/types");

module.exports = {
  template: `
    <div class="screen blurable">
      <div class="header blurable">
        <div class="header__buttons">
          <div class="header__button">
            <i class="icon">exit_to_app</i>
          </div>
        </div>
        <div class="header__title">Main</div>
        <div class="header__buttons">
          <div class="header__button" @click="navigateTo('languages')">
            <i class="icon">translate</i>
          </div>
          <div class="header__button" @click="navigateTo('settings')">
            <i class="icon">settings</i>
          </div>
        </div>
      </div>
      <div class="quiz" v-if="quiz">
        <!-- <div class="quiz__progress">{{ progress }}</div> -->
        <div class="quiz__message">{{ message }}</div>
        <div class="quiz__question">{{ question }}</div>
        <div class="quiz__sentence">{{ sentence }}</div>
        <div class="quiz__options" v-if="options.length">
          <div class="quiz__option" v-for="option in options" @click="next(option)">
            {{ option.text }}
          </div>
        </div>
        <div class="quiz__input" v-else>
          <input type="text" @keydown.enter="nextByKeyboard"/>
        </div>
      </div>
      <div class="y" v-else>
        You need to select an alphabet
      </div>
    </div>
  `,
  computed: {
    options () {
      return this.$store.getters.options
    },
    quiz() {
      return this.$store.getters.quiz;
    },
    message() {
      return this.quiz.getMessage();
    },
    question() {
      return this.quiz.getQuestion();
    },
    sentence() {
      return this.quiz.getSentence();
    },
    progress() {
      return this.quiz.getProgress();
    },
    pronouncations() {
      return this.$store.getters.pronouncations
    }
  },
  methods: {
    nextByKeyboard (e) {
      // not implemented yet
    },
    navigateTo (name) {
      this.$emit('navigate', name)
    },
    next(option) {
      this.pronounce(option.original.description)
      this.$store.commit(types.QUIZ_NEXT, { answer: option.original.letter });
    },
    async pronounce(letter) {
      await this.$store.dispatch('loadPronouncation', {
        language: 'japanese',
        alphabet: 'katakana',
        letter
      });
      this.pronouncations[letter].play()
    }
  }
};
