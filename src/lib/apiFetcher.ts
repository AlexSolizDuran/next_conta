
export const apiFetcher = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {

  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      let errorMsg = `Error ${res.status}`;
      let errData: any = {};
      try {
        const errData = await res.json();
        errorMsg = JSON.stringify(errData);
      } catch {
        // ya no, ignoramos si no es JSON
        errorMsg = errData.detail || errData.message || `Error ${res.status}: ${res.statusText}`;
      }
      if (options.body) {
        if (isFormData) {
          console.error("Body (FormData):");
          for (let [key, value] of (options.body as FormData).entries()) {
            console.error(key, value instanceof File ? value.name : value);
          }
        } else {
          console.error("Body (JSON):", options.body);
        }
      }
      throw new Error(errorMsg);
    }

    if (res.status === 204) return {} as T;

    return res.json() as Promise<T>;
  } catch (err: any) {
    console.error("API Fetcher caught an error:", err);
    throw err;
  }
};
