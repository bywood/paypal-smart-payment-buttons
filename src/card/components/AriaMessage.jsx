/* @flow */
/** @jsx h */

import { h } from 'preact';

type MessageProps = {|
  ariaMessageId: string,
  ariaMessageRef: HTMLElement,
|};

export function AriaMessage({
  ariaMessageId,
  ariaMessageRef,
}: MessageProps): mixed {

  return (
    <div
      style={{ height: '1px', width: '1px', overflow: 'hidden' }}
      id={ariaMessageId}
      ref={ariaMessageRef}
    />
  );
}
