const Vue = require('vue/dist/vue.common')
const Vuex = require('vuex')
const Quiz = require('../../src/alphabet-learning/dist')

const api = require('../api')
const types = require('./types')

Vue.use(Vuex)

const state = {
  languages: null,
  language: null,
  alphabet: null,
  pronouncation: null,
  pronouncations: {},

  quiz: null,
  message: '',
  options: [],
  question: '',
  sentence: '',
  progress: 0
}

const getters = {
  languages: state => state.languages,
  language: state => state.language,
  alphabet: state => state.alphabet,

  quiz: state => state.quiz,
  message: state => state.message,
  options: state => state.options,
  question: state => state.question,
  sentence: state => state.sentence,
  progress: state => state.progress,
  pronouncation: state => state.pronouncation
}

const actions = {
  // Read languages file if exists
  async loadLanguages ({ commit }) {
    commit(types.LANGUAGES_LOAD_REQUEST)

    try {
      const languages = await api.loadLanguages()
      commit(types.LANGUAGES_LOAD_SUCCESS, { languages })
    } catch (error) {
      commit(types.LANGUAGES_LOAD_FAILURE, { error })
    }
  },

  // Download languages file. Usually calls when language file is not exists
  async downloadLanguages({ commit }) {
    commit(types.LANGUAGES_DOWNLOAD_REQUEST)

    try {
      const languages = await api.downloadLanguages()
      commit(types.LANGUAGES_DOWNLOAD_SUCCESS, { languages })
    } catch (error) {
      commit(types.LANGUAGES_DOWNLOAD_FAILURE, { error })
    }
  },

  // Load alphabet file if exists
  async loadAlphabet({ commit }, { language, alphabet }) {
    commit(types.ALPHABET_LOAD_REQUEST)

    try {
      const data = await api.loadAlphabet(language.name, alphabet.name)
      commit(types.ALPHABET_LOAD_SUCCESS, { language, data })
    } catch (error) {
      commit(types.ALPHABET_LOAD_FAILURE, { error })
    }
  },

  // Downlaod alphabet file. Usually calls when alphabet file is not exists
  async downloadAlphabet({ commit }, { language, alphabet, callback }) {
    commit(types.ALPHABET_DOWNLOAD_REQUEST)

    try {
      const data = await api.downloadAlphabet(
        language.name,
        alphabet.name,
        callback
      )
      commit(types.ALPHABET_DOWNLOAD_SUCCESS, { data })
    } catch (error) {
      commit(types.ALPHABET_DOWNLOAD_FAILURE, { error })
    }
  },

  async loadPronouncation({ commit }) {
    try {
      const pronouncation = await api.loadPronouncation(
        state.language.name,
        state.alphabet.name,
        state.question.original.description
      )
      commit(types.PRONOUNCATION_LOAD_SUCCESS, { pronouncation })
    } catch (error) {
      // failed to load pronouncation
    }
  },

  // We have to save state on application exit
  saveState({ state, commit }) {
    if (state.quiz) {
      api.saveState({
        language: state.language,
        alphabet: state.alphabet,
        snapshot: state.quiz.getSnapshot()
      })
    }
  },

  // We have to load saved state when application launched
  async loadState({ state, commit }) {
    try {
      const data = await api.loadState()
      commit(types.LOAD_STATE_SUCCESS, { data })
    } catch (error) {
      // there is no saved state
    }
  },
}

const mutations = {
  // Load languages section
  [types.LANGUAGES_LOAD_REQUEST] (state) {
    state.languages = null
    console.log('request...')
  },

  [types.LANGUAGES_LOAD_SUCCESS] (state, { languages }) {
    state.languages = Object.assign({}, languages)
  },

  [types.LANGUAGES_LOAD_FAILURE] (state, { error }) {
    state.languages = null
  },

  // Download languages section
  [types.LANGUAGES_DOWNLOAD_REQUEST] (state) {
    state.languages = null
  },

  [types.LANGUAGES_DOWNLOAD_SUCCESS] (state, { languages }) {
    state.languages = Object.assign({}, languages)
  },

  [types.LANGUAGES_DOWNLOAD_FAILURE] (state, { error }) {
    state.languages = null
  },

  // Load alphabet file section
  [types.ALPHABET_LOAD_REQUEST] (state) {
    state.alphabet = null
  },

  [types.ALPHABET_LOAD_SUCCESS] (state, { language, data }) {
    state.language = language
    state.alphabet = data
  },

  [types.ALPHABET_LOAD_FAILURE] (state, { error }) {
    state.alphabet = null
  },

  // Download alphabet file section
  [types.ALPHABET_DOWNLOAD_REQUEST] (state) {
    state.alphabet = null
  },

  [types.ALPHABET_DOWNLOAD_SUCCESS] (state, { data }) {
    state.alphabet = data
  },

  [types.ALPHABET_DOWNLOAD_FAILURE] (state) {
    state.alphabet = null
  },

  [types.LOAD_STATE_SUCCESS] (state, { data }) {
    state.language = data.language
    state.alphabet = data.alphabet

    state.quiz = new Quiz()
    state.quiz.useSnapshot(data.snapshot)

    //@todo: Duplication...
    state.message = state.quiz.getMessage()
    state.options = state.quiz.getOptions()
    state.question = state.quiz.getQuestion()
    state.sentence = state.quiz.getSentence()
    state.progress = state.quiz.getProgress()
  },

  [types.QUIZ_START] (state) {
    state.quiz = new Quiz()
    state.quiz.start(state.alphabet)

    state.message = state.quiz.getMessage()
    state.options = state.quiz.getOptions()
    state.question = state.quiz.getQuestion()
    state.sentence = state.quiz.getSentence()
    state.progress = state.quiz.getProgress()
  },

  [types.QUIZ_NEXT] (state, { answer }) {
    state.quiz.next(answer)

    state.message = state.quiz.getMessage()
    state.options = state.quiz.getOptions()
    state.question = state.quiz.getQuestion()
    state.sentence = state.quiz.getSentence()
    state.progress = state.quiz.getProgress()
  },

  [types.PRONOUNCATION_LOAD_SUCCESS] (state, { pronouncation }) {
    Vue.set(
      state.pronouncations,
      state.question.original.description,
      pronouncation
    )

    state.pronouncation = pronouncation
  }
}

module.exports = new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  strict: true
})
