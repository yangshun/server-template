export default function isValidName(name: string) {
  if (name.length < 3 || name.length > 20) {
    return false;
  }

  return /^\w+$/.test(name);
}
