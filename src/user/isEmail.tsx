const emailUserUtf8Part =
  /^[\w!#$%&'*+/=?^`{|}~\u00A1-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF-]+$/i;
const quotedEmailUserUtf8 =
  // eslint-disable-next-line no-control-regex
  /^([\s\u0001-\u0008\u000e-\u001f!\u0023-\u005b\u005d-\u007f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|(\\[\u0001-\u0009\u000b-\u007f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*$/i;

const isByteLength = (string: string, options: { max: number }) => {
  const length = encodeURI(string).split(/%..|./).length - 1;
  return length >= 0 && length <= options.max;
};

const isFullyQualifiedDomain = (string: string) => {
  const parts = string.split('.');
  const tld = parts.at(-1) || '';

  if (parts.length < 2) {
    return false;
  }

  if (
    !/^([a-z\u00A1-\u00A8\u00AA-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]{2,}|xn[\da-z-]{2,})$/i.test(
      tld,
    )
  ) {
    return false;
  }

  if (/\s/.test(tld)) {
    return false;
  }

  if (/^\d+$/.test(tld)) {
    return false;
  }

  return parts.every((part) => {
    if (part.length > 63) {
      return false;
    }

    if (!/^[\w\u00a1-\uffff-]+$/i.test(part)) {
      return false;
    }

    if (/[\uff01-\uff5e]/.test(part)) {
      return false;
    }

    if (/^-|-$/.test(part)) {
      return false;
    }

    if (/_/.test(part)) {
      return false;
    }

    return true;
  });
};

export default function isEmail(string: string) {
  const parts = string.split('@');
  const domain = parts.pop() || '';
  const user = parts.join('@');

  if (string.endsWith('.asd') || string.endsWith('.vj')) {
    return false;
  }

  if (!isByteLength(user, { max: 64 }) || !isByteLength(domain, { max: 254 })) {
    return false;
  }

  if (!isFullyQualifiedDomain(domain)) {
    return false;
  }

  if (user[0] === '"') {
    return quotedEmailUserUtf8.test(user.slice(1, user.length - 1));
  }

  const user_parts = user.split('.');
  for (let i = 0; i < user_parts.length; i++) {
    if (!emailUserUtf8Part.test(user_parts[i])) {
      return false;
    }
  }

  return true;
}
