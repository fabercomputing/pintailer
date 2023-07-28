export class AssetInfo {
    assetInfoId?: number;
    assetTypeId?: number;
    name: string;
    brand: string;
    model: string;
    serial: string;
    processor: string;
    ram: number;
    hd_type: string;
    hd_size: number;
    os_version: string;
    os_type: string;
    comments: string;
    imei: number;
    createdBy?: string;
    createdDate?: string;
    modifiedBy?: string;
    modifiedDate?: number;
    status: string;
  }