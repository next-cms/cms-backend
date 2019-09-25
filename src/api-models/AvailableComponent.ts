export class AvailableComponentInfo {
    importSignature: string = "";
    name?: string = "";
    vendor?: string = "";
}

export class AvailableComponent extends AvailableComponentInfo{
    importSignature: string = "";
    name: string = "";
    vendor?: string = "";
    props: PropsType = {};
}

export class PropsType {
    [x: string]: {
        type: any,
        isRequired: boolean
    }
}
