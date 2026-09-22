// Curated starting points — OpenRouter's free-model roster shifts constantly,
// so this list will go stale. If a model here stops working, either swap
// its slug for a current one from openrouter.ai/models (filtered to Free),
// or just use the "Custom model" option in the picker instead of editing code.
export const CURATED_MODELS = [
  { id: 'openrouter/free', label: 'Auto (recommended)', description: 'Automatically picks a working free model' },
  { id: 'nvidia/nemotron-3-ultra:free', label: 'Nemotron 3 Ultra', description: 'Strong general reasoning' },
  { id: 'z-ai/glm-5.2:free', label: 'GLM 5.2', description: 'Fast, good for straightforward Q&A' },
  { id: 'qwen/qwen3.8-27b:free', label: 'Qwen3.8 27B', description: 'Large context, vision support' },
]