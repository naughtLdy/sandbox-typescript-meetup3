<template>
  <div class="container">
    <div>
      <p>{{ user1 }}</p>
      <p>{{ user2 }}</p>
      <p>{{ user3 }}</p>
      <p>{{ user4 }}</p>
      <p>{{ username }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Context } from '@nuxt/types'
import { FetchUser } from '~/store/modules/cs'
import { mapper } from '~/store'

const csMapper = mapper.module('csStore', true)

export default Vue.extend({
  computed: {
    user1() {
      return this.$store.state.csStore.user.name
    },
    user2() {
      return this.$store.getters['csStore/username']
    },
    user3(): string {
      return this.$store.state.csStore.user.name
    },
    ...csMapper.mapState({
      user4: (state) => state.user.name
    }),
    ...csMapper.mapGetters(['username'])
  },
  fetch({ store }: Context) {
    store.dispatch(FetchUser.namespaced({}))
  }
})
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
