import auth from '../views/auth/routes'
import chats from '../views/chats/routes'
import users from '../views/users/routes'
import wallets from '../views/wallets/routes'

export default [
    ...auth,
    ...chats,
    ...users,
    ...wallets
]