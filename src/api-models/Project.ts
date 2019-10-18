export class Brand {
    icon: string;
    siteTitle: string;
}

export default class Project {
    id: string;
    title: string;
    description: string;
    websiteUrl: string;
    brand: Brand;
    siteMeta: string;
    createdAt: Date;
    deletedAt: Date;
    modifiedAt: Date;
    isDeleted: boolean;
    ownerId: string;
}
