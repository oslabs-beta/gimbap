/**
 * Delay for a set number of milliseconds.
 * 
 * @param ms milliseconds to pause for
 */
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
