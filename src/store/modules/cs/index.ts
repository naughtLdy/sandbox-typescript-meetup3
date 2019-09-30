import { RootState } from '~/store'
import { defineModule, defineGetter } from '~/store/helpers';
import {
  actionCreatorFactory,
  combineMutation,
  combineAction,
  action,
  mutation
} from 'vuex-typescript-fsa'

interface User {
  name: string
}

export const namespace = 'csStore'
const actionCreator = actionCreatorFactory(namespace)

export const FetchUser = actionCreator<{}>('FETCH_USER')
export const ReceiveUser = actionCreator<User>('RECEIVE_USER')

export interface State {
  user: User
}

const initialState = (): State => {
  return {
    user: {
      name: ''
    }
  }
}

const getters = defineGetter<State, RootState>()({
  username(state): string {
    return state.user.name
  }
})

export const csModule = defineModule<State, RootState>()({
  namespaced: true,
  state: initialState,
  actions: combineAction(
    action(FetchUser, async function(context, action) {
      const user: User = {
        name: 'naughtLdy'
      }
      context.commit(ReceiveUser(user))
    })
  ),
  mutations: combineMutation(
    mutation(ReceiveUser, function(state, { payload }) {
      state.user = payload
    })
  ),
  getters
})
