import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const addKeyInterceptor: HttpInterceptorFn = (req, next) => {

    // console.log("interceptor start", req)
    if (req.url.startsWith( environment.backendUrl + '/api/')) {
        // Get Key from local storage
        const token = localStorage.getItem('key');

        // If token exists set as 'Authorization' header 
        if (token) {
            const authReq = req.clone({
                setHeaders: {
                    Authorization: token
                }
            });
            // console.log("interceptor result", authReq)
            return next(authReq);
        }
    }

    return next(req);
};