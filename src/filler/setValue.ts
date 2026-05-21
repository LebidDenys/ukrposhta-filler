type NativeSetter = (this: Element, v: string) => void;

const inputValueSetter = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  "value",
)?.set as NativeSetter | undefined;

const textareaValueSetter = Object.getOwnPropertyDescriptor(
  HTMLTextAreaElement.prototype,
  "value",
)?.set as NativeSetter | undefined;

const selectValueSetter = Object.getOwnPropertyDescriptor(
  HTMLSelectElement.prototype,
  "value",
)?.set as NativeSetter | undefined;

function dispatch(el: Element, type: string): void {
  el.dispatchEvent(new Event(type, { bubbles: true }));
}

export function setNativeValue(el: Element, value: string): void {
  if (el instanceof HTMLInputElement && inputValueSetter) {
    inputValueSetter.call(el, value);
  } else if (el instanceof HTMLTextAreaElement && textareaValueSetter) {
    textareaValueSetter.call(el, value);
  } else if (el instanceof HTMLSelectElement && selectValueSetter) {
    selectValueSetter.call(el, value);
  } else {
    (el as HTMLInputElement).value = value;
  }
  dispatch(el, "input");
  dispatch(el, "change");
  dispatch(el, "blur");
}

export function isSelectOptionAvailable(
  select: HTMLSelectElement,
  value: string,
): boolean {
  return Array.from(select.options).some((o) => o.value === value);
}
