type input = string | number | boolean | undefined | null;

export const c = (...args: input[]) => {
  return args.filter(Boolean).join(" ");
};

export default c;
