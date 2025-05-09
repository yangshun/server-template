export default function isValidPassword(password: string) {
  return password.length >= 6 && password.length <= 200;
}
