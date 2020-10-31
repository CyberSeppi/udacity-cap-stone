import {Express} from "express";

export function applyCorsHeader(app: Express) {
    app.use((_req, _res, _next) => {
        _res.setHeader('Access-Control-Allow-Origin', '*');
        _res.setHeader('Access-Control-Allow-Credentials', 'true');
        _next();
    });
}
