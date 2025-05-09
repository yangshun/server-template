import parseInteger from '@nkzw/core/parseInteger.js';
import decodeGlobalID from './decodeGlobalID.tsx';

export default function decodeIDOrThrow(type: string, globalID: string) {
  const { id, typename } = decodeGlobalID(globalID);
  const number = parseInteger(id);
  if (typename !== type || !number) {
    throw new Error(
      `Expected '${type}' but received '${typename}' with id '${id}'.`,
    );
  }
  return number;
}
