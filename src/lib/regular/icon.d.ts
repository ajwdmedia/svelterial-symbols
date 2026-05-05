import type { Component, ComponentProps } from 'svelte';
import IconComp from './Icon.svelte';
type Props = Omit<ComponentProps<typeof IconComp>, "svg">;
export declare const iconFactory: <T extends Record<string, string>>(svgs: T) => IconComp & { [X in keyof T]: Component<Props>; };
export type FactoryResult<T> = IconComp & { [X in keyof T]: Component<Props> };