import { useState, useEffect, useRef } from "react";
export default function Editor({ message = "Default", onEditorChange }: { message?: string; onEditorChange?: (e: { detail: { count: number } }) => void }) {
    const [count, setCount] = useState(0);
    const [msg, setMsg] = useState(message);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setMsg(message);
    }, [message]);

    useEffect(() => {
      const handler = (e: any) => {
        setMsg(e.detail);
      };
      const node = rootRef.current?.parentElement;
      if (node) {
        node.addEventListener('set-message', handler);
      }
      return () => {
        if (node) {
          node.removeEventListener('set-message', handler);
        }
      };
    }, []);

    useEffect(() => {
      console.log('Editor props:', { message, onEditorChange });
    }, [message, onEditorChange]);

    const handleClick = () => {
      const newCount = count + 1;
      setCount(newCount);
  
      // 向外触发事件
      if (typeof onEditorChange === "function") {
        onEditorChange({ detail: { count: newCount } });
      }
    };
  
    return (
      <div ref={rootRef} style={{ border: "2px dashed #4ade80", padding: "12px" }}>
        <h3>🛠️ React 编辑器</h3>
        <p>{msg}</p>
        <button onClick={handleClick}>点击 +1（当前值：{count}）</button>
      </div>
    );
}
