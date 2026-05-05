import type { Component, ComponentProps } from 'svelte'
import IconComp from './Icon.svelte'

type Props = Omit<ComponentProps<typeof IconComp>, "svg">

export const iconFactory = <T extends Record<string, string>>(svgs: T): IconComp & { [X in keyof T]: Component<Props> } => {
    return new Proxy(IconComp, {
        get(_target, svg: keyof T | (string | symbol)) {
            // Thank you threlte for the following
            // Forward non-string keys (Symbols) to the underlying component.
            // Returning TComp directly (what we previously did) for symbols
            // caused Svelte 5.53+ DEV mode to accidentally call TComp via
            // internal symbol lookups (PROXY_PATH_SYMBOL).
            if (typeof svg !== 'string') {
            return Reflect.get(_target, svg)
            }

            const module = svgs[svg]

            if (module === undefined) {
                throw new Error(`Could not find Icon ${svg}`);
            }

            return ((internals, props) => {
                return IconComp(internals, { ...props, svg: module });
            }) satisfies Component<Props>
        }
    }) as IconComp & { [X in keyof T]: Component<Props> }
}

export type FactoryResult<T> = IconComp & { [X in keyof T]: Component<Props> };