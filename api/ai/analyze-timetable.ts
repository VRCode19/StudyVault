import app from '../../server/src/index.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: any, res: any) {
  return app(req, res);
}
