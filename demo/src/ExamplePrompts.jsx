import { useCallback, useState } from "react";
import { getRandomExamples } from "./examplePromptsData";

export default function ExamplePrompts({ onSelect }) {
  const [examples, setExamples] = useState(() => getRandomExamples(3));

  const refreshExamples = useCallback(() => {
    setExamples(getRandomExamples(3));
  }, []);

  return (
    <div className="example-prompts">
      <div className="example-prompts-header">
        <span className="example-prompts-label">Try an example:</span>
        <button
          type="button"
          className="refresh-btn"
          onClick={refreshExamples}
          title="Show different examples"
        >
          Refresh
        </button>
      </div>
      <div className="example-prompts-list">
        {examples.map((example, index) => (
          <button
            key={index}
            type="button"
            className="example-chip"
            onClick={() => onSelect(example)}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
