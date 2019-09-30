import { createHelper, defineModule } from '~/store/helpers';
import * as csStore from '~/store/modules/cs'

export interface RootState {
  [csStore.namespace]: csStore.State
}

export const root = defineModule<RootState>()({
  modules: {
    [csStore.namespace]: csStore.csModule
  },
});

export const mapper = createHelper<typeof root, RootState>()
export const modules = root.modules
