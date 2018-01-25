const Vue = require('vue/dist/vue.common')

const alphabetLearning = require('../../alphabet-learning/dist/index')
const alphabetsApi = require('../../api/alphabets')
const types = require('../types')

const state = {
  quiz: null,
  options: [],

  alphabet: null,
  languages: null,

  saving: false,
  reading: false,
  opening: false,
  downloading: false,

  pronouncations: {}
}

const getters = {
  quiz: (state) => state.quiz,
  options: (state) => state.options,

  loading: (state) => state.saving || state.reading || state.downloading,
  error: (state, getters) => !getters.loading && !state.languages,
  alphabet: (state) =>  state.alphabet,
  languages: (state) => state.languages,
  opening: (state) => state.opening,
  pronouncations: (state) => state.pronouncations
}

const actions = {
  quizStart ({ commit, state }) {
    commit(types.QUIZ_START_REQUEST)

    try {
      const quiz = new alphabetLearning()
      quiz.start(state.alphabet)
      commit(types.QUIZ_START_SUCCESS, { quiz })
    } catch (error) {
      commit(types.QUIZ_START_FAILURE, { error })
    }
  },

  async loadPronouncation ({ state, commit }, { language, alphabet, letter }) {
    commit(types.ALPHABET_LOAD_AUDIO_REQUEST)

    let file = state.pronouncations[letter]

    if (file) {
      commit(types.ALPHABET_LOAD_AUDIO_SUCCESS, { file })
    } else {
      try {
        file = await alphabetsApi.getPronouncation(
          language,
          alphabet,
          letter
        )
        commit(types.ALPHABET_LOAD_AUDIO_SUCCESS, { letter, file })
      } catch (error) {
        commit(types.ALPHABET_LOAD_AUDIO_FAILURE, { error })
      }
    }
  },

  async rememberSelectedAlphabet ({ commit }, { language, alphabet }) {
    commit(types.ALPHABETS_REMEMBER_SELECTED_REQUEST)

    try {
      const result = await alphabetsApi.saveAlphabetsFile(state.languages)
      commit(types.ALPHABETS_REMEMBER_SELECTED_SUCCESS)
    } catch (error) {
      commit(types.ALPHABETS_REMEMBER_SELECTED_FAILURE)
    }
  },

  async selectAlphabet ({ commit, store }, { language, alphabet }) {
    commit(types.ALPHABET_LOAD_REQUEST)

    try {

      const result = await alphabetsApi.readAlphabetFile(
        language.name,
        alphabet.name
      )
      commit(types.ALPHABET_LOAD_SUCCESS, { alphabet: result })
      commit(types.ALPHABET_SELECT, { language, alphabet })
    } catch (error) {
      commit(types.ALPHABET_LOAD_FAILURE, { error })
    }
  },

  async downloadAlphabet ({ commit, state, dispatch }, { language, alphabet }) {
    commit(types.ALPHABET_DOWNLOAD_REQUEST, { alphabet })

    try {
      const downloadResult = await alphabetsApi.downloadAlphabet(
        language.name,
        alphabet.name,
        (progress) => {
          commit(types.ALPHABET_DOWNLOAD_PROGRESS, { alphabet, progress })
        }
      )
      commit(types.ALPHABET_DOWNLOAD_SUCCESS, { alphabet })
      dispatch('saveAlphabetsFile', { languages: state.languages })
    } catch (error) {
      commit(types.ALPHABET_DOWNLOAD_FAILURE, { error })
    }
  },

  async readAlphabetsFile ({ state, commit, dispatch }) {
    commit(types.ALPHABETS_READ_REQUEST)

    try {
      const languages = await alphabetsApi.readAlphabetsFile()
      commit(types.ALPHABETS_READ_SUCCESS, { languages })

      let language = null
      let alphabet = null
      state.languages.forEach((lang) => {
        alphabet = lang.alphabets.find((alph) => alph.selected)
        if (alphabet) {
          language = lang
        }
      })

      await dispatch('selectAlphabet', { language, alphabet })
      await dispatch('quizStart')
    } catch (error) {
      console.log(error)
      commit(types.ALPHABETS_READ_FAILURE, { error })
      dispatch('downloadAlphabetsFile')
    }
  },

  async saveAlphabetsFile ({ commit, dispatch }, { languages }) {
    commit(types.ALPHABETS_SAVE_REQUEST)

    try {
      const result = await alphabetsApi.saveAlphabetsFile(languages)
      commit(types.ALPHABETS_SAVE_SUCCESS)
    } catch (error) {
      commit(types.ALPHABETS_SAVE_FAILURE, { error })
    }
  },

  async downloadAlphabetsFile ({ commit, dispatch }) {
    commit(types.ALPHABETS_DOWNLOAD_REQUEST)

    try {
      const languages = await alphabetsApi.downloadAlphabetsFile()
      commit(types.ALPHABETS_DOWNLOAD_SUCCESS, { languages })
      dispatch('saveAlphabetsFile', { languages })
    } catch (error) {
      commit(types.ALPHABETS_DOWNLOAD_FAILURE, { error })
    }
  }
}

const mutations = {
  [types.ALPHABET_LOAD_AUDIO_REQUEST] () {
    // loading started...
  },

  [types.ALPHABET_LOAD_AUDIO_SUCCESS] (state, { letter, file }) {
    state.pronouncations[letter] = file
  },

  [types.ALPHABET_LOAD_AUDIO_FAILURE] (state, { error }) {
    console.log(error)
  },


  [types.ALPHABET_SELECT] (state, { language, alphabet }) {
    state.languages.forEach((lang) => {
      language.alphabets.forEach((alph) => {
        Vue.set(
          alph,
          'selected',
          language.name === lang.name && alphabet.name == alph.name
        )
      })
    })
  },


  [types.ALPHABETS_REMEMBER_SELECTED_REQUEST] (state) {

  },

  [types.ALPHABETS_REMEMBER_SELECTED_SUCCESS] (state) {

  },

  [types.ALPHABETS_REMEMBER_SELECTED_FAILURE] (state) {

  },

  [types.QUIZ_NEXT] (state, { answer }) {
    state.quiz.next(answer)
    state.options = state.quiz.getOptions()
  },

  [types.QUIZ_START_REQUEST] (state) {
    state.quiz = null
  },

  [types.QUIZ_START_SUCCESS] (state, { quiz }) {
    state.quiz = quiz
    state.options = state.quiz.getOptions()
  },

  [types.QUIZ_START_FAILURE] (state, { error }) {
    console.error('Failed to start quiz', error)
  },


  [types.ALPHABET_DOWNLOAD_REQUEST] (state, { alphabet }) {
    Vue.set(alphabet, 'progress', 'Connecting...')
  },

  [types.ALPHABET_DOWNLOAD_SUCCESS] (state, { alphabet }) {
    Vue.delete(alphabet, 'progress')
    Vue.set(alphabet, 'downloaded', true)
  },

  [types.ALPHABET_DOWNLOAD_FAILURE] (state, { error }) {
    Vue.set(alphabet, 'progress', 'Failure')
  },

  [types.ALPHABET_DOWNLOAD_PROGRESS] (state, { alphabet, progress }) {
    Vue.set(alphabet, 'progress', progress + '%')
  },


  [types.ALPHABET_LOAD_REQUEST] (state) {
    state.opening = true
  },

  [types.ALPHABET_LOAD_SUCCESS] (state, { alphabet }) {
    state.alphabet = Object.assign({}, alphabet)
    state.opening = false
  },

  [types.ALPHABET_LOAD_FAILURE] (state, { error }) {
    state.alphabet = null
    state.opening = false
  },


  [types.ALPHABETS_READ_REQUEST] () {
    state.languages = null
    state.reading = true
  },

  [types.ALPHABETS_READ_SUCCESS] (state, { languages }) {
    state.languages = languages
    state.reading = false
  },

  [types.ALPHABETS_READ_FAILURE] () {
    state.languages = null
    state.reading = false
  },


  [types.ALPHABETS_SAVE_REQUEST] () {
    state.saving = true
  },

  [types.ALPHABETS_SAVE_SUCCESS] () {
    state.saving = false
  },

  [types.ALPHABETS_SAVE_FAILURE] () {
    state.saving = false
  },


  [types.ALPHABETS_DOWNLOAD_REQUEST] () {
    state.downloading = true
  },

  [types.ALPHABETS_DOWNLOAD_SUCCESS] (state, { languages }) {
    state.languages = languages
    state.downloading = false
  },

  [types.ALPHABETS_DOWNLOAD_FAILURE] (state, { error }) {
    state.languages = null
    state.downloading = false
  }
}

module.exports = {
  // namespaced: true,
  state,
  getters,
  actions,
  mutations
}
