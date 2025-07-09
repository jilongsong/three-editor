import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import reactToWebComponent from 'react-to-webcomponent';
import MyEditor from '../pages/editor/index';

function withWrapper(Component: React.ComponentType<{ message?: string; onEditorChange?: (e: { detail: { count: number } }) => void }>) {
  return function Wrapped(props: { message?: string; onEditorChange?: (e: { detail: { count: number } }) => void; dispatchEvent?: (event: Event) => void }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // 将 WebComponent 实例传递给子组件
      if (ref.current && ref.current.parentElement) {
        (ref.current as any).__wc = ref.current.parentElement;
      }
    }, []);

    const onEditorChange = (e: { detail: { count: number } }) => {
      // 优先用 props.dispatchEvent
      if (props.dispatchEvent) {
        props.dispatchEvent(new CustomEvent('editor-change', {
          detail: e.detail,
          bubbles: true,
          composed: true,
        }));
      } else if (ref.current && ref.current.parentElement) {
        ref.current.parentElement.dispatchEvent(new CustomEvent('editor-change', {
          detail: e.detail,
          bubbles: true,
          composed: true,
        }));
      } else {
        window.dispatchEvent(new CustomEvent('editor-change', {
          detail: e.detail,
          bubbles: true,
          composed: true,
        }));
      }
    };

    return <div ref={ref}><Component {...props} onEditorChange={onEditorChange} /></div>;
  };
}

const BaseWebComponent = reactToWebComponent(withWrapper(MyEditor), React, ReactDOM, {
  shadow: undefined,
});

class MyReactEditorElement extends (BaseWebComponent as typeof HTMLElement) {
  get message() {
    return this.getAttribute('message') || '';
  }
  set message(val: string) {
    this.setAttribute('message', val);
    if (typeof (this as any)._updater === 'function') {
      (this as any)._updater();
    }
  }
  setMessage(val: string) {
    this.message = val;
    this.dispatchEvent(new CustomEvent('set-message', { detail: val }));
  }
  triggerChange(detail: any) {
    this.dispatchEvent(new CustomEvent('editor-change', {
      detail,
      bubbles: true,
      composed: true,
    }));
  }
}

customElements.define('my-react-editor', MyReactEditorElement);