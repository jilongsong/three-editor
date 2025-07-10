import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import reactToWebComponent from 'react-to-webcomponent';
import MyEditor from '../pages/editor/index';

function withWrapper(Component: React.ComponentType<{ data?: string; onEditorChange?: (e: { detail: { count: number } }) => void }>) {
  return function Wrapped(props: any) {
    const ref = useRef<HTMLDivElement>(null);
    const [internalProps, setInternalProps] = React.useState(props);

    useEffect(() => {
      if (ref.current?.parentElement) {
        const wc = ref.current.parentElement as any;
        wc.updateProps = (newProps: any) => {
          setInternalProps((prev: any) => ({ ...prev, ...newProps }));
        };
      }
    }, []);

    const onEditorChange = (e: { detail: { count: number } }) => {
      if (props.dispatchEvent) {
        props.dispatchEvent(new CustomEvent('editor-change', {
          detail: e.detail,
          bubbles: true,
          composed: true,
        }));
      } else if (ref.current?.parentElement) {
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

    return <div style={{ width: '100%', height: '100%' }} ref={ref}><Component {...internalProps} onEditorChange={onEditorChange} /></div>;
  };
}

const BaseWebComponent = reactToWebComponent(withWrapper(MyEditor), React, ReactDOM, {
  shadow: undefined,
});

class MyReactEditorElement extends (BaseWebComponent as typeof HTMLElement) {
  static get observedAttributes() {
    return ['data'];
  }

  get data() {
    return this.getAttribute('data') || '';
  }

  set data(val: string) {
    this.setAttribute('data', val);
  }

  setData(val: any) {
    console.log('val', val)
    this.data = val;
  }

  triggerChange(detail: any) {
    this.dispatchEvent(new CustomEvent('editor-change', {
      detail,
      bubbles: true,
      composed: true,
    }));
  }

  updateProps?: (newProps: Partial<{ data: string }>) => void;

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'data' && oldValue !== newValue) {
      this.updateProps?.({ data: newValue });
    }
  }
}

customElements.define('my-react-editor', MyReactEditorElement);