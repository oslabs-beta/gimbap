import { ClientError } from './../../shared/types';

/**
 * Makes a GET fetch request.
 * 
 * @param url - URL to make fetch request to.
 * @returns Promise to generic data type or void if fetch failed.
 * 
 * @public
 */
export async function fetchWrapper<T>(url: string): Promise<T | void> {
  const response: Response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });


  const body: T | ClientError = await response.json();

  if (response.status !== 200) {
    console.error(`Server responded with status ${response.status}`);
  }
  if (typeof body === 'object' && (body as object).hasOwnProperty('error')) return console.error((body as ClientError).error);

  return body as T;
}
