export default function encodeGlobalID(
  typename: string,
  id: string | number | bigint,
) {
  return `${typename}-${id}`;
}
