import { computed, ref } from "vue";
import { detectLocale, getMessages, persistLocale, type Locale } from "../i18n";

const locale = ref<Locale>(detectLocale());

export function useI18n() {
  const t = computed(() => getMessages(locale.value));

  const switchLocale = (next: Locale) => {
    locale.value = next;
    persistLocale(next);
  };

  return { locale, t, switchLocale };
}
