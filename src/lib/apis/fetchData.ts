import fetch, { Request } from 'node-fetch';
import { ZodSchema } from 'zod';

/**
 * Fetch data from any API endpoint that returns JSON formatted data.
 * @typeParam ReturnType - The expected type of the returned data.
 * @param request The [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) object to be passed to `fetch()`.
 * @param typeGuard The type guard to ensure the retrieved data is of the expected type. The retrieved data will be converted to JSON and passed as argument to this function.
 * **It is up to the developer to ensure the type guard works correctly!**
 * @returns A promise that resolves to the expected type or rejects with an [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error).
 */
export const fetchData = async <ReturnType>(request: Request, zodSchema: ZodSchema<ReturnType>): Promise<ReturnType> => {
    try {
        const response = await fetch(request);

        if (!response.ok) {
            return Promise.reject(new Error(`HTTP Error. Status: ${response.status}`));
        }

        let data;
        try {
            data = await response.json();
        } catch (e) {
            return Promise.reject(new Error(`Could not parse JSON. Make sure the endpoint at ${request.url} returns valid JSON. Error: ${String(e)}`));
        }

        const result = zodSchema.safeParse(data);

        if (!result.success) {
            return Promise.reject(result.error);
        }

        return Promise.resolve<ReturnType>(result.data);
    } catch (e) {
        return Promise.reject(new Error(`An error occured while fetching data from ${request.url}: ${String(e)}`));
    }
};
