export class AvailableComponentInfo {
    id: string = "";
}

export class AvailableComponent extends AvailableComponentInfo{
    id: string = "";
    name: string = "";
    props: PropsType = {};
}

export class PropsType {
    [x: string]: {
        type: string,
        isRequired: boolean
    }
}
