export class AuditInfo {
    appId: number;
    actionTime: number;
    schemaName: string;
    tableName: string;
    operation: string;
    username: string;
    newVal: string;
    oldVal: string;
}
