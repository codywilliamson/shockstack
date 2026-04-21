document
  .querySelectorAll<HTMLButtonElement>("[data-alert-dismiss]")
  .forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const target = e.currentTarget as HTMLElement;
      target.closest(".alert")?.remove();
    });
  });
