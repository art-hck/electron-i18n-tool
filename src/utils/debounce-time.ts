export function debounceTime() {
  let timer: ReturnType<typeof setTimeout>;

  return (cb: () => unknown, time: number) => {
    clearTimeout(timer);
    timer = setTimeout(() => cb(), time)
  }
}