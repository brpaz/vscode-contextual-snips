import { getSnippetsPath } from '../snippets/utils';
import open from 'open';

export default async function (): Promise<unknown> {
  return await open(getSnippetsPath());
}
