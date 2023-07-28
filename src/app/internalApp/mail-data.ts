export class MailData {
    notificationId: number;
    message: string;
    subject: string;
    username: string;
    userEmailId: string;
    attachmentPath: string;
    readFlg: boolean;
    readBy: string;
    createdDate: Date;
    modifiedDate: Date;
}

export class MailSend {
    supportType: string;
    visitorName: string;
    visitorEmail: string;
    visitorCompanyName: string;
    visitorContactNo: string;
    remarks: string;
}