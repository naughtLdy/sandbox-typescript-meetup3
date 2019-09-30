import { ActionTree, MutationTree, Plugin, GetterTree } from 'vuex';
import { ActionCreator } from 'vuex-typescript-fsa/lib/action-creator';
import { Module as VuexModule } from 'vuex';

/**
 * Definition for annotating type parameter
 */
export type PayloadType<T> = T extends ActionCreator<infer R> ? R : never;
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
export type StateType<
  T extends Module<any, any, any, any, any>
> = T extends Module<infer R, any, any, any, any> ? R : never;

export type RootStateType<T> = T extends Module<any, infer R, any, any, any>
  ? R
  : never;
export type GetterType<T> = T extends Module<any, any, infer R, any, any>
  ? R
  : never;
export type MutationType<T> = T extends Module<any, any, any, infer R, any>
  ? R
  : never;
export type ActionType<T> = T extends Module<any, any, any, any, infer R>
  ? R
  : never;

/**
 * Define getters with type annotation
 */
export function defineGetter<S, R>() {
  return function<GT extends GetterTree<S, R>>(options: GT) {
    return options;
  };
}

/**
 * Define module with type annotation
 */
export function defineModule<S, R = S>() {
  return function<
    GT extends GetterTree<S, R>,
    MT extends MutationTree<S>,
    AT extends ActionTree<S, R>,
    M extends Module<S, R, GT, MT, AT>
  >(module: M) {
    return module;
  };
}

/**
 * Enhanced type definition for Vuex Module
 */
export interface Module<
  S,
  R,
  GT extends GetterTree<S, R>,
  MT extends MutationTree<S>,
  AT extends ActionTree<S, R>
> extends VuexModule<S, R> {
  namespaced?: boolean;
  state?: S | (() => S);
  getters?: GT | GetterTree<S, R>;
  mutations?: MT | MutationTree<S>;
  actions?: AT | ActionTree<S, R>;
  modules?: {
    [K in keyof S]: Module<
      S[K],
      R,
      GetterTree<S[K], R>,
      MutationTree<S[K]>,
      ActionTree<S[K], R>
    >
  };
}

/**
 * Options for root store
 */
export interface StoreOptions<
  S,
  GT extends GetterTree<S, S>,
  MT extends MutationTree<S>,
  AT extends ActionTree<S, S>
> extends Module<S, S, GT, MT, AT> {
  plugins?: Plugin<S>[];
}

/**
 * Key for module
 */
interface ModuleKey {
  key: string;
  namespaced: boolean;
}

/**
 * Helper class for mapping values in store
 */
export class VuexMapper<
  M extends Module<{}, {}, any, any, any>,
  S extends Record<any, any> = StateType<M>
> {
  constructor(private keys: ModuleKey[]) {}

  module<K extends keyof M['modules']>(key: K, namespaced: boolean = false) {
    return new VuexMapper<M['modules'][K], S[K]>(
      this.keys.concat([
        {
          key,
          namespaced,
        } as ModuleKey,
      ]),
    );
  }

  normalizeMap(arrayOrMap: Array<any> | Record<string, Function | string>) {
    return Array.isArray(arrayOrMap)
      ? arrayOrMap.map(key => ({ key, value: key }))
      : Object.keys(arrayOrMap).map(key => ({ key, value: arrayOrMap[key] }));
  }

  /* eslint-disable */
  mapGetters<T extends keyof GetterType<M>>(
    map: Array<T>
  ): { [K in T]: () => ReturnType<GetterType<M>[K]> };
  mapGetters<T extends Record<string, keyof GetterType<M>>>(
    map: T
  ): { [K in keyof T]: () => ReturnType<GetterType<M>[T[K]]> };
  mapGetters(map: string[] | Record<string, string>): Record<string, Function> {
    const { keys } = this;
    return this.normalizeMap(map).reduce((res: any, item) => {
      return Object.assign(res, {
        [item.key]: function(this: any) {
          return findGetter(this.$store.getters, keys, item.value);
        },
      });
    }, {});
  }

  /* eslint-disable */
  mapState<T extends Record<string, ((state: S) => any)>>(
    map: T
  ): { [K in keyof T]: () => ReturnType<T[K]> };
  mapState<T extends Record<string, keyof S>>(
    map: T
  ): { [K in keyof T]: () => S[T[K]] };
  mapState<T extends keyof S>(map: Array<T>): { [K in T]: () => S[K] };
  mapState(
    map: string[] | Record<string, string> | Record<string, Function>
  ): Record<string, Function> {
    const { keys } = this;

    return this.normalizeMap(map).reduce((res: any, item) => {
      return Object.assign(res, {
        [item.key]: function(this: any) {
          const state = findState(this.$store.state, keys);
          return typeof item.value === 'function'
            ? item.value.call(this, state)
            : state[item.value];
        },
      });
    }, {});
  }
}

/**
 * find getter function by keys
 * @param source
 * @param keys
 * @param key
 */
function findGetter(source: any, keys: ModuleKey[], key: string) {
  const path = keys
    .filter(v => v.namespaced)
    .map(v => v.key)
    .join('/');
  if (path.length > 0) {
    return source[`${path}/${key}`];
  }
  return source[key];
}

/**
 * find state by keys
 * @param source
 * @param keys
 */
function findState(source: any, keys: ModuleKey[]) {
  return keys.reduce((acc, v) => {
    return acc[v.key];
  }, source);
}

/**
 * Factory function for VuexMapper
 *
 * e.g)
 * const mapper = createHelper<typeof store>().module('auth')
 * const vm = new Vue({
 *  computed: mapper.mapGetters(['isLoggedIn']);
 * });
 * vm.isLoggedIn; // boolean
 */
export function createHelper<
  M extends Module<any, any, any, any, any>,
  S = StateType<M>
  >() {
  return new VuexMapper<M, S>([]);
}
