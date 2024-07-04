import fetch, { Request, RequestInfo, Response } from 'node-fetch';
import { ZodSchema } from 'zod';
import { Logger } from '../logger';

/**
 * Fetch data from any API endpoint that returns JSON formatted data.
 * @typeParam ReturnType - The expected type of the returned data.
 * @param request The [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) object to be passed to `fetch()`.
 * @param zodSchema The [Zod](https://github.com/colinhacks/zod) schema that the returned data conforms to. The promise will reject if the returned data does not conform to the schema provided.
 * @returns A promise that resolves to the expected type or rejects with an [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error).
 */
export const fetchForeignAPI = async <ReturnType = unknown>(request: RequestInfo, zodSchema: ZodSchema<ReturnType>, debug?: boolean): Promise<ReturnType> => {
    const req = new Request(request);

    let response: Response;
    try {
        response = await fetch(req);
    } catch (e) {
        throw new Error(`An error occured while fetching data from ${req.url}: ${String(e)}`);
    }

    if (!response.ok) {
        throw new Error(`HTTP Error. Status: ${response.status}`);
    }

    let data: unknown;
    try {
        data = await response.json();
    } catch (e) {
        throw new Error(`Could not parse JSON. Make sure the endpoint at ${req.url} returns valid JSON. Error: ${String(e)}`);
    }

    const result = zodSchema.safeParse(data);

    if (!result.success) {
        Logger.error("[zod] Data validation failed! Pass the 'debug' flag to 'fetchForeignAPI()' to print the retrieved data to the console.");
        Logger.error(`Endpoint location: ${req.url}.`);
        if (debug) {
            // winston doesn't usefully log object at the moment
            // eslint-disable-next-line no-console
            console.log('RETRIEVED DATA:', data);
        }
        result.error.issues.forEach((issue) => Logger.error(`[zod] Code: ${issue.code}, Path: ${issue.path.join('.')}, Message: ${issue.message}`));
        throw result.error;
    }

    return result.data;
};
