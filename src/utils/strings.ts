export function random(
  length: number,
  options: { chars: boolean; lower: boolean } = { chars: true, lower: false }
): string {
  let text = '';
  let possible = '';
  if (!options.lower) possible += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  possible += 'abcdefghijklmnopqrstuvwxyz0123456789';
  if (options.chars) possible += '-_+%!';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}