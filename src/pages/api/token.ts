const {RtcTokenBuilder, RtcRole} = require('agora-access-token');

import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next';

type Data = {
  token?: string,
  message?: string
}

const allowCors = (fn: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  );
  // if (req.method === 'OPTIONS') {
  //   res.status(200).end();
  //   return;
  // }
  return await fn(req, res);
};

const noCache = (fn: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Expires', '-1');
  res.setHeader('Pragma', 'no-cache');
  return await fn(req, res);
};

const handler = (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const appID = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AOGORA_APP_CERTIFICATE;
  const {channelName, uid} = req.query;
  
  const role = RtcRole.PUBLISHER;
 
  const expirationTimeInSeconds = 3600;
 
  const currentTimestamp = Math.floor(Date.now() / 1000);
 
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  if (!channelName) {
    return res.status(400).json({message: 'channel name is required'});
  }
  
  const token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);
 
  res.status(200).json({token});
};

module.exports = noCache(allowCors(handler));
