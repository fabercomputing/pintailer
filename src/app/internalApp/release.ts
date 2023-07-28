export class Release {
    "releaseId": number;
    "releaseNumber": string;
    "clientOrganization": string;
    "createdBy": string;
    "modifiedBy": string;
    "createdDate": string;
    "modifiedDate": string;
    "closed": boolean;
    "clientProjectId": number;
}

export class ReleaseMap {
    "createdBy": string;
    "createdDate": string;
    "modifiedBy": string;
    "modifiedDate": string;
    "releaseId": number;
    "releaseMapId": number;
    "testCaseId": number;
    "testCaseIds": string[];
}