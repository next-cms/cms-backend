export class Value {
    value: string | number | Value;
    start: number;
    end: number;
}

export class PageDetails {
    title: Value;
    components: [];
    hooks: [];
    effects: [];
}
