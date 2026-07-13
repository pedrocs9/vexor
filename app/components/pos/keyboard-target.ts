"use client";

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return true;
  }

  return target.isContentEditable || Boolean(target.closest("[contenteditable='true']"));
}
