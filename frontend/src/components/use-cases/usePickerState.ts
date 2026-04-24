import { computed, reactive, ref, watch } from "vue";
import {
  pickerQuestions,
  scoreAnswers,
  type PickerAnswers,
  type PickerQuestionId,
  type PickerResult,
} from "../../lib/use-cases";

const QUESTION_PARAM = ["q1", "q2", "q3", "q4", "q5"] as const;

function readFromUrl(): PickerAnswers {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const answers: PickerAnswers = {};
  pickerQuestions.forEach((q, i) => {
    const v = params.get(QUESTION_PARAM[i]);
    if (v && q.options.some((o) => o.id === v)) {
      answers[q.id] = v;
    }
  });
  return answers;
}

function writeToUrl(answers: PickerAnswers, stepIndex: number) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  pickerQuestions.forEach((q, i) => {
    const v = answers[q.id];
    if (v) params.set(QUESTION_PARAM[i], v);
    else params.delete(QUESTION_PARAM[i]);
  });
  if (stepIndex >= pickerQuestions.length) params.set("done", "1");
  else params.delete("done");
  const next = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
  window.history.replaceState(null, "", next);
}

export function usePickerState() {
  const answers = reactive<PickerAnswers>({});
  const stepIndex = ref(0);
  const direction = ref<"forward" | "back">("forward");

  const initial = readFromUrl();
  Object.assign(answers, initial);

  // start at the first unanswered question, but if done=1 in url, jump to result
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("done") === "1") {
      stepIndex.value = pickerQuestions.length;
    } else {
      const firstUnanswered = pickerQuestions.findIndex((q) => !answers[q.id]);
      stepIndex.value =
        firstUnanswered === -1 ? pickerQuestions.length : firstUnanswered;
    }
  }

  const currentQuestion = computed(() =>
    stepIndex.value < pickerQuestions.length
      ? pickerQuestions[stepIndex.value]
      : null,
  );

  const isComplete = computed(() => stepIndex.value >= pickerQuestions.length);
  const progress = computed(() => {
    const total = pickerQuestions.length;
    const answered = pickerQuestions.filter((q) => answers[q.id]).length;
    return Math.min(1, Math.max(answered / total, stepIndex.value / total));
  });

  const result = computed<PickerResult | null>(() =>
    isComplete.value ? scoreAnswers(answers) : null,
  );

  function select(questionId: PickerQuestionId, optionId: string) {
    answers[questionId] = optionId;
  }

  function next() {
    direction.value = "forward";
    stepIndex.value = Math.min(stepIndex.value + 1, pickerQuestions.length);
  }

  function back() {
    direction.value = "back";
    stepIndex.value = Math.max(stepIndex.value - 1, 0);
  }

  function reset() {
    for (const key of Object.keys(answers)) {
      delete answers[key as PickerQuestionId];
    }
    direction.value = "back";
    stepIndex.value = 0;
  }

  function goToStep(i: number) {
    direction.value = i < stepIndex.value ? "back" : "forward";
    stepIndex.value = Math.max(0, Math.min(i, pickerQuestions.length));
  }

  watch(
    [() => ({ ...answers }), stepIndex],
    () => writeToUrl(answers, stepIndex.value),
    { deep: true },
  );

  return {
    answers,
    stepIndex,
    direction,
    currentQuestion,
    isComplete,
    progress,
    result,
    select,
    next,
    back,
    reset,
    goToStep,
    totalSteps: pickerQuestions.length,
  };
}
