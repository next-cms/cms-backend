import {Value} from "./PageDetails";

export class AvailableComponentInfo {
    id: string;
    name?: string = "";
    vendor?: string = "";
}

export class AvailableComponent extends AvailableComponentInfo{
    id: string;
    importSignature: string = "";
    name: string = "";
    vendor?: string = "";
    props: PropsType = {};
}

export class PropsType {
    [x: string]: {
        type: any,
        isRequired: boolean,
        value?: Value
    }
}
