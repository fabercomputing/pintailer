import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoginService } from '../internalApp/login.service';
import { NotificationComponent } from '../notification/notification.component';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private loginService: LoginService, private dialog: MatDialog) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            const errorResonse = JSON.stringify(err.error);

            if (err.status === 401) {
                // auto logout if 401 response returned from api
                const loginServiceInternal = this.loginService;
                if (errorResonse.charAt(0) != '{') {
                    this.openNotificationBar(errorResonse + ' Please Re-Login Again', 'error', 'normal');
                }
                setTimeout(function () {
                    // loginServiceInternal.logout();
                    // location.reload(true);
                }, 8000);

            } else {
                if (errorResonse.charAt(0) !== '{') {
                    this.openNotificationBar(errorResonse, 'error', 'normal');
                }
            }

            const error = err.error.message || err.statusText;
            return throwError(error);
        }));
    }

    openNotificationBar(message: string, type: string, action: string) {
        const dialogRef = this.dialog.open(NotificationComponent, {
            data: {
                notificaitonDataReceived: message,
                notificaitonTypeReceived: type,
                notificaitonActionReceived: action,
            },
            panelClass: 'notificaiton-dialog-container'
        });
        dialogRef.afterClosed().subscribe(result => {
        });
    }
}
