export const fetchJobDescriptionFromUrl = async (url: string): Promise<string> => {
  // 1. Client-side validation for URL format.
  let urlObject: URL;
  try {
    const urlWithProtocol = /^(https?:\/\/)/.test(url) ? url : `https://${url}`;
    urlObject = new URL(urlWithProtocol);
  } catch (_) {
    throw new Error('The URL you entered appears to be invalid. Please double-check it. It should look like "company.com/careers/job".');
  }

  const { hostname } = urlObject;
  const isIpAddress = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
  if (!hostname.includes('.') && hostname !== 'localhost' && !isIpAddress) {
     throw new Error(`The URL hostname "${hostname}" seems to be missing a top-level domain like '.com' or '.org'. Please provide a full and valid URL.`);
  }

  // 2. Inform the user that this feature is backend-dependent.
  throw new Error('Fetching job descriptions from URLs requires a backend service and is disabled in this environment. Please copy and paste the job description manually.');
};
