export class AvailableComponentInfo {
    id: string = "";
    name?: string = "";
    vendor?: string = "";
}

export class AvailableComponent extends AvailableComponentInfo{
    id: string = "";
    name: string = "";
    vendor: string = "";
    props: PropsType = {};
}

export class PropsType {
    [x: string]: {
        type: string,
        isRequired: boolean
    }
}
