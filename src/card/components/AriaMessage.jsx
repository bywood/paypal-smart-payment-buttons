/* @flow */
/** @jsx h */

import { DEFAULT_VAULT } from '@paypal/sdk-constants/src';
import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

type MessageProps = {|
  ariaMessageId: string,
  ariaMessageRef: HTMLElement,
|};

export function AriaMessage({
  ariaMessageId,
  ariaMessageRef,
}: MessageProps): mixed {
  const messageRef = useRef();

  return (
    <div
      style={{ height: '1px', width: '1px', overflow: 'hidden' }}
      id={ariaMessageId}
      ref={ariaMessageRef}
    ></div>
  );
}
