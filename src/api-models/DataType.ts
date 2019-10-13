export class DataTemplateType {
    id: string;
    name: string;
    type: string;
    fields?: any;
}

export class DataType {
    id: string;
    projectId: string;
    name: string;
    type: string;
    templateTypeId: string;
    template: DataTemplateType;
    templateFields: any;
    contents: any;
}
