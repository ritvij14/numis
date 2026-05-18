import { useCallback, useState } from "react";
import { getRandomExamples } from "./examplePromptsData";

export default function ExamplePrompts({ onSelect }) {
  const [examples, setExamples] = useState(() => getRandomExamples(4));

  const refreshExamples = useCallback(() => {
    setExamples(getRandomExamples(4));
  }, []);

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400">Try an example</span>
        <button
          type="button"
          onClick={refreshExamples}
          title="Show different examples"
          className="rounded px-2 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          Refresh
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {examples.map((example, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(example)}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
