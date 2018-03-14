const User = require('../db-api/user')
const mailer = require('../../main/mailer')
const { log } = require('../../main/logger')

module.exports = {
  find: ({ id, email, emailToken, provider } = {}) => {
    let query = {}

    if (id) {
      query = { id }
    } else if (email) {
      query = { email: email }
    } else if (emailToken) {
      query = { emailToken: emailToken }
    } else if (provider) {
      query = { [`${provider.name}.id`]: provider.id }
    }

    return User.get(query)
  },
  insert: (user) => User.create(user),
  update: (user) => User.update({ id: user.id, user }),
  remove: (id) => User.remove(id),
  serialize: (user) => {
    if (user.id) {
      return Promise.resolve(user.id)
    } else if (user._id) {
      return Promise.resolve(user._id)
    } else {
      return Promise.reject(new Error('Unable to serialise user'))
    }
  },
  deserialize: (id) => {
    return User.get({ id })
      .then((user) => {
        if (!user) return Promise.resolve(null)
        return Promise.resolve({
          id: user._id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          firstLogin: user.firstLogin
        })
      })
  },
  sendSignInEmail: async ({
    email = null,
    url = null
  } = {}) => {
    try {
      await mailer.send({ email, url })
    } catch (err) {
      log.error('Error sending email to ' + email, err)
    }
    log.debug('Generated sign in link ' + url + ' for ' + email)
  }
}
