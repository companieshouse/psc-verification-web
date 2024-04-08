export const addSearchParams = (uri: string, params: { [key: string]: string | string[] }): string => {
    // Get everything after the '?'
    const [baseUri, paramString] = uri.split("?");
    const searchParams = new URLSearchParams(paramString);
    Object.entries(params).forEach(([key, values]) => {
        if (Array.isArray(values)) {
            values.forEach((value) => {
                searchParams.append(key, value);
            });
        } else {
            searchParams.append(key, values);
        }
    });
    return [baseUri, searchParams.toString()].filter(Boolean).join("?"); // ignore falsy values
};
