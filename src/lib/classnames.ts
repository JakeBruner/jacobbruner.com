type input = string | number | boolean | undefined | null;

export const classnames = (...args: input[]) => {
  return args.filter(Boolean).join(" ");
};

export default classnames;
