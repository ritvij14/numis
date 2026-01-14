import { useCallback, useState } from "react";
import { getRandomExamples } from "./examplePromptsData";

export default function ExamplePrompts({ onSelect }) {
  const [examples, setExamples] = useState(() => getRandomExamples(3));

  const refreshExamples = useCallback(() => {
    setExamples(getRandomExamples(3));
  }, []);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-600">Try an example:</span>
        <button
          type="button"
          className="py-1 px-3 text-xs bg-gray-200 text-gray-700 border-none rounded cursor-pointer m-0 hover:bg-gray-300"
          onClick={refreshExamples}
          title="Show different examples"
        >
          Refresh
        </button>
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        {examples.map((example, index) => (
          <button
            key={index}
            type="button"
            className="py-2 px-4 text-sm bg-white text-gray-700 border border-gray-300 rounded-full cursor-pointer m-0 transition-all duration-150 hover:bg-gray-50"
            onClick={() => onSelect(example)}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
