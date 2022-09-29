/* @flow */
/** @jsx h */

import { DEFAULT_VAULT } from '@paypal/sdk-constants/src';
import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

type MessageProps = {|
    ariaMessageId: string,
    ariaMessageRef: HTMLElement
|}

export function AriaMessage({ariaMessageId, message, ariaMessageRef} : MessageProps) : mixed {
    const messageRef = useRef()
    
    return (
        <div
            id={ariaMessageId}
            ref={ariaMessageRef}
        ></div>
    )
}