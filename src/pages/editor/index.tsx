import { useState } from "react";

export default function Editor({
  message = "Default",
  onEditorChange
}: {
  message?: string;
  onEditorChange?: (e: { detail: { count: number } }) => void;
}) {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    const newCount = count + 1;
    setCount(newCount);
    onEditorChange?.({ detail: { count: newCount } });
  };

  return (
    <div style={{ border: "2px dashed #4ade80", padding: "12px" }}>
      <h3>🛠️ React 编辑器</h3>
      <p>{message}</p>
      <button onClick={handleClick}>点击 +1（当前值：{count}）</button>
    </div>
  );
}