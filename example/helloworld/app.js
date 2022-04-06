export const app = {
  render() {
    return h("h1", `hello, ${world}`);
  },
  setup() {
    const msg = "world";
    return msg;
  },
};
