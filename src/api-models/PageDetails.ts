export class Value {
    name: string;
    value: string | number | Component;
    start: number;
    end: number;
}

export class Component {
    name: string;
    start: number;
    end: number;
    attributes: Value[] = [];
    children: Component[] = [];
    constructor(name?: string, start?: number, end?: number, attributes: Value[] = [], children: Component[] = []){
        this.name = name;
        this.start = start;
        this.end = end;
        this.attributes = attributes;
        this.children = children;
    }
}

// export class PageHeader {
//     title: Value;
//     subtitle: Value;
//     extra: Component
// }

export class PageDetails {
    title: string;
    slug: string;
    children: Component[] = [];
    hooks: [] = [];
    effects: [] = [];
}
