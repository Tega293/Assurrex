// GTM means Google Teachable Machine here, not Google Tag Manager.
let cachedModel;
async function model() {
  if (!cachedModel) {
    cachedModel = import('@teachablemachine/image').then(({ load }) =>
      load('/gtm-model/model.json', '/gtm-model/metadata.json')
    ).catch(error => { cachedModel = null; throw error; });
  }
  return cachedModel;
}

export async function predictClaimCard(claimId) {
  const card = await fetch(`/api/claims/${claimId}/card`, { credentials: 'include' });
  if (!card.ok) throw new Error('Could not load the claim card for GTM.');
  const blobUrl = URL.createObjectURL(await card.blob());
  try {
    const image = new Image(); image.src = blobUrl; await image.decode();
    const scores = await (await model()).predict(image);
    const probabilities = { 'Valid Claim': 0, 'Invalid Claim': 0, 'Manual Review': 0 };
    for (const score of scores) {
      const label = score.className === 'Manual Claim' ? 'Manual Review' : score.className;
      if (!(label in probabilities)) throw new Error(`Unexpected GTM class: ${label}`);
      probabilities[label] = score.probability;
    }
    return probabilities;
  } finally { URL.revokeObjectURL(blobUrl); }
}
