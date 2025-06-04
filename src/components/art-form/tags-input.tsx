import { useArtFormStore } from '@/lib/stores/art-form-store';
import MultiInput from '@/components/ui/multi-input';

export function TagsInput() {
  const { tags, currentTag, setTags, setCurrentTag } = useArtFormStore();

  return (
    <div className="space-y-2">
      <MultiInput
        inputs={tags}
        setInputs={setTags}
        currentInput={currentTag}
        setCurrentInput={setCurrentTag}
        placeholder="Add tags (press Enter after each tag)"
        maxInputs={5}
      />
      <div className="flex flex-wrap gap-2 mt-2">
        {Array.from(tags).map((tag) => (
          <div
            key={tag}
            className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full flex items-center gap-2"
          >
            <span className="text-black">{tag}</span>
            <button
              type="button"
              onClick={() => {
                setTags((prev) => {
                  const newTags = new Set(prev);
                  newTags.delete(tag);
                  return newTags;
                });
              }}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
